import { useCallback, useMemo, useState } from "react";
import { Background, Controls, ReactFlow, type Edge, type Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { snapshotToGraph, type GraphNode } from "../authoring/graph";
import type { DraftFormConfig } from "../authoring/types";
import { FormNode } from "./FormNode";
import { NodeEditor } from "./NodeEditor";

const nodeTypes = { form: FormNode };

/** Right pane: live graph of the form being authored. Re-derives from the snapshot
 *  every render — the DO is the source of truth, this is a pure projection.
 *  Clicking a node opens an inline editor whose changes round-trip through onEdit. */
export function GraphPane({
  form,
  onEdit,
}: {
  form: DraftFormConfig | null;
  onEdit: (instruction: string) => void;
}) {
  const [editing, setEditing] = useState<GraphNode | null>(null);

  const handleEditRequest = useCallback((node: GraphNode) => setEditing(node), []);

  const { nodes, edges } = useMemo(() => {
    if (!form) return { nodes: [] as Node[], edges: [] as Edge[] };
    const graph = snapshotToGraph(form);
    const nodes: Node[] = graph.nodes.map((n, i) => ({
      id: n.id,
      type: "form",
      position: { x: 0, y: i * 150 },
      data: { ...n, onEditRequest: handleEditRequest } as unknown as Record<string, unknown>,
    }));
    const edges: Edge[] = graph.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      animated: true,
    }));
    return { nodes, edges };
  }, [form, handleEditRequest]);

  return (
    <section className="graph-pane">
      <div className="graph-head">Conversation flow{form ? ` · ${form.name}` : ""}</div>
      <div className="graph-canvas">
        <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView proOptions={{ hideAttribution: true }}>
          <Background />
          <Controls showInteractive={false} />
        </ReactFlow>
        {editing ? (
          <div className="node-editor-overlay" onClick={() => setEditing(null)}>
            <NodeEditor node={editing} onEdit={onEdit} onClose={() => setEditing(null)} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
