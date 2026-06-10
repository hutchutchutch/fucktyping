// Local smoke test against `wrangler dev` (no external keys needed):
//  - authoring WS: init -> snapshot (static greeting + empty draft)
//  - runtime WS:   start -> opening+Q1, then answers validated by the HEURISTIC
//    fallback (no AI Gateway key) advancing through the sample form.
const BASE = "ws://127.0.0.1:8787";

function run(url, steps, tailMs = 2000) {
  return new Promise((resolve) => {
    const got = [];
    const ws = new WebSocket(url);
    ws.addEventListener("open", () => {
      for (const s of steps) setTimeout(() => ws.send(JSON.stringify(s.msg)), s.after);
    });
    ws.addEventListener("message", (e) => got.push(String(e.data)));
    ws.addEventListener("error", () => got.push("__WS_ERROR__"));
    const last = steps.reduce((m, s) => Math.max(m, s.after), 0);
    setTimeout(() => {
      try { ws.close(); } catch {}
      resolve(got);
    }, last + tailMs);
  });
}

console.log("--- AUTHORING /authoring/smoke-1/session ---");
for (const m of await run(`${BASE}/authoring/smoke-1/session`, [{ after: 100, msg: { type: "init" } }])) {
  console.log("  <-", m.slice(0, 220));
}

console.log("--- RUNTIME /forms/sample/session ---");
for (const m of await run(`${BASE}/forms/sample/session?session=smoke-r1`, [
  { after: 100, msg: { type: "start" } },
  { after: 900, msg: { type: "user_answer", text: "Hutch" } },
  { after: 1700, msg: { type: "user_answer", text: "five" } },
  { after: 2500, msg: { type: "user_answer", text: "yes" } },
], 1500)) {
  console.log("  <-", m.slice(0, 220));
}
