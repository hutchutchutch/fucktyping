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
    if (!row) return SAMPLE_FORM; // graceful fallback for local dev
    return FormConfigSchema.parse(JSON.parse(row.config));
  }

  /** Lists published forms for the studio's "My forms" sidebar (newest first). */
  async listForms(): Promise<{ id: string; name: string; created_at: string }[]> {
    const { results } = await this.env.DB.prepare(
      "SELECT id, name, created_at FROM forms ORDER BY created_at DESC LIMIT 100",
    ).all<{ id: string; name: string; created_at: string }>();
    return results ?? [];
  }

  /** Upsert a published form so the runtime DO can serve it by id. */
  async saveForm(form: FormConfig): Promise<void> {
    await this.env.DB.prepare(
      "INSERT OR REPLACE INTO forms (id, name, config, created_at) VALUES (?, ?, ?, ?)",
    )
      .bind(form.id, form.name, JSON.stringify(form), new Date().toISOString())
      .run();
  }

  async saveResponse(formId: string, answers: Record<string, unknown>): Promise<void> {
    await this.env.DB.prepare(
      "INSERT INTO responses (id, form_id, answers, created_at) VALUES (?, ?, ?, ?)",
    )
      .bind(crypto.randomUUID(), formId, JSON.stringify(answers), new Date().toISOString())
      .run();
  }
}
