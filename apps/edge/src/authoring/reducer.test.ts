import { describe, expect, it } from "vitest";

import { emptyDraft, isPublishable, toPublished } from "./draft";
import { applyMutation, applyMutations } from "./reducer";
import { toolCallsToMutations } from "./tools";

describe("authoring reducer", () => {
  it("adds questions with unique sequential ids", () => {
    const muts = toolCallsToMutations(
      [
        { name: "add_question", args: { prompt: "Name?", expectedResponseFormat: "text" } },
        { name: "add_question", args: { prompt: "Rating?", expectedResponseFormat: "number" } },
      ],
      emptyDraft("f"),
    );
    const form = applyMutations(emptyDraft("f"), muts);
    expect(form.questions.map((q) => q.id)).toEqual(["q1", "q2"]);
    expect(form.questions[0].required).toBe(true);
  });

  it("inserts at a position, updates, removes, and reorders", () => {
    let form = applyMutations(emptyDraft("f"), [
      { kind: "add_question", question: { id: "q1", prompt: "A", expectedResponseFormat: "text", required: true, maxAttempts: 3 } },
      { kind: "add_question", question: { id: "q2", prompt: "B", expectedResponseFormat: "text", required: true, maxAttempts: 3 } },
    ]);
    form = applyMutation(form, {
      kind: "add_question",
      position: 0,
      question: { id: "q3", prompt: "C", expectedResponseFormat: "yes_no", required: false, maxAttempts: 2 },
    });
    expect(form.questions.map((q) => q.id)).toEqual(["q3", "q1", "q2"]);

    form = applyMutation(form, { kind: "update_question", id: "q1", patch: { prompt: "A2" } });
    expect(form.questions.find((q) => q.id === "q1")!.prompt).toBe("A2");

    form = applyMutation(form, { kind: "remove_question", id: "q3" });
    expect(form.questions.map((q) => q.id)).toEqual(["q1", "q2"]);

    form = applyMutation(form, { kind: "reorder_questions", order: ["q2", "q1"] });
    expect(form.questions.map((q) => q.id)).toEqual(["q2", "q1"]);
  });

  it("is not publishable until name, opening, closing, and a question exist", () => {
    let form = emptyDraft("f");
    expect(isPublishable(form)).toBe(false);
    form = applyMutations(form, [
      { kind: "set_meta", name: "Feedback" },
      { kind: "set_opening", prompt: "Hi there." },
      { kind: "set_closing", prompt: "Thanks!" },
      { kind: "add_question", question: { id: "q1", prompt: "Name?", expectedResponseFormat: "text", required: true, maxAttempts: 3 } },
    ]);
    expect(isPublishable(form)).toBe(true);
    expect(toPublished(form).questions[0].id).toBe("q1");
  });
});
