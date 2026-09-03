import { useEffect, useState } from "react";

export interface FormSummary {
  id: string;
  name: string;
  created_at: string;
}

export interface UseForms {
  forms: FormSummary[];
  loading: boolean;
  error: string | null;
}

/** Fetches the published-forms list (`GET ${httpBase}/forms`) for the "My forms" sidebar. */
export function useForms(httpBase: string, token: string, refreshKey = 0): UseForms {
  const [forms, setForms] = useState<FormSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`${httpBase.replace(/\/$/, "")}/forms`, {
      headers: { authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json() as unknown;
      })
      .then((value) => {
        const data = parseFormSummaries(value);
        if (!data) throw new Error("invalid forms data");
        if (!cancelled) setForms(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "failed to load forms");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [httpBase, token, refreshKey]);

  return { forms, loading, error };
}

export function parseFormSummaries(value: unknown): FormSummary[] | null {
  if (!Array.isArray(value)) return null;
  const forms: FormSummary[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return null;
    const form = item as Record<string, unknown>;
    if (
      typeof form.id !== "string"
      || typeof form.name !== "string"
      || typeof form.created_at !== "string"
      || !Number.isFinite(Date.parse(form.created_at))
    ) return null;
    forms.push({ id: form.id, name: form.name, created_at: form.created_at });
  }
  return forms;
}
