import { describe, expect, it } from "vitest";

import type { Question } from "../forms/types";
import type { Env } from "../env";
import { extractJson, heuristicValidate, Validator } from "./validator";

const q = (f: Question["expectedResponseFormat"]): Question =>
  ({ id: "x", prompt: "?", expectedResponseFormat: f, required: true, maxAttempts: 3 }) as Question;

describe("extractJson", () => {
  it("strips a ```json fence", () => {
    const fenced = '```json\n{ "isValid": true, "extractedValue": "yes" }\n```';
    expect(JSON.parse(extractJson(fenced))).toEqual({ isValid: true, extractedValue: "yes" });
  });
  it("extracts a JSON object from surrounding prose", () => {
    expect(JSON.parse(extractJson('Sure! {"a":1} done'))).toEqual({ a: 1 });
  });
  it("passes through bare JSON", () => {
    expect(JSON.parse(extractJson('{"a":1}'))).toEqual({ a: 1 });
  });
});

describe("heuristicValidate", () => {
  it("yes/no", () => {
    expect(heuristicValidate(q("yes_no"), "yeah sure").isValid).toBe(true);
    expect(heuristicValidate(q("yes_no"), "no way").extractedValue).toBe(false);
  });
  it("number (words + digits)", () => {
    expect(heuristicValidate(q("number"), "about five").extractedValue).toBe(5);
    expect(heuristicValidate(q("number"), "rating 4").extractedValue).toBe(4);
    expect(heuristicValidate(q("number"), "no idea").isValid).toBe(false);
  });
  it("email", () => {
    expect(heuristicValidate(q("email"), "it's a@b.co thanks").extractedValue).toBe("a@b.co");
  });
});

describe("Validator", () => {
  it("uses the configured Workers AI model for structured validation", async () => {
    const models: string[] = [];
    const env = {
      AI_TEXT_MODEL: "@cf/zai-org/glm-4.7-flash",
      AI: {
        run: async (model: string) => {
          models.push(model);
          return {
            choices: [{ message: { content: JSON.stringify({ isValid: true, extractedValue: 7, confidence: 0.92, reason: "number" }) } }],
          };
        },
      },
    } as unknown as Env;

    const result = await new Validator(env).validate(q("number"), "a baker's dozen");
    expect(models).toEqual(["@cf/zai-org/glm-4.7-flash"]);
    expect(result).toEqual({ isValid: true, extractedValue: 7, confidence: 0.92, reason: "number" });
  });

  it("skips Workers AI for an unambiguous constrained answer", async () => {
    let calls = 0;
    const env = {
      AI_TEXT_MODEL: "@cf/zai-org/glm-4.7-flash",
      AI: { run: async () => { calls += 1; throw new Error("should not run"); } },
    } as unknown as Env;
    expect(await new Validator(env).validate(q("yes_no"), "yep")).toMatchObject({
      isValid: true,
      extractedValue: true,
      reason: "heuristic match",
    });
    expect(calls).toBe(0);
  });

  it("falls back deterministically when Workers AI is unavailable", async () => {
    const env = {
      AI_TEXT_MODEL: "@cf/zai-org/glm-4.7-flash",
      AI: { run: async () => { throw new Error("unavailable"); } },
    } as unknown as Env;
    expect(await new Validator(env).validate(q("date"), "next Tuesday")).toMatchObject({
      isValid: true,
      extractedValue: "next Tuesday",
      reason: "heuristic match",
    });
  });
});
