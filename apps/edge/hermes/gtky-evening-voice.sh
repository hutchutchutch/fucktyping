#!/usr/bin/env bash
# Voice port of "GTKY Evening Check-in" — delivers a voice form link to #gtky; the answer routes
# back to #gtky via the voice-answers-dyn webhook. Edit the brief to taste.
exec "$HOME/.hermes/scripts/voice-ask" "Evening check-in: what went well today, what drained you, your energy 1 to 10, and one thing you are grateful for?" "discord:#gtky"
