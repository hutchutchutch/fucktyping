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
# 2) here:
cd apps/studio
npm install
echo "VITE_EDGE_URL=http://localhost:8787" > .env.local   # default already points here
npm run dev          # http://localhost:5173
npm test             # snapshotToGraph unit tests
npm run typecheck
```
Talk to it: "Build a 3-question customer feedback form." Watch the graph fill in, then
**Publish** → the form lands in D1 and is immediately runnable at
`/forms/<formId>/session` (the runtime DO + the Mac voice pipeline).

## Voice
`MicButton` uses the browser Web Speech API (push-to-talk) for *form creation* — it just
fills the chat input. The realtime WebRTC/Cloudflare-Realtime path is for *form filling*
(the respondent side), handled by `voice-pipeline` + `apps/edge`'s runtime DO.

## Deploy (Cloudflare)
`npm run build` → `dist/`. Serve via Cloudflare Pages or Workers static assets. Set
`VITE_EDGE_URL` to the deployed edge worker's URL at build time.

## Not here yet
- Resumable drafts (persist `sessionId`, list "My forms" from D1).
- Inline node editing in the graph (today it's a read-only projection; edits go through chat).
- Auth (a signed token before the WS connects).
