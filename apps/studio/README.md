# @fucktyping/studio

The three-pane, ChatGPT-style form-authoring UI. The creator chats (or speaks) in the
center; the right pane shows the **live conversation-flow graph** that the authoring
Durable Object builds from those interactions.

```
┌──────────┬──────────────────────────┬──────────────────────────┐
│ Left     │ Center: chat / voice     │ Right: live flow graph   │
│ sidebar  │ (creator ⇄ authoring DO) │ (opening→Q1→…→closing)   │
│ (links)  │                          │ React Flow, from snapshot │
└──────────┴──────────────────────────┴──────────────────────────┘
        all three read one WebSocket snapshot from apps/edge
```

## How it connects
Opens `ws(s)://<edge>/authoring/<sessionId>/session` (see `apps/edge`). The DO
broadcasts a full `snapshot` (`{ form, messages, ready }`) on every change; the chat
pane renders `messages`, the graph pane renders `form`. The model never writes code —
it calls tools that mutate the draft, and each mutation re-draws the graph.

| File | Role |
|------|------|
| `src/authoring/types.ts` | wire shapes (mirror of `apps/edge/src/authoring`) |
| `src/authoring/protocol.ts` | message builders + defensive server-message parse + `toWsUrl` |
| `src/authoring/graph.ts` | **pure** `snapshotToGraph(form)` → nodes/edges |
| `src/authoring/useAuthoringSession.ts` | WS hook: connect, init, send, publish, snapshot state |
| `src/components/{LeftSidebar,ChatPane,GraphPane,FormNode,MicButton}.tsx` | the three panes |

## Run
```bash
# 1) start the edge worker (apps/edge): npm run dev   → http://localhost:8787
# 2) start Vite for fast UI development:
cd apps/studio
npm ci
npm run dev          # http://localhost:5173
npm test
npm run typecheck
```
Talk to it: "Build a 3-question customer feedback form." Watch the graph fill in, then
**Publish** → the form lands in D1 and Studio returns a signed, expiring respondent link.

## Voice
`MicButton` records a bounded browser audio clip and sends it to the Worker for Whisper
transcription. The browser respondent follows the same Worker-hosted UI and connects to
the response Durable Object over a signed WebSocket session. `voice-pipeline` is an
experimental alternate client for local/Mac voice-agent work.

## Deploy (Cloudflare)

The Studio is built into `dist/` and deployed by `apps/edge` as Worker static assets.
Production deliberately uses the browser origin for HTTP and WebSocket APIs; it does
not depend on a separate Pages project or a baked API hostname.

```bash
npm run build
npm run test:e2e    # starts a local Worker and exercises the packaged app in Chromium
```

## Private-beta product boundary

Studio supports creating, publishing, reopening, and editing forms; generating fresh
signed respondent links; completing forms by voice or typed fallback; resuming an
interrupted respondent tab; and reviewing submitted answers with their question text.

Archiving/deleting forms, exporting responses, creator accounts with multiple tenants,
and configurable data retention are intentionally deferred beyond the private beta.
Until deletion and retention controls ship, treat production as a limited-access beta
and handle participant data according to the operating policy in the launch runbook.
