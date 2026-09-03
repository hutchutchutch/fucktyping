import { useCallback, useEffect, useRef, useState } from "react";

import { toWsUrl, websocketProtocols } from "../authoring/protocol";
import { parseResponderMessage } from "./protocol";

export interface ResponderTurn {
  role: "assistant" | "user";
  text: string;
}
export type ResponderStatus = "connecting" | "open" | "thinking" | "done" | "closed";

/** Drives the runtime form-filling protocol (do/protocol.ts):
 *  client {type:"start"} | {type:"user_answer",text}  <->  server {type:"assistant",text,done}. */
export function useResponderSession(httpBase: string, formId: string, sessionId?: string, token?: string) {
  const [turns, setTurns] = useState<ResponderTurn[]>([]);
  const [question, setQuestion] = useState("");
  const [done, setDone] = useState(false);
  const [status, setStatus] = useState<ResponderStatus>("connecting");
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    if (!formId || !sessionId || !token) {
      setStatus("closed");
      return;
    }
    let disposed = false;
    let attempts = 0;
    let reconnectTimer: number | undefined;

    const connect = () => {
      if (disposed || doneRef.current) return;
      setStatus("connecting");
      const params = new URLSearchParams({ session: sessionId });
      const url = `${toWsUrl(httpBase)}/forms/${formId}/session?${params}`;
      const ws = new WebSocket(url, websocketProtocols(token));
      wsRef.current = ws;

      ws.onopen = () => {
        attempts = 0;
        setConnectionError(null);
        setStatus("open");
        ws.send(JSON.stringify({ type: "start" }));
      };
      ws.onmessage = (event) => {
        const message = parseResponderMessage(event.data);
        if (!message) return;
        setTurns((turns) => {
          const previous = turns[turns.length - 1];
          return previous?.role === "assistant" && previous.text === message.text
            ? turns
            : [...turns, { role: "assistant", text: message.text }];
        });
        setQuestion(message.text);
        if (message.done) {
          doneRef.current = true;
          setDone(true);
          setStatus("done");
        } else {
          setStatus("open");
        }
      };
      ws.onerror = () => ws.close();
      ws.onclose = (event) => {
        if (disposed || doneRef.current) return;
        setStatus("closed");
        if (event.code === 1008) {
          setConnectionError("This response link has expired. Ask the form owner for a new link.");
          return;
        }
        if (attempts >= 6) {
          setConnectionError("Unable to connect to this form. Check your connection and reload to try again.");
          return;
        }
        const delay = Math.min(1_000 * 2 ** attempts, 10_000);
        attempts += 1;
        reconnectTimer = window.setTimeout(connect, delay);
      };
    };

    connect();
    return () => {
      disposed = true;
      if (reconnectTimer !== undefined) window.clearTimeout(reconnectTimer);
      wsRef.current?.close();
    };
  }, [httpBase, formId, sessionId, token]);

  const sendAnswer = useCallback((text: string) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN || !text.trim()) return;
    setTurns((t) => [...t, { role: "user", text }]);
    setStatus("thinking");
    ws.send(JSON.stringify({ type: "user_answer", text }));
  }, []);

  return { turns, question, done, status, connectionError, sendAnswer };
}
