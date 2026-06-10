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

/** LLM authoring brain, routed through Cloudflare AI Gateway (OpenAI-compatible). */
export class LLMAuthoringBrain implements AuthoringBrain {
  constructor(private env: Env) {}

  private url(): string {
    const { AI_GATEWAY_ACCOUNT_ID, AI_GATEWAY_ID, AUTHORING_PROVIDER } = this.env;
    return `https://gateway.ai.cloudflare.com/v1/${AI_GATEWAY_ACCOUNT_ID}/${AI_GATEWAY_ID}/${AUTHORING_PROVIDER}/openai/v1/chat/completions`;
  }

  async respond(messages: ChatMessage[], form: DraftFormConfig): Promise<AuthoringTurn> {
    const res = await fetch(this.url(), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.env.AUTHORING_API_KEY}`,
      },
      body: JSON.stringify({
        model: this.env.AUTHORING_MODEL,
        temperature: 0.3,
        tools: AUTHORING_TOOLS,
        messages: [
          { role: "system", content: systemPrompt(form) },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
      }),
    });
    if (!res.ok) throw new Error(`AI Gateway ${res.status}`);

    const data = (await res.json()) as {
      choices?: { message?: { content?: string; tool_calls?: any[] } }[];
    };
    const message = data.choices?.[0]?.message ?? {};
    const calls = (message.tool_calls ?? []).map((tc: any) => ({
      name: tc.function?.name,
      args: safeParse(tc.function?.arguments),
    }));
    const mutations = toolCallsToMutations(calls, form);
    const text = (message.content?.trim() || summarizeMutations(mutations)) || "Okay.";
    return { text, mutations };
  }
}

function safeParse(s: unknown): Record<string, any> {
  if (typeof s !== "string") return {};
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}
