import { useEffect, useMemo, useRef, useState } from "react";

import { blobToWav16k } from "../authoring/audio";
import { transcribeAudio } from "../authoring/transcribe";
import { resolveResponderAccess } from "./sessionStore";
import { useResponderSession } from "./useResponderSession";

const EDGE_URL =
  import.meta.env.VITE_EDGE_URL ??
  (import.meta.env.DEV ? "http://localhost:8787" : window.location.origin);
const MAX_RECORDING_MS = 60_000;

/** Voice form-filling page opened from a Discord link: the agent speaks each question
 *  (browser TTS), you answer by voice (MediaRecorder -> Whisper -> answer), and the
 *  worker captures the structured output + fires the completion callback. */
export function Responder() {
  const { formId, incomingToken } = useMemo(() => {
    const m = window.location.pathname.match(/\/respond\/([^/]+)/);
    const fragmentToken = new URLSearchParams(window.location.hash.replace(/^#/, "")).get("token");
    return { formId: m?.[1] ?? "", incomingToken: fragmentToken ?? undefined };
  }, []);
  const access = useMemo(
    () => resolveResponderAccess(window.sessionStorage, formId, incomingToken),
    [formId, incomingToken],
  );

  // Remove bearer material from the visible/shareable URL after capturing it.
  useEffect(() => {
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  const session = useResponderSession(EDGE_URL, formId, access?.sessionId, access?.token);

  // Speak each new question aloud.
  const lastSpoken = useRef("");
  useEffect(() => {
    if (session.question && session.question !== lastSpoken.current && "speechSynthesis" in window) {
      lastSpoken.current = session.question;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(session.question));
    }
  }, [session.question]);
  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState("");
  const recRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const maxTimerRef = useRef<number | null>(null);
  const chunks = useRef<Blob[]>([]);

  useEffect(() => () => {
    if (maxTimerRef.current !== null) window.clearTimeout(maxTimerRef.current);
    const recorder = recRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.ondataavailable = null;
      recorder.onstop = null;
      recorder.stop();
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const start = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const rec = new MediaRecorder(stream);
      chunks.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size) chunks.current.push(e.data);
      };
      rec.onstop = async () => {
        if (maxTimerRef.current !== null) {
          window.clearTimeout(maxTimerRef.current);
          maxTimerRef.current = null;
        }
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setBusy(true);
        try {
          const wav = await blobToWav16k(new Blob(chunks.current, { type: rec.mimeType || "audio/webm" }));
          if (!access?.token) throw new Error("missing response token");
          const text = await transcribeAudio(EDGE_URL, wav, access.token);
          if (!text.trim()) throw new Error("No speech was detected. Try again or type your answer.");
          session.sendAnswer(text.trim());
        } catch (err) {
          console.error("answer transcription failed", err);
          setError(err instanceof Error ? err.message : "Could not transcribe that answer.");
        } finally {
          setBusy(false);
        }
      };
      rec.start();
      recRef.current = rec;
      maxTimerRef.current = window.setTimeout(() => {
        if (rec.state !== "inactive") rec.stop();
        setRecording(false);
      }, MAX_RECORDING_MS);
      setRecording(true);
    } catch (err) {
      console.error("microphone unavailable", err);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setError("Microphone unavailable. You can type your answer below.");
      setRecording(false);
    }
  };
  const stop = () => {
    recRef.current?.stop();
    setRecording(false);
  };

  const submitTypedAnswer = () => {
    const answer = typedAnswer.trim();
    if (!answer || session.status !== "open") return;
    session.sendAnswer(answer);
    setTypedAnswer("");
    setError(null);
  };

  if (!formId) return <div className="responder">Invalid link.</div>;
  if (!access) return <div className="responder">Invalid or expired link.</div>;

  return (
    <div className="responder">
      <div className="responder-card">
        <div className={`responder-status ${session.status}`}>{session.status}</div>
        {session.done ? (
          <div className="responder-done">
            <h2>All done ✓</h2>
            <p>Your answers were captured and sent back.</p>
          </div>
        ) : (
          <>
            <div className="responder-question">{session.question || "Connecting…"}</div>
            <button
              type="button"
              className={`responder-mic${recording ? " recording" : ""}`}
              disabled={busy || session.status !== "open"}
              onClick={() => (recording ? stop() : start())}
            >
              {busy ? "Transcribing…" : recording ? "● Stop & send" : "🎤 Tap to answer"}
            </button>
            <form
              className="responder-typed"
              onSubmit={(event) => {
                event.preventDefault();
                submitTypedAnswer();
              }}
            >
              <label htmlFor="typed-answer">Or type your answer</label>
              <div>
                <input
                  id="typed-answer"
                  value={typedAnswer}
                  onChange={(event) => setTypedAnswer(event.target.value)}
                  maxLength={5000}
                  autoComplete="off"
                />
                <button type="submit" disabled={!typedAnswer.trim() || session.status !== "open"}>Send</button>
              </div>
            </form>
            {(error || session.connectionError) && (
              <div className="responder-error" role="alert">{error ?? session.connectionError}</div>
            )}
          </>
        )}
        <div className="responder-transcript">
          {session.turns.map((t, i) => (
            <div key={i} className={`rt ${t.role}`}>{t.text}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
