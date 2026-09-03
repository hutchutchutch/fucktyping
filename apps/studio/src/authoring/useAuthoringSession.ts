import { useCallback, useEffect, useRef, useState } from "react";

import { initMsg, loadFormMsg, newFormMsg, parseServerMessage, publishMsg, toWsUrl, userMsg, websocketProtocols } from "./protocol";
import type { ChatMessage, DraftFormConfig } from "./types";

export type SessionStatus = "connecting" | "open" | "thinking" | "closed";

export interface AuthoringSession {
  form: DraftFormConfig | null;
  messages: ChatMessage[];
  ready: boolean;
  status: SessionStatus;
  publishedFormId: string | null;
  publishedResponderUrl: string | null;
  publishedExpiresAt: string | null;
  connectionError: string | null;
  publishRevision: number;
  sendMessage: (text: string) => void;
  publish: () => void;
  newForm: () => void;
  loadForm: (formId: string) => void;
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
  const [publishedResponderUrl, setPublishedResponderUrl] = useState<string | null>(null);
  const [publishedExpiresAt, setPublishedExpiresAt] = useState<string | null>(null);
  const [publishRevision, setPublishRevision] = useState(0);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("closed");
      return;
    }
    let disposed = false;
    let attempts = 0;
    let reconnectTimer: number | undefined;

    const connect = () => {
      if (disposed) return;
      setStatus("connecting");
      const url = `${toWsUrl(httpBase)}/authoring/${sessionId}/session`;
      const ws = new WebSocket(url, websocketProtocols(token));
      wsRef.current = ws;

      ws.onopen = () => {
        attempts = 0;
        setConnectionError(null);
        setStatus("open");
        ws.send(initMsg());
      };
      ws.onclose = (event) => {
        if (disposed) return;
        setStatus("closed");
        if (event.code === 1008) {
          setConnectionError("Your creator session expired. Lock Studio and sign in again.");
          return;
        }
        if (attempts >= 6) {
          setConnectionError("Studio could not reconnect. Reload the page to try again.");
          return;
        }
        const delay = Math.min(1_000 * 2 ** attempts, 10_000);
        attempts += 1;
        reconnectTimer = window.setTimeout(connect, delay);
      };
      ws.onerror = () => ws.close();
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
            setPublishedResponderUrl(msg.responderUrl);
            setPublishedExpiresAt(msg.expiresAt);
            setPublishRevision((revision) => revision + 1);
            break;
          case "error":
            setMessages((prev) => [...prev, { role: "assistant", content: `⚠ ${msg.message}` }]);
            setStatus("open");
            break;
        }
      };
    };

    connect();
    return () => {
      disposed = true;
      if (reconnectTimer !== undefined) window.clearTimeout(reconnectTimer);
      wsRef.current?.close();
    };
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

  const newForm = useCallback(() => {
    const ws = wsRef.current;
    if (ws?.readyState !== WebSocket.OPEN) return;
    setPublishedFormId(null);
    setPublishedResponderUrl(null);
    setPublishedExpiresAt(null);
    ws.send(newFormMsg());
  }, []);

  const loadForm = useCallback((formId: string) => {
    const ws = wsRef.current;
    if (ws?.readyState !== WebSocket.OPEN) return;
    setPublishedFormId(null);
    setPublishedResponderUrl(null);
    setPublishedExpiresAt(null);
    ws.send(loadFormMsg(formId));
  }, []);

  return {
    form,
    messages,
    ready,
    status,
    publishedFormId,
    publishedResponderUrl,
    publishedExpiresAt,
    publishRevision,
    connectionError,
    sendMessage,
    publish,
    newForm,
    loadForm,
  };
}
