import { describe, expect, it } from "vitest";

import { formConfigFromCreateBody } from "./create-request";

const config = {
  id: "gtky-test",
  name: "GTKY Test",
  openingActivity: { prompt: "Opening." },
  questions: [
    {
      id: "q1",
      prompt: "Context first. What matters today?",
      expectedResponseFormat: "text",
      required: true,
      maxAttempts: 3,
    },
  ],
  closingActivity: { prompt: "Done." },
};

describe("formConfigFromCreateBody", () => {
  it("accepts an explicit FormConfig", async () => {
    const result = await formConfigFromCreateBody({} as any, { config });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.config.id).toBe("gtky-test");
      expect(result.config.questions[0].prompt).toBe("Context first. What matters today?");
    }
  });

  it("rejects invalid explicit configs", async () => {
    const result = await formConfigFromCreateBody({} as any, { config: { id: "bad" } });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(400);
      expect(result.error).toBe("invalid config");
    }
  });
});
