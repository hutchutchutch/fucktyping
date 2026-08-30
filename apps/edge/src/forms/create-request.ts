import type { Env } from "../env";
import { createFormFromBrief } from "./create";
import { FormConfigSchema, type FormConfig } from "./types";

export type CreateFormBodyResult =
  | { ok: true; config: FormConfig }
  | { ok: false; status: number; error: string; issues?: unknown };

export async function formConfigFromCreateBody(env: Env, body: unknown): Promise<CreateFormBodyResult> {
  if (!body || typeof body !== "object") {
    return { ok: false, status: 400, error: "config or brief required" };
  }

  const value = body as Record<string, unknown>;
  if (value.config != null) {
    const parsed = FormConfigSchema.safeParse(value.config);
    if (!parsed.success) {
      return { ok: false, status: 400, error: "invalid config", issues: parsed.error.issues };
    }
    return { ok: true, config: parsed.data };
  }

  if (typeof value.brief === "string" && value.brief.trim()) {
    return { ok: true, config: await createFormFromBrief(env, value.brief) };
  }

  return { ok: false, status: 400, error: "config or brief required" };
}
