#!/usr/bin/env bash
# Voice port of "GTKY Goals and Aspirations Check-in" — delivers a voice form link to #goals; the answer routes
# back to #goals via the voice-answers-dyn webhook. Edit the brief to taste.
exec "$HOME/.hermes/scripts/voice-ask" "Goals check-in: what progress did you make toward your goals today, any new goal or aspiration to add, and what is blocking your biggest goal?" "discord:#goals"
