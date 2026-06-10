/** Build request headers for an OpenAI-compatible LLM call.
 *  Adds an optional bearer key and optional Cloudflare Access service-token headers
 *  (so a deployed worker can reach an Access-gated tunnel like qwen.hutchgpt.com). */
export function llmHeaders(opts: {
  apiKey?: string;
  cfAccessClientId?: string;
  cfAccessClientSecret?: string;
}): Record<string, string> {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (opts.apiKey) headers.authorization = `Bearer ${opts.apiKey}`;
  if (opts.cfAccessClientId && opts.cfAccessClientSecret) {
    headers["CF-Access-Client-Id"] = opts.cfAccessClientId;
    headers["CF-Access-Client-Secret"] = opts.cfAccessClientSecret;
  }
  return headers;
}
