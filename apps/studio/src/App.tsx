import { useMemo } from "react";

import { getOrCreateSessionId, subFromToken } from "./authoring/sessionStore";
import { useAuthoringSession } from "./authoring/useAuthoringSession";
import { useForms } from "./authoring/useForms";
import { ChatPane } from "./components/ChatPane";
import { GraphPane } from "./components/GraphPane";
import { LeftSidebar } from "./components/LeftSidebar";

// Base URL of the apps/edge Worker (http/https; converted to ws/wss internally).
const EDGE_URL = (import.meta as any).env?.VITE_EDGE_URL ?? "http://localhost:8787";
// Optional WS auth token (only needed once SESSION_SECRET is set on the edge).
const SESSION_TOKEN = (import.meta as any).env?.VITE_SESSION_TOKEN as string | undefined;

export function App() {
  // When the worker enforces auth, the sessionId must equal the token's sub; otherwise
  // use a stable per-browser id that resumes the same draft across reloads.
  const sessionId = useMemo(
    () => (SESSION_TOKEN && subFromToken(SESSION_TOKEN)) || getOrCreateSessionId(window.localStorage),
    [],
  );
  const session = useAuthoringSession(EDGE_URL, sessionId, SESSION_TOKEN);
  const { forms } = useForms(EDGE_URL);

  return (
    <div className="app">
      <LeftSidebar forms={forms} />
      <ChatPane
        messages={session.messages}
        status={session.status}
        ready={session.ready}
        publishedFormId={session.publishedFormId}
        edgeUrl={EDGE_URL}
        onSend={session.sendMessage}
        onPublish={session.publish}
      />
      <GraphPane form={session.form} onEdit={session.sendMessage} />
    </div>
  );
}
