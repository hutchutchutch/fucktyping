import type { DraftFormConfig } from "./types";

/** A backend-agnostic graph view of the form: opening → q1 → … → closing.
 *  GraphPane lays these out as React Flow nodes/edges. Pure + testable. */
export interface GraphNode {
  id: string;
  kind: "opening" | "question" | "closing";
  title: string;
  body: string;
  meta?: { format?: string; required?: boolean; options?: string[] };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
}

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function snapshotToGraph(form: DraftFormConfig): Graph {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  nodes.push({
    id: "opening",
    kind: "opening",
    title: "Opening",
    body: form.openingActivity.prompt || "(not set yet)",
  });

  let prev = "opening";
  form.questions.forEach((q, i) => {
    nodes.push({
      id: q.id,
      kind: "question",
      title: `Q${i + 1} · ${q.expectedResponseFormat}`,
      body: q.prompt,
      meta: { format: q.expectedResponseFormat, required: q.required, options: q.options },
    });
    edges.push({ id: `${prev}->${q.id}`, source: prev, target: q.id });
    prev = q.id;
  });

  nodes.push({
    id: "closing",
    kind: "closing",
    title: "Closing",
    body: form.closingActivity.prompt || "(not set yet)",
  });
  edges.push({ id: `${prev}->closing`, source: prev, target: "closing" });

  return { nodes, edges };
}
