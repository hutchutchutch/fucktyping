#!/usr/bin/env bash
# voice-ask — turn a free-text brief into a voice form and print the responder link.
# Prints ONE line to stdout (the link message) so it composes with delivery:
#   - cron:   hermes cron create "0 5 * * *" --no-agent --script <wrapper> --deliver discord:#gtky
#   - manual: ~/.hermes/scripts/voice-ask "..." | hermes send --to discord:#gtky
#
#   voice-ask "<brief>" [discord:#channel-for-meta]
#
# Env (set in ~/.hermes/.env):
#   VOICE_CREATE_TOKEN  (required)  Bearer token for the worker's POST /forms
#   VOICE_WORKER_URL    (optional)  default https://fucktyping-edge.hutchenbach.workers.dev
#   VOICE_CALLBACK_URL  (optional)  default .../webhooks/voice-answers-dyn (routes per channel)
set -euo pipefail

BRIEF="${1:?usage: voice-ask \"<brief>\" [discord:#channel]}"
TARGET="${2:-discord:#gtky}"
WORKER="${VOICE_WORKER_URL:-https://fucktyping-edge.hutchenbach.workers.dev}"
CALLBACK="${VOICE_CALLBACK_URL:-https://ig-webhooks.hutchgpt.com/webhooks/voice-answers-dyn}"
: "${VOICE_CREATE_TOKEN:?set VOICE_CREATE_TOKEN in ~/.hermes/.env}"

# Resolve "discord:#health" -> numeric channel id so the webhook routes the answer back
# to that channel via --deliver-chat-id "{discordChatId}".
chan="${TARGET#discord:}"; chan="${chan#\#}"
chid=$(hermes send --list discord 2>/dev/null | grep -E "discord:${chan}[[:space:]]" | grep -oE '\[[0-9]+\]' | tr -d '[]' | head -1 || true)
[ -z "$chid" ] && printf 'voice-ask: warning — could not resolve channel id for %s\n' "$TARGET" >&2

body=$(BRIEF="$BRIEF" TARGET="$TARGET" CALLBACK="$CALLBACK" CHID="$chid" python3 -c '
import json, os
print(json.dumps({
  "brief": os.environ["BRIEF"],
  "callbackUrl": os.environ["CALLBACK"],
  "meta": {"discord": os.environ["TARGET"], "discordChatId": os.environ["CHID"]},
}))')

resp=$(curl -fsS --max-time 120 -X POST "$WORKER/forms" \
  -H "authorization: Bearer $VOICE_CREATE_TOKEN" -H "content-type: application/json" -d "$body")
printf 'voice-ask create: %s\n' "$resp" >&2
url=$(printf '%s' "$resp" | python3 -c 'import sys,json; print(json.load(sys.stdin)["responderUrl"])')

echo "🎙 Voice check-in — tap to answer aloud → $url"
