import { useEffect, useRef, useState } from "react";

import type { ChatMessage } from "../authoring/types";
import type { SessionStatus } from "../authoring/useAuthoringSession";
import { MicButton } from "./MicButton";

interface Props {
  messages: ChatMessage[];
  status: SessionStatus;
  connectionError: string | null;
  ready: boolean;
  publishedFormId: string | null;
  publishedResponderUrl: string | null;
  publishedExpiresAt: string | null;
  edgeUrl: string;
  sessionToken: string;
  onSend: (text: string) => void;
  onPublish: () => void;
}

export function ChatPane({
  messages,
  status,
  connectionError,
  ready,
  publishedFormId,
  publishedResponderUrl,
  publishedExpiresAt,
  edgeUrl,
  sessionToken,
  onSend,
  onPublish,
}: Props) {
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  const submit = () => {
    const text = draft.trim();
    if (!text || status !== "open") return;
    onSend(text);
    setDraft("");
  };

  return (
    <main className="chat-pane">
      <header className="chat-head">
        <span className={`dot ${status}`} role="status" aria-label={`Authoring session ${status}`} />
        <span>Build a voice form</span>
        <button className="publish-btn" disabled={!ready} onClick={onPublish} title={ready ? "Publish form" : "Add a name, opening, closing, and a question first"}>
          Publish
        </button>
      </header>

      {connectionError && <div className="connection-error" role="alert">{connectionError}</div>}

      {publishedFormId && publishedResponderUrl && (
        <div className="published-banner">
          <span>Published ✓</span>
          <a href={publishedResponderUrl} target="_blank" rel="noreferrer">
            Open respondent form ↗
          </a>
          {publishedExpiresAt && (
            <span className="published-expiry">
              Link expires {new Date(publishedExpiresAt).toLocaleDateString()}
            </span>
          )}
        </div>
      )}

      <div className="messages">
        {messages.map((m, i) => (
          <div key={i} className={`bubble ${m.role}`}>
            {m.content}
          </div>
        ))}
        {status === "thinking" && <div className="bubble assistant thinking">…</div>}
        <div ref={endRef} />
      </div>

      <div className="composer">
        <MicButton httpBase={edgeUrl} token={sessionToken} onTranscript={(t) => setDraft((d) => (d ? `${d} ${t}` : t))} />
        <textarea
          value={draft}
          placeholder="Describe your form, or refine a question…"
          rows={1}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
        />
        <button className="send-btn" onClick={submit} disabled={!draft.trim() || status !== "open"}>
          Send
        </button>
      </div>
    </main>
  );
}
