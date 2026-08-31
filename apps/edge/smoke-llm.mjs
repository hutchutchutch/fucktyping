// Live test of the local-Ollama LLM paths against `wrangler dev` (local mode, so the
// worker can reach http://localhost:11434). Drives the authoring WS with a real
// message; if Gemma's tool-calls populate the draft form, the loop works end-to-end.
const BASE = process.env.WS_BASE || "ws://127.0.0.1:8787";

function collect(url, steps, tailMs) {
  return new Promise((resolve) => {
    const got = [];
    const ws = new WebSocket(url);
    ws.addEventListener("open", () => {
      for (const s of steps) setTimeout(() => ws.send(JSON.stringify(s.msg)), s.after);
    });
    ws.addEventListener("message", (e) => got.push(String(e.data)));
    const last = steps.reduce((m, s) => Math.max(m, s.after), 0);
    setTimeout(() => { try { ws.close(); } catch {} resolve(got); }, last + tailMs);
  });
}

console.log("--- AUTHORING with local Gemma (this calls Ollama; allow time) ---");
const raw = await collect(
  `${BASE}/authoring/llm-1/session`,
  [
    { after: 100, msg: { type: "init" } },
    { after: 700, msg: { type: "user_message", text: "Create a customer feedback form. Ask for the customer's name, and a rating from 1 to 5." } },
  ],
  60000,
);
const snaps = raw.map((m) => { try { return JSON.parse(m); } catch { return null; } }).filter((x) => x && x.type === "snapshot");
console.log("snapshots received:", snaps.length);
const last = snaps[snaps.length - 1];
if (last) {
  console.log("form.name:", last.form.name);
  console.log("questions:", JSON.stringify(last.form.questions.map((q) => ({ id: q.id, prompt: q.prompt, fmt: q.expectedResponseFormat })), null, 2));
  console.log("assistant said:", (last.messages.filter((m) => m.role === "assistant").pop()?.content ?? "").slice(0, 200));
  console.log("publishable (ready):", last.ready);
}
