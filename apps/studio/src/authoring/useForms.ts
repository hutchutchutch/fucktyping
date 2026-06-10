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
export function useForms(httpBase: string): UseForms {
  const [forms, setForms] = useState<FormSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`${httpBase.replace(/\/$/, "")}/forms`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return (await res.json()) as FormSummary[];
      })
      .then((data) => {
        if (!cancelled) setForms(Array.isArray(data) ? data : []);
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
  }, [httpBase]);

  return { forms, loading, error };
}
