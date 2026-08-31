import { describe, expect, it } from "vitest";

import { snapshotToGraph } from "./graph";
import type { DraftFormConfig } from "./types";

const form: DraftFormConfig = {
  id: "f",
  name: "Feedback",
  openingActivity: { prompt: "Hi." },
  questions: [
    { id: "q1", prompt: "Name?", expectedResponseFormat: "text", required: true, maxAttempts: 3 },
    { id: "q2", prompt: "Pick one", expectedResponseFormat: "multiple_choice", options: ["a", "b"], required: false, maxAttempts: 3 },
  ],
  closingActivity: { prompt: "Bye." },
};

describe("snapshotToGraph", () => {
  it("chains opening → questions → closing", () => {
    const g = snapshotToGraph(form);
    expect(g.nodes.map((n) => n.id)).toEqual(["opening", "q1", "q2", "closing"]);
    expect(g.edges.map((e) => `${e.source}>${e.target}`)).toEqual(["opening>q1", "q1>q2", "q2>closing"]);
  });

  it("labels and carries question meta", () => {
    const g = snapshotToGraph(form);
    expect(g.nodes[1].title).toBe("Q1 · text");
    expect(g.nodes[2].meta?.options).toEqual(["a", "b"]);
    expect(g.nodes[2].meta?.required).toBe(false);
  });

  it("handles an empty form (opening → closing) with placeholders", () => {
    const empty: DraftFormConfig = { id: "x", name: "x", openingActivity: { prompt: "" }, questions: [], closingActivity: { prompt: "" } };
    const g = snapshotToGraph(empty);
    expect(g.nodes.map((n) => n.id)).toEqual(["opening", "closing"]);
    expect(g.nodes[0].body).toBe("(not set yet)");
  });
});
