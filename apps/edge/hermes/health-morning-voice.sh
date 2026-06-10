#!/usr/bin/env bash
# Voice port of "Health Morning Check-in" — delivers a voice form link to #health; the answer routes
# back to #health via the voice-answers-dyn webhook. Edit the brief to taste.
exec "$HOME/.hermes/scripts/voice-ask" "Health morning check-in: how did you sleep on a scale of 1 to 10, any soreness or pain, and what is your movement or workout plan for today?" "discord:#health"
