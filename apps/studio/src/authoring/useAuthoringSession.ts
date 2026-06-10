import { useCallback, useEffect, useRef, useState } from "react";

import { initMsg, parseServerMessage, publishMsg, toWsUrl, userMsg } from "./protocol";
import type { ChatMessage, DraftFormConfig } from "./types";

export type SessionStatus = "connecting" | "open" | "thinking" | "closed";

export interface AuthoringSession {
  form: DraftFormConfig | null;
  messages: ChatMessage[];
  ready: boolean;
  status: SessionStatus;
  publishedFormId: string | null;
  sendMessage: (text: string) => void;
  publish: () => void;
}

/** Opens the WS to the authoring DO, syncs snapshots into React state, and exposes
 *  send/publish. The DO broadcasts the full snapshot on every change, so the chat and
 *  graph panes always render the same source of truth. */
export function useAuthoringSession(httpBase: string, sessionId: string, token?: string): AuthoringSession {
  const [form, setForm] = useState<DraftFormConfig | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<SessionStatus>("connecting");
  const [publishedFormId, setPublishedFormId] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const q = token ? `?token=${encodeURIComponent(token)}` : "";
    const url = `${toWsUrl(httpBase)}/authoring/${sessionId}/session${q}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("open");
      ws.send(initMsg());
    };
    ws.onclose = () => setStatus("closed");
    ws.onerror = () => setStatus("closed");
    ws.onmessage = (event) => {
      const msg = parseServerMessage(event.data);
      if (!msg) return;
      switch (msg.type) {
        case "snapshot":
          setForm(msg.form);
          setMessages(msg.messages);
          setReady(msg.ready);
          setStatus("open");
          break;
        case "thinking":
          setStatus("thinking");
          break;
        case "published":
          setPublishedFormId(msg.formId);
          break;
        case "error":
          setMessages((prev) => [...prev, { role: "assistant", content: `⚠ ${msg.message}` }]);
          setStatus("open");
          break;
      }
    };

    return () => ws.close();
  }, [httpBase, sessionId, token]);

  const sendMessage = useCallback((text: string) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN || !text.trim()) return;
    setMessages((prev) => [...prev, { role: "user", content: text }]); // optimistic; snapshot reconciles
    setStatus("thinking");
    ws.send(userMsg(text));
  }, []);

  const publish = useCallback(() => {
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) ws.send(publishMsg());
  }, []);

  return { form, messages, ready, status, publishedFormId, sendMessage, publish };
}
