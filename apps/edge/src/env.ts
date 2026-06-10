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
  // Cloudflare Access service token, to reach an Access-gated tunnel (qwen.hutchgpt.com).
  LLM_CF_ACCESS_CLIENT_ID?: string;
  LLM_CF_ACCESS_CLIENT_SECRET?: string;

  // Authoring agent (tool-calling LLM; OpenAI-compatible).
  FORM_AUTHORING: DurableObjectNamespace;
  AUTHORING_BASE_URL: string; // e.g. "http://localhost:11434/v1"
  AUTHORING_MODEL: string;    // e.g. "gemma4:31b-mlx"
  AUTHORING_API_KEY?: string; // optional
  AUTHORING_CF_ACCESS_CLIENT_ID?: string;
  AUTHORING_CF_ACCESS_CLIENT_SECRET?: string;

  /** HMAC secret for signing/verifying session tokens. When unset, WS auth is
   *  skipped (local dev). Secret: `wrangler secret put SESSION_SECRET`. */
  SESSION_SECRET: string;

  /** Bearer token required to POST /forms (programmatic form creation by Hermes). */
  CREATE_TOKEN?: string;
  /** Base URL of the studio responder UI (for the returned responder link). */
  STUDIO_BASE_URL?: string;
  /** HMAC secret for signing completion callbacks (X-Hub-Signature-256), matching the
   *  Hermes webhook subscription's secret. */
  WEBHOOK_SIGNING_SECRET?: string;
}
