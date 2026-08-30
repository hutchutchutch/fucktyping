import { useEffect, useMemo, useRef, useState } from "react";

import { blobToWav16k } from "../authoring/audio";
import { transcribeAudio } from "../authoring/transcribe";
import { useResponderSession } from "./useResponderSession";

const EDGE_URL =
  (import.meta as any).env?.VITE_EDGE_URL ??
  ((import.meta as any).env?.DEV ? "http://localhost:8787" : window.location.origin);

/** Voice form-filling page opened from a Discord link: the agent speaks each question
 *  (browser TTS), you answer by voice (MediaRecorder -> Whisper -> answer), and the
 *  worker captures the structured output + fires the completion callback. */
export function Responder() {
  const { formId, token } = useMemo(() => {
    const m = window.location.pathname.match(/\/respond\/([^/]+)/);
    return { formId: m?.[1] ?? "", token: new URLSearchParams(window.location.search).get("token") ?? undefined };
  }, []);

  const session = useResponderSession(EDGE_URL, formId, token);

  // Speak each new question aloud.
  const lastSpoken = useRef("");
  useEffect(() => {
    if (session.question && session.question !== lastSpoken.current && "speechSynthesis" in window) {
      lastSpoken.current = session.question;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(session.question));
    }
  }, [session.question]);

  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunks.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size) chunks.current.push(e.data);
      };
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setBusy(true);
        try {
          const wav = await blobToWav16k(new Blob(chunks.current, { type: rec.mimeType || "audio/webm" }));
          const text = await transcribeAudio(EDGE_URL, wav);
          if (text.trim()) session.sendAnswer(text.trim());
        } catch (err) {
          console.error("answer transcription failed", err);
        } finally {
          setBusy(false);
        }
      };
      rec.start();
      recRef.current = rec;
      setRecording(true);
    } catch (err) {
      console.error("microphone unavailable", err);
    }
  };
  const stop = () => {
    recRef.current?.stop();
    setRecording(false);
  };

  if (!formId) return <div className="responder">Invalid link.</div>;

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
              className={`responder-mic${recording ? " recording" : ""}`}
              disabled={busy || session.status !== "open"}
              onClick={() => (recording ? stop() : start())}
            >
              {busy ? "Transcribing…" : recording ? "● Stop & send" : "🎤 Tap to answer"}
            </button>
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
