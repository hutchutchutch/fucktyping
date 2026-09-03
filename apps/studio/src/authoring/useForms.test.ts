import { describe, expect, it } from "vitest";

import { parseFormSummaries } from "./useForms";

describe("forms list protocol", () => {
  it("accepts the bounded form-summary shape", () => {
    const forms = [{ id: "form-1", name: "Check-in", created_at: "2026-09-02T12:00:00.000Z" }];
    expect(parseFormSummaries(forms)).toEqual(forms);
  });

  it("rejects malformed rows", () => {
    expect(parseFormSummaries({})).toBeNull();
    expect(parseFormSummaries([{ id: "form-1", name: "Check-in", created_at: "yesterday" }])).toBeNull();
  });
});
