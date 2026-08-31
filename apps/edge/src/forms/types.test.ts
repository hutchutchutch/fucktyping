import { describe, expect, it } from "vitest";

import { FormConfigSchema } from "./types";

function form() {
  return {
    id: "form-1",
    name: "Check-in",
    openingActivity: { prompt: "Hello" },
    questions: [{
      id: "q1",
      prompt: "How are you?",
      expectedResponseFormat: "text",
      required: true,
      maxAttempts: 3,
    }],
    closingActivity: { prompt: "Thanks" },
  };
}

describe("FormConfigSchema limits", () => {
  it("accepts a bounded form", () => {
    expect(FormConfigSchema.safeParse(form()).success).toBe(true);
  });

  it("rejects unsafe identifiers and duplicate question ids", () => {
    expect(FormConfigSchema.safeParse({ ...form(), id: "bad/id" }).success).toBe(false);
    const duplicate = form();
    duplicate.questions.push({ ...duplicate.questions[0] });
    expect(FormConfigSchema.safeParse(duplicate).success).toBe(false);
  });

  it("caps text and collection sizes", () => {
    expect(FormConfigSchema.safeParse({ ...form(), name: "x".repeat(201) }).success).toBe(false);
    expect(FormConfigSchema.safeParse({ ...form(), questions: [] }).success).toBe(false);
    expect(FormConfigSchema.safeParse({
      ...form(),
      questions: Array.from({ length: 51 }, (_, index) => ({
        ...form().questions[0],
        id: `q${index}`,
      })),
    }).success).toBe(false);
  });
});
