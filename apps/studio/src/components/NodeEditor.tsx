import { useEffect, useState } from "react";

import {
  buildQuestionEdits,
  editClosing,
  editOpening,
  removeQuestion,
  type QuestionEdit,
} from "../authoring/edits";
import type { GraphNode } from "../authoring/graph";
import type { ResponseFormat } from "../authoring/types";

const FORMATS: ResponseFormat[] = [
  "text",
  "multiple_choice",
  "yes_no",
  "number",
  "date",
  "email",
  "phone",
];

/** Inline editor for a single graph node. Emits precise instructions via onEdit;
 *  never mutates the form locally — the DO re-broadcasts the authoritative snapshot. */
export function NodeEditor({
  node,
  onEdit,
  onClose,
}: {
  node: GraphNode;
  onEdit: (instruction: string) => void;
  onClose: () => void;
}) {
  const initialBody = node.body === "(not set yet)" ? "" : node.body;
  const [prompt, setPrompt] = useState(initialBody);
  const [format, setFormat] = useState<ResponseFormat>(
    (node.meta?.format as ResponseFormat | undefined) ?? "text",
  );
  const [required, setRequired] = useState(node.meta?.required ?? true);
  const [options, setOptions] = useState((node.meta?.options ?? []).join("\n"));
  const titleId = `node-editor-title-${node.id}`;
  const promptId = `node-editor-prompt-${node.id}`;
  const formatId = `node-editor-format-${node.id}`;
  const optionsId = `node-editor-options-${node.id}`;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const emit = (instruction: string) => {
    onEdit(instruction);
    onClose();
  };

  const submitQuestion = () => {
    const changes: QuestionEdit = {};
    if (prompt.trim() !== node.body.trim()) changes.prompt = prompt;
    if (format !== node.meta?.format) changes.format = format;
    if (required !== node.meta?.required) changes.required = required;
    const nextOptions = options
      .split("\n")
      .map((o) => o.trim())
      .filter((o) => o.length > 0);
    const prevOptions = node.meta?.options ?? [];
    if (
      format === "multiple_choice" &&
      JSON.stringify(nextOptions) !== JSON.stringify(prevOptions)
    ) {
      changes.options = nextOptions;
    }
    for (const instruction of buildQuestionEdits(node.id, changes)) onEdit(instruction);
    onClose();
  };

  return (
    <div className="node-editor" role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={(e) => e.stopPropagation()}>
      <div className="node-editor-head">
        <span id={titleId}>Edit {node.kind === "question" ? node.title : node.kind}</span>
        <button className="node-editor-x" type="button" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>

      {node.kind === "opening" || node.kind === "closing" ? (
        <>
          <label className="node-editor-label" htmlFor={promptId}>Message</label>
          <textarea
            id={promptId}
            className="node-editor-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            autoFocus
          />
          <div className="node-editor-actions">
            <button
              type="button"
              className="node-editor-save"
              disabled={!prompt.trim()}
              onClick={() => emit(node.kind === "opening" ? editOpening(prompt) : editClosing(prompt))}
            >
              Save
            </button>
          </div>
        </>
      ) : (
        <>
          <label className="node-editor-label" htmlFor={promptId}>Prompt</label>
          <textarea
            id={promptId}
            className="node-editor-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            autoFocus
          />

          <label className="node-editor-label" htmlFor={formatId}>Response format</label>
          <select
            id={formatId}
            className="node-editor-input"
            value={format}
            onChange={(e) => setFormat(e.target.value as ResponseFormat)}
          >
            {FORMATS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>

          {format === "multiple_choice" ? (
            <>
              <label className="node-editor-label" htmlFor={optionsId}>Options (one per line)</label>
              <textarea
                id={optionsId}
                className="node-editor-input"
                value={options}
                onChange={(e) => setOptions(e.target.value)}
                rows={3}
              />
            </>
          ) : null}

          <label className="node-editor-check">
            <input
              type="checkbox"
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
            />
            Required
          </label>

          <div className="node-editor-actions">
            <button
              type="button"
              className="node-editor-remove"
              onClick={() => emit(removeQuestion(node.id))}
            >
              Remove
            </button>
            <button
              type="button"
              className="node-editor-save"
              disabled={!prompt.trim()}
              onClick={submitQuestion}
            >
              Save
            </button>
          </div>
        </>
      )}
    </div>
  );
}
