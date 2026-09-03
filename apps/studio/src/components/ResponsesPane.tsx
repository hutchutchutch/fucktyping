import { useEffect, useState } from "react";

import { useResponses } from "../responses/useResponses";

export function ResponsesPane({
  httpBase,
  token,
  formId,
}: {
  httpBase: string;
  token: string;
  formId: string | null;
}) {
  const [refreshRevision, setRefreshRevision] = useState(0);
  const { form, responses, loading, error } = useResponses(httpBase, token, formId, refreshRevision);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);
  const [minting, setMinting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setShareLink(null);
    setShareError(null);
    setCopied(false);
  }, [formId]);

  const createShareLink = async () => {
    if (!formId || minting) return;
    setMinting(true);
    setShareError(null);
    try {
      const response = await fetch(`${httpBase.replace(/\/$/, "")}/forms/${encodeURIComponent(formId)}/link`, {
        method: "POST",
        headers: { authorization: `Bearer ${token}` },
      });
      const value = await response.json() as Record<string, unknown>;
      if (!response.ok || typeof value.responderUrl !== "string") {
        throw new Error(typeof value.error === "string" ? value.error : `HTTP ${response.status}`);
      }
      setShareLink(value.responderUrl);
    } catch (cause) {
      setShareError(cause instanceof Error ? cause.message : "could not create share link");
    } finally {
      setMinting(false);
    }
  };

  const copyShareLink = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setShareError(null);
    } catch {
      setShareError("Could not copy the link. Open it and copy the address manually.");
    }
  };

  return (
    <main className="responses-pane">
      <header className="responses-head">
        <span>Responses{form ? ` · ${form.name}` : ""}</span>
        {formId && (
          <div className="responses-actions">
            <button type="button" onClick={() => setRefreshRevision((value) => value + 1)} disabled={loading}>
              Refresh
            </button>
            <button type="button" onClick={createShareLink} disabled={minting}>
              {minting ? "Creating…" : "Create share link"}
            </button>
          </div>
        )}
      </header>
      {shareLink && (
        <div className="responses-share">
          <a href={shareLink} target="_blank" rel="noreferrer">Open respondent form ↗</a>
          <button type="button" onClick={() => void copyShareLink()}>{copied ? "Copied" : "Copy link"}</button>
        </div>
      )}
      {shareError && <div className="responses-error" role="alert">Share link error: {shareError}</div>}
      {!formId && <div className="responses-empty">Select a published form from the sidebar.</div>}
      {formId && loading && <div className="responses-empty">Loading responses…</div>}
      {formId && error && <div className="responses-error" role="alert">Could not load responses: {error}</div>}
      {formId && !loading && !error && responses.length === 0 && (
        <div className="responses-empty">No completed responses yet.</div>
      )}
      {responses.length > 0 && (
        <ol className="response-list">
          {responses.map((response) => (
            <li key={response.id} className="response-card">
              <div className="response-meta">
                <time dateTime={response.createdAt}>{new Date(response.createdAt).toLocaleString()}</time>
                {response.sessionId && <span>Session {response.sessionId}</span>}
              </div>
              <dl>
                {Object.entries(response.answers).map(([questionId, answer]) => (
                  <div key={questionId}>
                    <dt>{form?.questions.find((question) => question.id === questionId)?.prompt ?? questionId}</dt>
                    <dd>{displayAnswer(answer)}</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}

function displayAnswer(answer: unknown): string {
  if (answer == null) return "—";
  if (typeof answer === "string" || typeof answer === "number" || typeof answer === "boolean") {
    return String(answer);
  }
  try {
    return JSON.stringify(answer);
  } catch {
    return "Unsupported answer";
  }
}
