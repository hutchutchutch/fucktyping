import { describe, expect, it } from "vitest";

import type { Question } from "../forms/types";
import { extractJson, heuristicValidate } from "./validator";

describe("extractJson", () => {
  it("strips a ```json fence (what Gemma/Ollama emit)", () => {
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
  const q = (f: Question["expectedResponseFormat"]): Question =>
    ({ id: "x", prompt: "?", expectedResponseFormat: f, required: true, maxAttempts: 3 }) as Question;

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
