import { describe, expect, it } from "vitest";

import {
  buildQuestionEdits,
  editClosing,
  editOpening,
  editQuestionFormat,
  editQuestionOptions,
  editQuestionPrompt,
  editQuestionRequired,
  removeQuestion,
} from "./edits";

describe("edit instruction builders", () => {
  it("builds a prompt update and trims whitespace", () => {
    expect(editQuestionPrompt("q2", "  What is your budget?  ")).toBe(
      'Update question q2: change the prompt to "What is your budget?".',
    );
  });

  it("builds a format update for each format", () => {
    expect(editQuestionFormat("q2", "number")).toBe(
      "Update question q2 to expect a number response.",
    );
    expect(editQuestionFormat("q1", "yes_no")).toBe(
      "Update question q1 to expect a yes/no response.",
    );
    expect(editQuestionFormat("q3", "multiple_choice")).toBe(
      "Update question q3 to expect a multiple-choice response.",
    );
  });

  it("builds a required toggle", () => {
    expect(editQuestionRequired("q2", true)).toBe("Update question q2 to be required.");
    expect(editQuestionRequired("q2", false)).toBe("Update question q2 to be optional.");
  });

  it("builds an options update and drops blanks", () => {
    expect(editQuestionOptions("q2", ["Red", " Green ", "", "Blue"])).toBe(
      'Update question q2: set the answer options to "Red", "Green", "Blue".',
    );
  });

  it("builds a remove instruction", () => {
    expect(removeQuestion("q2")).toBe("Remove question q2.");
  });

  it("builds opening and closing instructions", () => {
    expect(editOpening("Welcome!")).toBe('Set the opening message to "Welcome!".');
    expect(editClosing("Thanks!")).toBe('Set the closing message to "Thanks!".');
  });

  it("only emits instructions for changed fields", () => {
    expect(buildQuestionEdits("q2", {})).toEqual([]);
    expect(buildQuestionEdits("q2", { prompt: "New?", required: false })).toEqual([
      'Update question q2: change the prompt to "New?".',
      "Update question q2 to be optional.",
    ]);
  });
});
