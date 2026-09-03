import type { Env } from "../env";
import type { ChatMessage, DraftFormConfig } from "./draft";
import { AUTHORING_TOOLS, toolCallsToMutations, type Mutation } from "./tools";

export interface AuthoringTurn {
  text: string; // what the assistant says back
  mutations: Mutation[]; // changes to apply to the draft
}

/** The form-design brain. Injectable so the DO uses the LLM and tests use a stub. */
export interface AuthoringBrain {
  respond(messages: ChatMessage[], form: DraftFormConfig): Promise<AuthoringTurn>;
}

function systemPrompt(form: DraftFormConfig): string {
  return [
    "You are a friendly assistant that helps a user design a VOICE form by conversation.",
    "Use the provided tools to add/edit/reorder questions and set the opening and closing messages.",
    "Prefer concrete defaults; ask a clarifying question only when truly needed.",
    "Keep spoken replies to 1-2 short sentences, confirm what you changed, and suggest the next step.",
    "Each question needs an expectedResponseFormat (text, multiple_choice, yes_no, number, date, email, phone).",
    "A multiple_choice question must include at least two distinct options.",
    "",
    "Current form state (JSON):",
    JSON.stringify(form),
  ].join("\n");
}

/** Confirmation text used when the model emits tool calls but no prose. */
export function summarizeMutations(mutations: Mutation[]): string {
  if (mutations.length === 0) return "";
  const parts = mutations.map((m) => {
    switch (m.kind) {
      case "add_question":
        return `added a question (${m.question.expectedResponseFormat})`;
      case "update_question":
        return "updated a question";
      case "remove_question":
        return "removed a question";
      case "reorder_questions":
        return "reordered the questions";
      case "set_opening":
        return "set the opening";
      case "set_closing":
        return "set the closing";
      case "set_meta":
        return "updated the form details";
    }
  });
  return `Done — ${parts.join(", ")}.`;
}

/** LLM authoring brain running on the bound, Cloudflare-hosted Workers AI model. */
export class LLMAuthoringBrain implements AuthoringBrain {
  constructor(private env: Env) {}

  async respond(messages: ChatMessage[], form: DraftFormConfig): Promise<AuthoringTurn> {
    const result: unknown = await this.env.AI.run(this.env.AI_TEXT_MODEL as "@cf/zai-org/glm-4.7-flash", {
      temperature: 0.3,
      max_completion_tokens: 800,
      tools: AUTHORING_TOOLS,
      messages: [
        { role: "system", content: systemPrompt(form) },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    });
    const message = firstAssistantMessage(result);
    const calls = toolCalls(message.tool_calls);
    const mutations = toolCallsToMutations(calls, form);
    const text = (typeof message.content === "string" ? message.content.trim() : "")
      || summarizeMutations(mutations)
      || "Okay.";
    return { text, mutations };
  }
}

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function firstAssistantMessage(result: unknown): Record<string, unknown> {
  const choices = record(result)?.choices;
  if (!Array.isArray(choices)) return {};
  return record(record(choices[0])?.message) ?? {};
}

function toolCalls(value: unknown): { name: string; args: Record<string, unknown> }[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((call) => {
    const fn = record(record(call)?.function);
    if (!fn || typeof fn.name !== "string") return [];
    return [{ name: fn.name, args: safeParse(fn.arguments) }];
  });
}

function safeParse(value: unknown): Record<string, unknown> {
  const objectValue = record(value);
  if (objectValue) return objectValue;
  if (typeof value !== "string") return {};
  let parsed: unknown;
  try {
    parsed = JSON.parse(value) as unknown;
  } catch {
    return {};
  }
  return record(parsed) ?? {};
}
