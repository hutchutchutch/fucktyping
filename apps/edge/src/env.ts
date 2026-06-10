export interface Env {
  /** Per-session runtime brain. */
  FORM_SESSION: DurableObjectNamespace;
  /** D1: forms + collected responses. */
  DB: D1Database;
  /** Workers AI — used for Whisper STT on form-creation push-to-talk. */
  AI: Ai;

  // Validation LLM — any OpenAI-compatible endpoint. Defaults to local Ollama
  // (reachable from the worker only in `wrangler dev` local mode, or via a tunnel).
  LLM_BASE_URL: string; // e.g. "http://localhost:11434/v1"
  LLM_MODEL: string;    // e.g. "gemma4:31b-mlx"
  LLM_API_KEY?: string; // optional; unused for Ollama

  // Authoring agent (tool-calling LLM; OpenAI-compatible).
  FORM_AUTHORING: DurableObjectNamespace;
  AUTHORING_BASE_URL: string; // e.g. "http://localhost:11434/v1"
  AUTHORING_MODEL: string;    // e.g. "gemma4:31b-mlx"
  AUTHORING_API_KEY?: string; // optional

  /** HMAC secret for signing/verifying session tokens. When unset, WS auth is
   *  skipped (local dev). Secret: `wrangler secret put SESSION_SECRET`. */
  SESSION_SECRET: string;
}
