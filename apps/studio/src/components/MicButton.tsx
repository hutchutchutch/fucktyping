import { useEffect, useRef, useState } from "react";

import { blobToSamples16k, samples16kToWav, TARGET_RATE } from "../authoring/audio";
import { dedupAppend, nextSegment } from "../authoring/recorder";
import { transcribeAudio } from "../authoring/transcribe";

/** How often (ms) we cut a rolling segment off the live recording and send it
 *  for transcription, so text appears progressively while the user speaks. */
const SEGMENT_MS = 3500;
/** Seconds of audio re-sent at each segment boundary so words straddling the
 *  cut are transcribed whole; the text dedup removes the repeat. */
const OVERLAP_SEC = 0.5;
/** Don't bother transcribing a tail shorter than this (avoids junk on tiny tics). */
const MIN_NEW_SEC = 0.6;
const MAX_RECORDING_MS = 60_000;

/** Push-to-talk for form creation. Workers AI Whisper is one-shot (not a
 *  streaming model), so we approximate streaming: while recording we collect
 *  webm chunks into a growing buffer and, on a timer, decode the whole buffer
 *  and transcribe only the not-yet-transcribed tail (with a small backwards
 *  overlap). Each segment's *novel* text is handed to onTranscript, which the
 *  composer appends — so the input fills in progressively. On stop we flush the
 *  final tail. The realtime WebRTC path is for form *filling*. */
export function MicButton({ httpBase, token, onTranscript }: { httpBase: string; token: string; onTranscript: (text: string) => void }) {
  const [supported, setSupported] = useState(true);
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const mimeRef = useRef<string>("audio/webm");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sample cursor + running transcript, kept in refs so the async pump reads
  // live values without re-creating callbacks.
  const cursorRef = useRef(0);
  const runningRef = useRef("");
  // Serialize transcription so overlapping ticks can't reorder/duplicate text.
  const pumpingRef = useRef(false);

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setSupported(false);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (maxTimerRef.current) clearTimeout(maxTimerRef.current);
      const recorder = recRef.current;
      if (recorder && recorder.state !== "inactive") {
        recorder.ondataavailable = null;
        recorder.onstop = null;
        recorder.stop();
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  /** Decode everything captured so far and transcribe the fresh tail. Serialized
   *  via pumpingRef; `final` forces a flush even below the min-new threshold. */
  const pump = async (final: boolean) => {
    if (pumpingRef.current) return;
    if (chunksRef.current.length === 0) return;
    pumpingRef.current = true;
    try {
      const blob = new Blob(chunksRef.current, { type: mimeRef.current });
      const samples = await blobToSamples16k(blob);
      const seg = nextSegment(samples.length, TARGET_RATE, cursorRef.current, {
        overlapSec: OVERLAP_SEC,
        minNewSec: final ? 0 : MIN_NEW_SEC,
      });
      if (!seg) return;

      const slice = samples.subarray(seg.start, seg.end);
      const text = await transcribeAudio(httpBase, samples16kToWav(slice), token);
      // Advance the cursor regardless of dedup outcome so we don't re-send audio.
      cursorRef.current = seg.end;

      const { emit, running } = dedupAppend(runningRef.current, text);
      runningRef.current = running;
      if (emit) onTranscript(emit);
    } catch (err) {
      console.error("segment transcription failed", err);
      setError(err instanceof Error ? err.message : "Transcription failed. Please try again.");
    } finally {
      pumpingRef.current = false;
    }
  };

  const start = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const rec = new MediaRecorder(stream);
      mimeRef.current = rec.mimeType || "audio/webm";
      chunksRef.current = [];
      cursorRef.current = 0;
      runningRef.current = "";
      pumpingRef.current = false;

      rec.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      rec.onstop = async () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        if (maxTimerRef.current) {
          clearTimeout(maxTimerRef.current);
          maxTimerRef.current = null;
        }
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setBusy(true);
        try {
          // Wait out any in-flight segment, then flush the remaining tail.
          while (pumpingRef.current) await new Promise((r) => setTimeout(r, 50));
          await pump(true);
        } finally {
          setBusy(false);
        }
      };

      // timeslice => periodic ondataavailable so the growing buffer stays fresh.
      rec.start(1000);
      recRef.current = rec;
      timerRef.current = setInterval(() => void pump(false), SEGMENT_MS);
      maxTimerRef.current = setTimeout(() => {
        if (rec.state !== "inactive") rec.stop();
        setRecording(false);
      }, MAX_RECORDING_MS);
      setRecording(true);
    } catch (err) {
      console.error("microphone unavailable", err);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setError("Microphone unavailable. You can type your request instead.");
      setRecording(false);
    }
  };

  const stop = () => {
    recRef.current?.stop();
    setRecording(false);
  };

  if (!supported) return null;

  return (
    <div className="mic-control">
      <button
        type="button"
        className={`mic-btn${recording ? " listening" : ""}`}
        onClick={() => (recording ? stop() : start())}
        disabled={busy}
        title={busy ? "Transcribing…" : recording ? "Stop & transcribe" : "Speak"}
        aria-label="Voice input"
        aria-describedby={error ? "creator-mic-error" : undefined}
      >
        {busy ? "…" : recording ? "● rec" : "🎤"}
      </button>
      {error && <span id="creator-mic-error" className="mic-error" role="alert">{error}</span>}
    </div>
  );
}
