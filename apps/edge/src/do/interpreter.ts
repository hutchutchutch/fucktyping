import type { ConversationState, FormConfig, Question } from "../forms/types";
import type { ServerMessage } from "./protocol";
import type { AnswerValidator } from "./validator";

export interface Turn {
  state: ConversationState;
  reply: ServerMessage;
}

/** Pure-ish state machine that drives a voice form, ported from the legacy LangGraph
 *  nodes (opening -> question -> validate -> rephrase loop -> closing). No LangGraph
 *  runtime: the flow is fixed-shape, so an interpreter is lighter per request. */
export class FormInterpreter {
  constructor(
    private readonly config: FormConfig,
    private readonly validator: AnswerValidator,
  ) {}

  /** Opening turn: greeting + the first question, as one spoken message. */
  begin(): Turn {
    const base: ConversationState = {
      formId: this.config.id,
      phase: "asking",
      currentQuestionIndex: 0,
      currentAttempts: 0,
      responses: {},
    };
    if (this.config.questions.length === 0) {
      return { state: { ...base, phase: "done" }, reply: this.closing() };
    }
    const text = `${this.config.openingActivity.prompt} ${questionText(this.config.questions[0])}`.trim();
    return { state: base, reply: { type: "assistant", text, done: false } };
  }

  /** Validate the latest answer and decide the next spoken turn. */
  async handleAnswer(state: ConversationState, userText: string): Promise<Turn> {
    if (state.phase !== "asking") {
      return { state, reply: this.closing() };
    }
    const question = this.config.questions[state.currentQuestionIndex];
    const result = await this.validator.validate(question, userText);

    if (result.isValid) {
      const responses = { ...state.responses, [question.id]: result.extractedValue };
      return this.advance({ ...state, responses, currentAttempts: 0 });
    }

    const attempts = state.currentAttempts + 1;
    if (attempts >= question.maxAttempts) {
      if (question.required) {
        // Required: don't give up — reset attempts and ask more firmly.
        return {
          state: { ...state, currentAttempts: 0 },
          reply: { type: "assistant", text: rephraseText(question, attempts), done: false },
        };
      }
      // Optional: skip it.
      return this.advance({ ...state, currentAttempts: 0 });
    }

    return {
      state: { ...state, currentAttempts: attempts },
      reply: { type: "assistant", text: rephraseText(question, attempts), done: false },
    };
  }

  private advance(state: ConversationState): Turn {
    const nextIndex = state.currentQuestionIndex + 1;
    if (nextIndex >= this.config.questions.length) {
      return { state: { ...state, phase: "done", currentQuestionIndex: nextIndex }, reply: this.closing() };
    }
    return {
      state: { ...state, currentQuestionIndex: nextIndex },
      reply: { type: "assistant", text: questionText(this.config.questions[nextIndex]), done: false },
    };
  }

  private closing(): ServerMessage {
    return { type: "assistant", text: this.config.closingActivity.prompt, done: true };
  }
}

/** Append the choices to a multiple-choice prompt so the agent reads them aloud. */
function questionText(q: Question): string {
  if (q.expectedResponseFormat === "multiple_choice" && q.options?.length) {
    return `${q.prompt} Your options are: ${q.options.join(", ")}.`;
  }
  return q.prompt;
}

/** Ported from engine/prompts.js generateRephrasePrompt — escalates with attempts. */
function rephraseText(q: Question, attempt: number): string {
  if (q.rephrasePrompt) return q.rephrasePrompt;
  if (attempt <= 1) {
    return `Sorry, I didn't quite catch that. ${q.prompt} Could you try again?`;
  }
  let prefix = "I'm still having trouble understanding. ";
  if (q.expectedResponseFormat === "multiple_choice" && q.options?.length) {
    prefix += `Please pick one of: ${q.options.join(", ")}. `;
  } else if (q.expectedResponseFormat === "yes_no") {
    prefix += "Please answer yes or no. ";
  } else if (q.validResponseExample) {
    prefix += `For example, you could say "${q.validResponseExample}". `;
  }
  return `${prefix}${q.prompt}`;
}
