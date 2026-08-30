import type { Env } from "../env";
import { SAMPLE_FORM } from "../seed/sample-form";
import { FormConfigSchema, type FormConfig } from "./types";

export interface CallbackDelivery {
  id: string;
  responseId: string;
  formId: string;
  callbackUrl: string;
  payload: string;
  status: "pending" | "queued" | "processing" | "retrying" | "delivered" | "failed";
  attempts: number;
}

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
    callback?: { url: string; payload: unknown },
  ): Promise<{ inserted: boolean; deliveryId?: string }> {
    const responseId = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const responseStatement = this.env.DB.prepare(
      "INSERT OR IGNORE INTO responses (id, form_id, owner_id, session_id, answers, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    )
      .bind(responseId, formId, ownerId, sessionId, JSON.stringify(answers), createdAt);

    if (!callback) {
      const result = await responseStatement.run();
      return { inserted: (result.meta.changes ?? 0) === 1 };
    }

    const deliveryId = crypto.randomUUID();
    const deliveryStatement = this.env.DB.prepare(
      `INSERT OR IGNORE INTO callback_deliveries
       (id, response_id, form_id, callback_url, payload, status, attempts, created_at, updated_at)
       SELECT ?, ?, ?, ?, ?, 'pending', 0, ?, ?
       WHERE EXISTS (SELECT 1 FROM responses WHERE id = ?)`,
    ).bind(
      deliveryId,
      responseId,
      formId,
      callback.url,
      JSON.stringify(callback.payload),
      createdAt,
      createdAt,
      responseId,
    );
    const [responseResult] = await this.env.DB.batch([responseStatement, deliveryStatement]);
    const inserted = (responseResult.meta.changes ?? 0) === 1;
    return { inserted, deliveryId: inserted ? deliveryId : undefined };
  }

  async claimCallbackDelivery(id: string): Promise<CallbackDelivery | null> {
    const now = new Date().toISOString();
    const staleBefore = new Date(Date.now() - 30_000).toISOString();
    const result = await this.env.DB.prepare(
      `UPDATE callback_deliveries
       SET status = 'processing', attempts = attempts + 1, updated_at = ?
       WHERE id = ? AND (
         status IN ('pending', 'queued', 'retrying')
         OR (status = 'processing' AND updated_at < ?)
       )`,
    ).bind(now, id, staleBefore).run();
    if ((result.meta.changes ?? 0) !== 1) return null;
    const row = await this.env.DB.prepare(
      "SELECT id, response_id, form_id, callback_url, payload, status, attempts FROM callback_deliveries WHERE id = ?",
    ).bind(id).first<{
      id: string; response_id: string; form_id: string; callback_url: string;
      payload: string; status: CallbackDelivery["status"]; attempts: number;
    }>();
    return row ? {
      id: row.id,
      responseId: row.response_id,
      formId: row.form_id,
      callbackUrl: row.callback_url,
      payload: row.payload,
      status: row.status,
      attempts: row.attempts,
    } : null;
  }

  async listPendingCallbackIds(limit: number): Promise<string[]> {
    const { results } = await this.env.DB.prepare(
      "SELECT id FROM callback_deliveries WHERE status = 'pending' ORDER BY created_at LIMIT ?",
    ).bind(limit).all<{ id: string }>();
    return (results ?? []).map((row) => row.id);
  }

  async markCallbackQueued(id: string): Promise<void> {
    await this.updateCallbackStatus(id, "queued", null, ["pending"]);
  }

  async markCallbackDelivered(id: string): Promise<void> {
    await this.updateCallbackStatus(id, "delivered", null, ["processing"]);
  }

  async markCallbackRetrying(id: string, error: string): Promise<void> {
    await this.updateCallbackStatus(id, "retrying", error.slice(0, 1000), ["processing"]);
  }

  async markCallbackFailed(id: string, error: string): Promise<void> {
    await this.updateCallbackStatus(id, "failed", error.slice(0, 1000), ["queued", "processing", "retrying"]);
  }

  private async updateCallbackStatus(
    id: string,
    status: CallbackDelivery["status"],
    error: string | null,
    fromStatuses?: CallbackDelivery["status"][],
  ): Promise<void> {
    const condition = fromStatuses?.length
      ? ` AND status IN (${fromStatuses.map(() => "?").join(", ")})`
      : "";
    const statement = this.env.DB.prepare(
      `UPDATE callback_deliveries SET status = ?, last_error = ?, updated_at = ? WHERE id = ?${condition}`,
    );
    const values = [status, error, new Date().toISOString(), id, ...(fromStatuses ?? [])];
    await statement.bind(...values).run();
  }
}
