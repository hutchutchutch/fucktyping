#!/usr/bin/env bash
# Voice port of "Health Evening Check-in" — delivers a voice form link to #health; the answer routes
# back to #health via the voice-answers-dyn webhook. Edit the brief to taste.
exec "$HOME/.hermes/scripts/voice-ask" "Health evening check-in: did you work out today and what did you do, how did you eat on a scale of 1 to 10, and how is your recovery and energy?" "discord:#health"
