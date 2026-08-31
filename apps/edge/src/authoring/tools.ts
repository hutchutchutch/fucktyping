import { applyMutation } from "./reducer";
import type { DraftFormConfig, DraftQuestion } from "./draft";

export const RESPONSE_FORMATS = [
  "text",
  "multiple_choice",
  "yes_no",
  "number",
  "date",
  "email",
  "phone",
] as const;

/** Resolved mutations (ids already assigned) — the reducer stays pure over these. */
export type Mutation =
  | { kind: "set_meta"; name?: string; description?: string }
  | { kind: "set_opening"; prompt: string }
  | { kind: "set_closing"; prompt: string }
  | { kind: "add_question"; question: DraftQuestion; position?: number }
  | { kind: "update_question"; id: string; patch: Partial<DraftQuestion> }
  | { kind: "remove_question"; id: string }
  | { kind: "reorder_questions"; order: string[] };

/** OpenAI-style function/tool definitions handed to the authoring LLM. */
export const AUTHORING_TOOLS = [
  fn("set_form_meta", "Set the form's name and/or description.", {
    name: { type: "string" },
    description: { type: "string" },
  }),
  fn("set_opening", "Set the greeting the voice agent says first.", { prompt: { type: "string" } }, ["prompt"]),
  fn("set_closing", "Set the closing message after all questions.", { prompt: { type: "string" } }, ["prompt"]),
  fn(
    "add_question",
    "Add a question to the form.",
    {
      prompt: { type: "string" },
      expectedResponseFormat: { type: "string", enum: RESPONSE_FORMATS },
      options: { type: "array", items: { type: "string" } },
      required: { type: "boolean" },
      position: { type: "integer", description: "0-based insert index; omit to append" },
    },
    ["prompt", "expectedResponseFormat"],
  ),
  fn(
    "update_question",
    "Edit an existing question by id.",
    {
      id: { type: "string" },
      prompt: { type: "string" },
      expectedResponseFormat: { type: "string", enum: RESPONSE_FORMATS },
      options: { type: "array", items: { type: "string" } },
      required: { type: "boolean" },
      maxAttempts: { type: "integer" },
    },
    ["id"],
  ),
  fn("remove_question", "Remove a question by id.", { id: { type: "string" } }, ["id"]),
  fn(
    "reorder_questions",
    "Reorder questions; provide the full list of ids in the desired order.",
    { order: { type: "array", items: { type: "string" } } },
    ["order"],
  ),
];

function fn(
  name: string,
  description: string,
  properties: Record<string, unknown>,
  required: string[] = [],
): ChatCompletionFunctionTool {
  return { type: "function", function: { name, description, parameters: { type: "object", properties, required } } };
}

/** Next stable, readable question id (q1, q2, …). */
export function nextQuestionId(form: DraftFormConfig): string {
  let max = 0;
  for (const q of form.questions) {
    const m = /^q(\d+)$/.exec(q.id);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `q${max + 1}`;
}

/** Translate one LLM tool call into a resolved Mutation against the current draft.
 *  Returns null for malformed calls (the caller skips them). */
export function translateToolCall(name: string, args: Record<string, any>, form: DraftFormConfig): Mutation | null {
  switch (name) {
    case "set_form_meta":
      return { kind: "set_meta", name: str(args.name), description: str(args.description) };
    case "set_opening":
      return str(args.prompt) != null ? { kind: "set_opening", prompt: args.prompt } : null;
    case "set_closing":
      return str(args.prompt) != null ? { kind: "set_closing", prompt: args.prompt } : null;
    case "add_question": {
      if (str(args.prompt) == null || !RESPONSE_FORMATS.includes(args.expectedResponseFormat)) return null;
      const question: DraftQuestion = {
        id: nextQuestionId(form),
        prompt: args.prompt,
        expectedResponseFormat: args.expectedResponseFormat,
        options: Array.isArray(args.options) ? args.options.map(String) : undefined,
        required: args.required !== false,
        maxAttempts: typeof args.maxAttempts === "number" ? args.maxAttempts : 3,
      };
      return { kind: "add_question", question, position: typeof args.position === "number" ? args.position : undefined };
    }
    case "update_question": {
      if (str(args.id) == null) return null;
      const patch: Partial<DraftQuestion> = {};
      if (str(args.prompt) != null) patch.prompt = args.prompt;
      if (RESPONSE_FORMATS.includes(args.expectedResponseFormat)) patch.expectedResponseFormat = args.expectedResponseFormat;
      if (Array.isArray(args.options)) patch.options = args.options.map(String);
      if (typeof args.required === "boolean") patch.required = args.required;
      if (typeof args.maxAttempts === "number") patch.maxAttempts = args.maxAttempts;
      return { kind: "update_question", id: args.id, patch };
    }
    case "remove_question":
      return str(args.id) != null ? { kind: "remove_question", id: args.id } : null;
    case "reorder_questions":
      return Array.isArray(args.order) ? { kind: "reorder_questions", order: args.order.map(String) } : null;
    default:
      return null;
  }
}

/** Fold a batch of tool calls into mutations, applying each against the evolving draft
 *  so generated ids stay unique within the turn. Returns mutations to apply downstream. */
export function toolCallsToMutations(
  calls: { name: string; args: Record<string, any> }[],
  form: DraftFormConfig,
): Mutation[] {
  let working = form;
  const mutations: Mutation[] = [];
  for (const call of calls) {
    const m = translateToolCall(call.name, call.args, working);
    if (m) {
      mutations.push(m);
      working = applyMutation(working, m);
    }
  }
  return mutations;
}

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.length > 0 ? v : undefined;
}
