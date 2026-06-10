#!/usr/bin/env bash
# Voice port of "GTKY Weekly Life Review" — delivers a voice form link to #gtky; the answer routes
# back to #gtky via the voice-answers-dyn webhook. Edit the brief to taste.
exec "$HOME/.hermes/scripts/voice-ask" "Weekly life review: what were your biggest wins this week, what would you change, how aligned were you with your goals 1 to 10, and what is your focus for next week?" "discord:#gtky"
