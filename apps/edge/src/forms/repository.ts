import type { Env } from "../env";
import { SAMPLE_FORM } from "../seed/sample-form";
import { FormConfigSchema, type FormConfig } from "./types";

/** Loads FormConfigs and persists collected structured output to D1. */
export class FormRepository {
  constructor(private env: Env) {}

  async getFormConfig(formId: string): Promise<FormConfig> {
    if (formId === "sample") return SAMPLE_FORM;
    const row = await this.env.DB.prepare("SELECT config FROM forms WHERE id = ?")
      .bind(formId)
      .first<{ config: string }>();
    if (!row) throw new Error(`form not found: ${formId}`);
    return FormConfigSchema.parse(JSON.parse(row.config));
  }

  /** Lists published forms for the studio's "My forms" sidebar (newest first). */
  async listForms(ownerId: string): Promise<{ id: string; name: string; created_at: string }[]> {
    const { results } = await this.env.DB.prepare(
      "SELECT id, name, created_at FROM forms WHERE owner_id = ? ORDER BY updated_at DESC LIMIT 100",
    ).bind(ownerId).all<{ id: string; name: string; created_at: string }>();
    return results ?? [];
  }

  async formExists(formId: string): Promise<boolean> {
    if (formId === "sample") return true;
    const row = await this.env.DB.prepare("SELECT 1 AS found FROM forms WHERE id = ?")
      .bind(formId)
      .first<{ found: number }>();
    return row?.found === 1;
  }

  /** Upsert a published form so the runtime DO can serve it by id. Optionally records a
   *  completion callback URL + opaque metadata (e.g. the Discord target to return to). */
  async saveForm(
    form: FormConfig,
    opts: { ownerId: string; callbackUrl?: string; meta?: unknown },
  ): Promise<void> {
    const now = new Date().toISOString();
    const result = await this.env.DB.prepare(
      `INSERT INTO forms (id, owner_id, name, config, callback_url, meta, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         config = excluded.config,
         callback_url = excluded.callback_url,
         meta = excluded.meta,
         updated_at = excluded.updated_at
       WHERE forms.owner_id = excluded.owner_id`,
    )
      .bind(
        form.id,
        opts.ownerId,
        form.name,
        JSON.stringify(form),
        opts.callbackUrl ?? null,
        opts.meta != null ? JSON.stringify(opts.meta) : null,
        now,
        now,
      )
      .run();
    if ((result.meta.changes ?? 0) !== 1) throw new Error("form id belongs to another owner");
  }

  /** Load a form's config plus its completion hook (callback URL + meta). */
  async getForm(formId: string): Promise<{ config: FormConfig; ownerId: string; callbackUrl?: string; meta?: unknown }> {
    if (formId === "sample") return { config: SAMPLE_FORM, ownerId: "private-beta" };
    const row = await this.env.DB.prepare(
      "SELECT config, owner_id, callback_url, meta FROM forms WHERE id = ?",
    )
      .bind(formId)
      .first<{ config: string; owner_id: string; callback_url: string | null; meta: string | null }>();
    if (!row) throw new Error(`form not found: ${formId}`);
    return {
      config: FormConfigSchema.parse(JSON.parse(row.config)),
      ownerId: row.owner_id,
      callbackUrl: row.callback_url ?? undefined,
      meta: row.meta ? JSON.parse(row.meta) : undefined,
    };
  }

  async saveResponse(
    formId: string,
    ownerId: string,
    sessionId: string,
    answers: Record<string, unknown>,
  ): Promise<boolean> {
    const result = await this.env.DB.prepare(
      "INSERT OR IGNORE INTO responses (id, form_id, owner_id, session_id, answers, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    )
      .bind(crypto.randomUUID(), formId, ownerId, sessionId, JSON.stringify(answers), new Date().toISOString())
      .run();
    return (result.meta.changes ?? 0) === 1;
  }
}
