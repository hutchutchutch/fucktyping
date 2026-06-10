import { useCallback, useEffect, useRef, useState } from "react";

import { toWsUrl } from "../authoring/protocol";

export interface ResponderTurn {
  role: "assistant" | "user";
  text: string;
}
export type ResponderStatus = "connecting" | "open" | "thinking" | "done" | "closed";

/** Drives the runtime form-filling protocol (do/protocol.ts):
 *  client {type:"start"} | {type:"user_answer",text}  <->  server {type:"assistant",text,done}. */
export function useResponderSession(httpBase: string, formId: string, token?: string) {
  const [turns, setTurns] = useState<ResponderTurn[]>([]);
  const [question, setQuestion] = useState("");
  const [done, setDone] = useState(false);
  const [status, setStatus] = useState<ResponderStatus>("connecting");
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!formId) return;
    const sessionId = crypto.randomUUID();
    const q = token ? `&token=${encodeURIComponent(token)}` : "";
    const url = `${toWsUrl(httpBase)}/forms/${formId}/session?session=${sessionId}${q}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("open");
      ws.send(JSON.stringify({ type: "start", form_id: formId }));
    };
    ws.onclose = () => setStatus((s) => (s === "done" ? s : "closed"));
    ws.onerror = () => setStatus((s) => (s === "done" ? s : "closed"));
    ws.onmessage = (event) => {
      let m: any;
      try {
        m = JSON.parse(event.data);
      } catch {
        return;
      }
      if (m.type === "assistant") {
        setTurns((t) => [...t, { role: "assistant", text: m.text }]);
        setQuestion(m.text);
        if (m.done) {
          setDone(true);
          setStatus("done");
        } else {
          setStatus("open");
        }
      }
    };
    return () => ws.close();
  }, [httpBase, formId, token]);

  const sendAnswer = useCallback((text: string) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN || !text.trim()) return;
    setTurns((t) => [...t, { role: "user", text }]);
    setStatus("thinking");
    ws.send(JSON.stringify({ type: "user_answer", text }));
  }, []);

  return { turns, question, done, status, sendAnswer };
}
