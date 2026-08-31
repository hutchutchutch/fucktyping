import { describe, expect, it } from "vitest";

import type { Env } from "../env";
import type { FormConfig } from "./types";
import { FormRepository } from "./repository";

const FORM: FormConfig = {
  id: "form-1",
  name: "Check-in",
  openingActivity: { prompt: "Hello" },
  questions: [{ id: "q1", prompt: "How are you?", expectedResponseFormat: "text", required: true, maxAttempts: 3 }],
  closingActivity: { prompt: "Thanks" },
};

function fakeEnv(changes = 1) {
  const calls: { sql: string; values: unknown[] }[] = [];
  const DB = {
    prepare(sql: string) {
      const call = { sql, values: [] as unknown[] };
      calls.push(call);
      const statement = {
        bind(...values: unknown[]) {
          call.values = values;
          return statement;
        },
        async run() {
          return { meta: { changes } };
        },
        async all() {
          return { results: [] };
        },
      };
      return statement;
    },
    async batch(statements: { run: () => Promise<{ meta: { changes: number } }> }[]) {
      return Promise.all(statements.map((statement) => statement.run()));
    },
  };
  return { env: { DB } as unknown as Env, calls };
}

describe("FormRepository writes", () => {
  it("uses an owner-guarded upsert without replacing the row", async () => {
    const { env, calls } = fakeEnv();
    await new FormRepository(env).saveForm(FORM, { ownerId: "private-beta" });
    expect(calls[0].sql).toContain("ON CONFLICT(id) DO UPDATE");
    expect(calls[0].sql).toContain("WHERE forms.owner_id = excluded.owner_id");
    expect(calls[0].sql).not.toContain("REPLACE");
    expect(calls[0].values.slice(0, 3)).toEqual(["form-1", "private-beta", "Check-in"]);
  });

  it("fails an upsert when the id is owned by another tenant", async () => {
    const { env } = fakeEnv(0);
    await expect(new FormRepository(env).saveForm(FORM, { ownerId: "other" }))
      .rejects.toThrow("form id belongs to another owner");
  });

  it("deduplicates completed sessions using INSERT OR IGNORE", async () => {
    const inserted = fakeEnv(1);
    expect(await new FormRepository(inserted.env).saveResponse("form-1", "private-beta", "session-1", { q1: "ok" })).toEqual({ inserted: true });
    expect(inserted.calls[0].sql).toContain("INSERT OR IGNORE");
    expect(inserted.calls[0].values.slice(1, 4)).toEqual(["form-1", "private-beta", "session-1"]);

    const duplicate = fakeEnv(0);
    expect(await new FormRepository(duplicate.env).saveResponse("form-1", "private-beta", "session-1", {})).toEqual({ inserted: false });
  });

  it("creates the response and callback outbox row in one D1 batch", async () => {
    const { env, calls } = fakeEnv(1);
    const result = await new FormRepository(env).saveResponse(
      "form-1",
      "private-beta",
      "session-1",
      { q1: "ok" },
      { url: "https://hooks.example.com/complete", payload: { formId: "form-1" } },
    );
    expect(result.inserted).toBe(true);
    expect(result.deliveryId).toMatch(/^[0-9a-f-]{36}$/);
    expect(calls[1].sql).toContain("INSERT OR IGNORE INTO callback_deliveries");
    expect(calls[1].sql).toContain("WHERE EXISTS (SELECT 1 FROM responses WHERE id = ?)");
  });
});
