/** Mirrors apps/edge/src/authoring/{draft,protocol}.ts. Keep in sync (or promote to
 *  packages/shared later). These are the wire shapes the authoring DO broadcasts. */

export type ResponseFormat =
  | "text"
  | "multiple_choice"
  | "yes_no"
  | "number"
  | "date"
  | "email"
  | "phone";

export interface DraftQuestion {
  id: string;
  prompt: string;
  expectedResponseFormat: ResponseFormat;
  options?: string[];
  required: boolean;
  maxAttempts: number;
  validResponseExample?: string;
  invalidResponseExample?: string;
  rephrasePrompt?: string;
}

export interface DraftFormConfig {
  id: string;
  name: string;
  description?: string;
  openingActivity: { prompt: string };
  questions: DraftQuestion[];
  closingActivity: { prompt: string };
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export type AuthoringClientMessage =
  | { type: "init" }
  | { type: "new_form" }
  | { type: "load_form"; formId: string }
  | { type: "user_message"; text: string }
  | { type: "publish" };

export type AuthoringServerMessage =
  | { type: "snapshot"; form: DraftFormConfig; messages: ChatMessage[]; ready: boolean }
  | { type: "thinking" }
  | { type: "published"; formId: string; responderUrl: string; expiresAt: string }
  | { type: "error"; message: string };
