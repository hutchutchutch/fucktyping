import { useMemo, useState } from "react";
import type { FormEvent } from "react";

import { createCreatorSession } from "./authoring/creatorAuth";
import {
  clearCreatorToken,
  getOrCreateSessionId,
  getStoredCreatorToken,
  storeCreatorToken,
  subFromToken,
} from "./authoring/sessionStore";
import { useAuthoringSession } from "./authoring/useAuthoringSession";
import { useForms } from "./authoring/useForms";
import { ChatPane } from "./components/ChatPane";
import { GraphPane } from "./components/GraphPane";
import { LeftSidebar } from "./components/LeftSidebar";

// Production is served by the Edge Worker, so APIs and WebSockets are same-origin.
// Local Vite development still talks to `wrangler dev` unless explicitly overridden.
const EDGE_URL =
  (import.meta as any).env?.VITE_EDGE_URL ??
  ((import.meta as any).env?.DEV ? "http://localhost:8787" : window.location.origin);
// Optional WS auth token (only needed once SESSION_SECRET is set on the edge).
const BUILD_SESSION_TOKEN = (import.meta as any).env?.VITE_SESSION_TOKEN as string | undefined;

export function App() {
  const sessionId = useMemo(
    () => (BUILD_SESSION_TOKEN && subFromToken(BUILD_SESSION_TOKEN)) || getOrCreateSessionId(window.localStorage),
    [],
  );
  const [sessionToken, setSessionToken] = useState<string | null>(
    () => BUILD_SESSION_TOKEN || getStoredCreatorToken(window.sessionStorage, sessionId),
  );

  if (!sessionToken) {
    return (
      <CreatorLogin
        onSubmit={async (accessToken) => {
          const session = await createCreatorSession(EDGE_URL, accessToken, sessionId);
          storeCreatorToken(window.sessionStorage, session.token);
          setSessionToken(session.token);
        }}
      />
    );
  }

  return (
    <AuthoringStudio
      sessionId={sessionId}
      sessionToken={sessionToken}
      onLock={() => {
        clearCreatorToken(window.sessionStorage);
        setSessionToken(null);
      }}
    />
  );
}

function AuthoringStudio({ sessionId, sessionToken, onLock }: { sessionId: string; sessionToken: string; onLock: () => void }) {
  const session = useAuthoringSession(EDGE_URL, sessionId, sessionToken);
  const { forms } = useForms(EDGE_URL, sessionToken);

  return (
    <div className="app">
      <LeftSidebar forms={forms} />
      <ChatPane
        messages={session.messages}
        status={session.status}
        ready={session.ready}
        publishedFormId={session.publishedFormId}
        edgeUrl={EDGE_URL}
        sessionToken={sessionToken}
        onSend={session.sendMessage}
        onPublish={session.publish}
      />
      <GraphPane form={session.form} onEdit={session.sendMessage} />
      <button className="lock-studio" type="button" onClick={onLock}>Lock studio</button>
    </div>
  );
}

function CreatorLogin({ onSubmit }: { onSubmit: (accessToken: string) => Promise<void> }) {
  const [accessToken, setAccessToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!accessToken || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onSubmit(accessToken);
      setAccessToken("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "authentication failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="creator-login">
      <form className="creator-login-card" onSubmit={submit}>
        <div className="creator-login-mark" aria-hidden="true">⌁</div>
        <div>
          <h1>FuckTyping Studio</h1>
          <p>Private beta. Enter your creator access key to continue.</p>
        </div>
        <label htmlFor="creator-access-key">Creator access key</label>
        <input
          id="creator-access-key"
          type="password"
          autoComplete="current-password"
          autoFocus
          value={accessToken}
          onChange={(event) => setAccessToken(event.target.value)}
        />
        {error && <div className="creator-login-error" role="alert">{error}</div>}
        <button type="submit" disabled={!accessToken || busy}>{busy ? "Checking…" : "Enter studio"}</button>
      </form>
    </main>
  );
}
