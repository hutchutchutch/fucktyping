import { describe, expect, it } from "vitest";

import type { FormConfig } from "../forms/types";
import { FormInterpreter } from "./interpreter";
import type { AnswerValidator, ValidationResult } from "./validator";

const CONFIG: FormConfig = {
  id: "t",
  name: "test",
  openingActivity: { prompt: "Hello." },
  questions: [
    { id: "name", prompt: "Your name?", expectedResponseFormat: "text", required: true, maxAttempts: 2 },
    { id: "rate", prompt: "Rating?", expectedResponseFormat: "number", required: true, maxAttempts: 2 },
  ],
  closingActivity: { prompt: "Bye." },
};

const accept: AnswerValidator = {
  async validate(_q, text): Promise<ValidationResult> {
    return { isValid: true, extractedValue: text, confidence: 1, reason: "" };
  },
};
const reject: AnswerValidator = {
  async validate(): Promise<ValidationResult> {
    return { isValid: false, extractedValue: null, confidence: 1, reason: "no" };
  },
};

describe("FormInterpreter", () => {
  it("opens with greeting + first question", () => {
    const { state, reply } = new FormInterpreter(CONFIG, accept).begin();
    expect(reply.text).toBe("Hello. Your name?");
    expect(reply.done).toBe(false);
    expect(state.phase).toBe("asking");
    expect(state.currentQuestionIndex).toBe(0);
  });

  it("advances to the next question on a valid answer", async () => {
    const i = new FormInterpreter(CONFIG, accept);
    const start = i.begin();
    const t = await i.handleAnswer(start.state, "Hutch");
    expect(t.reply.text).toBe("Rating?");
    expect(t.reply.done).toBe(false);
    expect(t.state.currentQuestionIndex).toBe(1);
    expect(t.state.responses).toEqual({ name: "Hutch" });
  });

  it("completes (done=true) and collects all answers after the last question", async () => {
    const i = new FormInterpreter(CONFIG, accept);
    let t = i.begin();
    const a1 = await i.handleAnswer(t.state, "Hutch");
    const a2 = await i.handleAnswer(a1.state, "five");
    expect(a2.reply.text).toBe("Bye.");
    expect(a2.reply.done).toBe(true);
    expect(a2.state.phase).toBe("done");
    expect(a2.state.responses).toEqual({ name: "Hutch", rate: "five" });
  });

  it("rephrases on invalid input and keeps a required question on repeated failure", async () => {
    const i = new FormInterpreter(CONFIG, reject);
    const start = i.begin();
    const first = await i.handleAnswer(start.state, "???");
    expect(first.reply.done).toBe(false);
    expect(first.state.currentAttempts).toBe(1);
    // hitting maxAttempts on a required question resets attempts but does NOT advance
    const second = await i.handleAnswer(first.state, "???");
    expect(second.state.currentQuestionIndex).toBe(0);
    expect(second.state.currentAttempts).toBe(0);
    expect(second.reply.done).toBe(false);
  });
});
