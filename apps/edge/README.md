# @fucktyping/edge

The Cloudflare runtime "brain" for voice forms. A **Durable Object per response session**
interprets a `FormConfig` as a state machine, validates spoken answers through **AI
Gateway**, persists collected structured output to **D1**, and speaks the WebSocket
protocol that the Mac voice pipeline (`voice-pipeline/voice_pipeline/agent/do_client.py`)
expects.

```
do_client.py  ──WS──▶  Worker (Hono)  ──▶  FormSessionDO  ──▶  D1 (responses)
                       /forms/:id/session      │
                                               ├─ FormInterpreter (opening→ask→validate→rephrase→close)
                                               └─ Validator ──▶ AI Gateway ──▶ LLM
```

## WS protocol (matches do_client.py)
```
client → {"type":"start","form_id":"sample"}
server ← {"type":"assistant","text":"<greeting + first question>","done":false}
client → {"type":"user_answer","text":"<transcript>"}
server ← {"type":"assistant","text":"<next question | rephrase | closing>","done":<bool>}
```
`done:true` ⇒ the FormConfig is fully collected; the row is written to `responses`.

## Files
| File | Role |
|------|------|
| `src/index.ts` | Hono Worker; WS upgrade → routes to a DO per `(formId, sessionId)` |
| `src/do/FormSessionDO.ts` | the DO; WebSocket Hibernation API + state in DO storage |
| `src/do/interpreter.ts` | fixed-shape state machine (ported from the legacy LangGraph nodes) |
| `src/do/validator.ts` | AI Gateway LLM validation + deterministic heuristic fallback |
| `src/do/protocol.ts` | client/server message types |
| `src/forms/types.ts` | `FormConfig` / `Question` (Zod) |
| `src/forms/repository.ts` | D1 load FormConfig / save responses (falls back to sample form) |
| `src/seed/sample-form.ts` | runnable sample so the DO works before any form is authored |

## Run locally
```bash
cd apps/edge
npm install
npm test                              # interpreter unit tests (no network)
wrangler d1 create fucktyping         # paste the id into wrangler.jsonc
npm run db:migrate:local
npm run dev                           # http://localhost:8787
```
Smoke-test the socket against the sample form (e.g. with websocat):
```bash
websocat "ws://localhost:8787/forms/sample/session"
{"type":"start","form_id":"sample"}
{"type":"user_answer","text":"Hutch"}
{"type":"user_answer","text":"five"}
{"type":"user_answer","text":"yes"}
{"type":"user_answer","text":"great service"}
```
Then point the pipeline at it:
```bash
python -m voice_pipeline.agent.run_agent --stt parakeet-mlx \
    --do-url ws://localhost:8787/forms/sample/session
```

## AI Gateway
Without `AI_GATEWAY_ACCOUNT_ID` + `LLM_API_KEY`, the validator uses the heuristic
fallback (good enough for yes/no, numbers, email, choices). To enable the LLM:
```bash
# set AI_GATEWAY_ACCOUNT_ID / AI_GATEWAY_ID / LLM_PROVIDER / LLM_MODEL in wrangler.jsonc
wrangler secret put LLM_API_KEY
```

## Authoring DO (form creation)

The other half: a per-session `FormAuthoringDO` where the creator chats and an LLM
tool-calling loop builds a **draft FormConfig**. On every change the DO broadcasts the
full state — that broadcast drives both the chat pane and the **live graph pane**.

```
creator browser ─WS─▶ /authoring/:sessionId/session ─▶ FormAuthoringDO
                                                          ├─ LLMAuthoringBrain ─▶ AI Gateway (tool calls)
                                                          ├─ reducer (applyMutations) → draft FormConfig
                                                          └─ on publish: validate → D1 `forms`
```

WS protocol:
```
client → {"type":"init"}                          server ← {"type":"snapshot","form":<draft>,"messages":[...],"ready":<bool>}
client → {"type":"user_message","text":"..."}      server ← {"type":"thinking"} then {"type":"snapshot",...}
client → {"type":"publish"}                        server ← {"type":"published","formId":"..."}  | {"type":"error","message":"..."}
```

The model never writes code — it calls tools (`add_question`, `update_question`,
`reorder_questions`, `set_opening`, …) that mutate the draft via a pure reducer
(`authoring/reducer.ts`). A published form lands in D1 and is immediately runnable at
`/forms/<formId>/session`. Authoring uses a stronger tool-calling model
(`AUTHORING_PROVIDER`/`AUTHORING_MODEL`, key via `wrangler secret put AUTHORING_API_KEY`).

The frontend renders the snapshot's `messages` in the center pane and `form` (questions
as nodes, order as edges) in the right pane — re-rendering on each broadcast.

## Not here yet
- The **frontend** three-pane UI that consumes the authoring snapshots.
- The **Cloudflare Realtime** media transport (see `voice-pipeline/.../cloudflare_realtime.py`).
- Auth on both session endpoints (add a signed token before exposing publicly).
