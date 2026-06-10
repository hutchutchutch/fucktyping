export interface Env {
  /** Per-session runtime brain. */
  FORM_SESSION: DurableObjectNamespace;
  /** D1: forms + collected responses. */
  DB: D1Database;
  /** Workers AI — used for Whisper STT on form-creation push-to-talk. */
  AI: Ai;

  // AI Gateway routing for the validation LLM.
  AI_GATEWAY_ACCOUNT_ID: string;
  AI_GATEWAY_ID: string;
  LLM_PROVIDER: string; // e.g. "groq" (OpenAI-compatible)
  LLM_MODEL: string;    // e.g. "llama-3.3-70b-versatile"
  LLM_API_KEY: string;  // secret: `wrangler secret put LLM_API_KEY`

  // Authoring agent (stronger, tool-calling model).
  FORM_AUTHORING: DurableObjectNamespace;
  AUTHORING_PROVIDER: string; // OpenAI-compatible, e.g. "openai"
  AUTHORING_MODEL: string;    // e.g. "gpt-4o"
  AUTHORING_API_KEY: string;  // secret: `wrangler secret put AUTHORING_API_KEY`

  /** HMAC secret for signing/verifying session tokens. When unset, WS auth is
   *  skipped (local dev). Secret: `wrangler secret put SESSION_SECRET`. */
  SESSION_SECRET: string;
}
