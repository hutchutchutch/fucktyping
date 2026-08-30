import type { Env } from "../env";
import { z } from "zod";
import { createFormFromBrief } from "./create";
import { FormConfigSchema, type FormConfig } from "./types";

export type CreateFormBodyResult =
  | { ok: true; config: FormConfig }
  | { ok: false; status: number; error: string; issues?: unknown };

function isSafeCallbackUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return false;
    const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
    if (host === "localhost" || host.endsWith(".localhost") || host === "::1" || host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe80:")) return false;
    const octets = host.split(".").map(Number);
    if (octets.length === 4 && octets.every((part) => Number.isInteger(part) && part >= 0 && part <= 255)) {
      if (octets[0] === 0 || octets[0] === 10 || octets[0] === 127 || (octets[0] === 169 && octets[1] === 254)) return false;
      if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) return false;
      if (octets[0] === 192 && octets[1] === 168) return false;
    }
    return true;
  } catch {
    return false;
  }
}

const CreateFormOptionsSchema = z.object({
  callbackUrl: z.string().max(2048).refine(isSafeCallbackUrl, "callbackUrl must be a public HTTPS URL").optional(),
  meta: z.unknown().refine((value) => value == null || JSON.stringify(value).length <= 16_384, "meta is too large").optional(),
  ttlDays: z.coerce.number().int().min(1).max(30).default(7),
});

export type CreateFormOptions = z.infer<typeof CreateFormOptionsSchema>;

export function formOptionsFromCreateBody(body: unknown):
  | { ok: true; options: CreateFormOptions }
  | { ok: false; issues: unknown } {
  const parsed = CreateFormOptionsSchema.safeParse(body);
  return parsed.success ? { ok: true, options: parsed.data } : { ok: false, issues: parsed.error.issues };
}

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

  if (typeof value.brief === "string" && value.brief.trim() && value.brief.length <= 10_000) {
    return { ok: true, config: await createFormFromBrief(env, value.brief.trim()) };
  }

  return { ok: false, status: 400, error: "config or brief required" };
}
