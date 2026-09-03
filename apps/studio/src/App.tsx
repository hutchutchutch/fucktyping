import { useMemo, useState } from "react";
import type { FormEvent } from "react";

import { createCreatorSession } from "./authoring/creatorAuth";
import {
  clearCreatorToken,
  getOrCreateSessionId,
  getStoredCreatorToken,
  storeCreatorToken,
} from "./authoring/sessionStore";
import { useAuthoringSession } from "./authoring/useAuthoringSession";
import { useForms } from "./authoring/useForms";
import { ChatPane } from "./components/ChatPane";
import { GraphPane } from "./components/GraphPane";
import { LeftSidebar } from "./components/LeftSidebar";
import { ResponsesPane } from "./components/ResponsesPane";

// Production is served by the Edge Worker, so APIs and WebSockets are same-origin.
// Local Vite development still talks to `wrangler dev` unless explicitly overridden.
const EDGE_URL =
  import.meta.env.VITE_EDGE_URL ??
  (import.meta.env.DEV ? "http://localhost:8787" : window.location.origin);
export function App() {
  const sessionId = useMemo(() => getOrCreateSessionId(window.localStorage), []);
  const [sessionToken, setSessionToken] = useState<string | null>(
    () => getStoredCreatorToken(window.sessionStorage, sessionId),
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
  const { forms, loading: formsLoading, error: formsError } = useForms(EDGE_URL, sessionToken, session.publishRevision);
  const [view, setView] = useState<"builder" | "responses">("builder");
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);

  return (
    <div className="app">
      <LeftSidebar
        forms={forms}
        formsLoading={formsLoading}
        formsError={formsError}
        selectedFormId={selectedFormId}
        onNewForm={() => {
          session.newForm();
          setView("builder");
          setSelectedFormId(null);
        }}
        onShowResponses={() => {
          if (!selectedFormId && forms[0]) setSelectedFormId(forms[0].id);
          setView("responses");
        }}
        onSelectForm={(formId) => {
          setSelectedFormId(formId);
          setView("responses");
        }}
        onEditForm={(formId) => {
          session.loadForm(formId);
          setSelectedFormId(formId);
          setView("builder");
        }}
      />
      {view === "builder" ? (
        <>
          <ChatPane
            messages={session.messages}
            status={session.status}
            connectionError={session.connectionError}
            ready={session.ready}
            publishedFormId={session.publishedFormId}
            publishedResponderUrl={session.publishedResponderUrl}
            publishedExpiresAt={session.publishedExpiresAt}
            edgeUrl={EDGE_URL}
            sessionToken={sessionToken}
            onSend={session.sendMessage}
            onPublish={session.publish}
          />
          <GraphPane form={session.form} onEdit={session.sendMessage} />
        </>
      ) : (
        <ResponsesPane httpBase={EDGE_URL} token={sessionToken} formId={selectedFormId} />
      )}
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
