import { useEffect, useRef, useState } from "react";

import type { ChatMessage } from "../authoring/types";
import type { SessionStatus } from "../authoring/useAuthoringSession";
import { MicButton } from "./MicButton";

interface Props {
  messages: ChatMessage[];
  status: SessionStatus;
  ready: boolean;
  publishedFormId: string | null;
  edgeUrl: string;
  onSend: (text: string) => void;
  onPublish: () => void;
}

export function ChatPane({ messages, status, ready, publishedFormId, edgeUrl, onSend, onPublish }: Props) {
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft("");
  };

  return (
    <main className="chat-pane">
      <header className="chat-head">
        <span className={`dot ${status}`} />
        <span>Build a voice form</span>
        <button className="publish-btn" disabled={!ready} onClick={onPublish} title={ready ? "Publish form" : "Add a name, opening, closing, and a question first"}>
          Publish
        </button>
      </header>

      {publishedFormId && (
        <div className="published-banner">
          Published ✓ — runnable at <code>/forms/{publishedFormId}/session</code>
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
        <MicButton httpBase={edgeUrl} onTranscript={(t) => setDraft((d) => (d ? `${d} ${t}` : t))} />
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
        <button className="send-btn" onClick={submit} disabled={!draft.trim()}>
          Send
        </button>
      </div>
    </main>
  );
}
