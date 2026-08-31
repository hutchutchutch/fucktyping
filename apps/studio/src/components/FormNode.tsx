import { Handle, Position, type NodeProps } from "@xyflow/react";

import type { GraphNode } from "../authoring/graph";

/** Node data is the GraphNode plus a click handler injected by GraphPane. */
type FormNodeData = GraphNode & { onEditRequest?: (node: GraphNode) => void };

/** Custom React Flow node rendering an opening / question / closing step.
 *  The whole card is a click affordance that opens the inline node editor. */
export function FormNode({ data }: NodeProps) {
  const node = data as unknown as FormNodeData;
  const { onEditRequest, ...graphNode } = node;
  return (
    <div
      className={`flow-node ${node.kind} flow-node-editable`}
      role="button"
      tabIndex={0}
      title="Click to edit"
      onClick={() => onEditRequest?.(graphNode)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onEditRequest?.(graphNode);
        }
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div className="flow-node-title">{node.title}</div>
      <div className="flow-node-body">{node.body}</div>
      {node.meta?.options?.length ? (
        <div className="flow-node-options">{node.meta.options.join(" · ")}</div>
      ) : null}
      {node.kind === "question" && node.meta?.required === false ? (
        <div className="flow-node-flag">optional</div>
      ) : null}
      <span className="flow-node-edit" aria-hidden="true">
        ✎
      </span>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
