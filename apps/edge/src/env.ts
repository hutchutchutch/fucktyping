/** Wrangler generates resource bindings in worker-configuration.d.ts. This extension
 * only describes secrets, which are intentionally absent from wrangler.jsonc. */
export interface Env extends Cloudflare.Env {
  /** HMAC secret for signing/verifying session tokens. When unset, WS auth is
   *  skipped (local dev). Secret: `wrangler secret put SESSION_SECRET`. */
  SESSION_SECRET?: string;

  /** Bearer token required to POST /forms (programmatic form creation by Hermes). */
  CREATE_TOKEN?: string;
  /** Base URL of the studio responder UI (for the returned responder link). */
  STUDIO_BASE_URL?: string;
  /** HMAC secret for signing completion callbacks (X-Hub-Signature-256), matching the
   *  Hermes webhook subscription's secret. */
  WEBHOOK_SIGNING_SECRET?: string;
}
