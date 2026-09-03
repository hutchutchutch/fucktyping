import { useEffect, useState } from "react";

export interface StoredResponse {
  id: string;
  formId: string;
  sessionId: string | null;
  answers: Record<string, unknown>;
  createdAt: string;
}

export interface ResponseForm {
  id: string;
  name: string;
  questions: { id: string; prompt: string }[];
}

export interface ResponsesPayload {
  form: ResponseForm;
  responses: StoredResponse[];
}

export function useResponses(httpBase: string, token: string, formId: string | null, refreshKey = 0) {
  const [responses, setResponses] = useState<StoredResponse[]>([]);
  const [form, setForm] = useState<ResponseForm | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!formId) {
      setResponses([]);
      setForm(null);
      return;
    }
    let cancelled = false;
    setForm(null);
    setResponses([]);
    setLoading(true);
    setError(null);
    fetch(`${httpBase.replace(/\/$/, "")}/forms/${encodeURIComponent(formId)}/responses`, {
      headers: { authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json() as unknown;
      })
      .then((value) => {
        const parsed = parseResponsesPayload(value);
        if (!parsed) throw new Error("invalid response data");
        if (!cancelled) {
          setForm(parsed.form);
          setResponses(parsed.responses);
        }
      })
      .catch((cause) => {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "failed to load responses");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [formId, httpBase, token, refreshKey]);

  return { form, responses, loading, error };
}

export function parseResponsesPayload(value: unknown): ResponsesPayload | null {
  const payload = record(value);
  const form = record(payload?.form);
  if (
    !payload
    || !form
    || typeof form.id !== "string"
    || typeof form.name !== "string"
    || !Array.isArray(form.questions)
    || !Array.isArray(payload.responses)
  ) return null;

  const questions: ResponseForm["questions"] = [];
  for (const item of form.questions) {
    const question = record(item);
    if (!question || typeof question.id !== "string" || typeof question.prompt !== "string") return null;
    questions.push({ id: question.id, prompt: question.prompt });
  }

  const responses: StoredResponse[] = [];
  for (const item of payload.responses) {
    const response = record(item);
    const answers = record(response?.answers);
    if (
      !response
      || typeof response.id !== "string"
      || typeof response.formId !== "string"
      || (response.sessionId !== null && typeof response.sessionId !== "string")
      || !answers
      || typeof response.createdAt !== "string"
      || !Number.isFinite(Date.parse(response.createdAt))
    ) return null;
    responses.push({
      id: response.id,
      formId: response.formId,
      sessionId: response.sessionId,
      answers,
      createdAt: response.createdAt,
    });
  }

  return { form: { id: form.id, name: form.name, questions }, responses };
}

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}
