#!/usr/bin/env bash
# Voice port of "GTKY Noon Check-in" — delivers a voice form link to #gtky; the answer routes
# back to #gtky via the voice-answers-dyn webhook. Edit the brief to taste.
exec "$HOME/.hermes/scripts/voice-ask" "Midday check-in: how is your energy right now on a scale of 1 to 10, what have you accomplished so far, and what is the one thing to focus on this afternoon?" "discord:#gtky"
