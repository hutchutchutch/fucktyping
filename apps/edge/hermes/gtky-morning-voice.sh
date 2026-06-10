#!/usr/bin/env bash
# Pilot: GTKY morning check-in as a voice form. Wired into a Hermes cron via
#   hermes cron create "0 5 * * *" --name "GTKY Morning Check-in (voice)" \
#     --no-agent --script gtky-morning-voice --deliver discord:#gtky
# The cron runs this and delivers its stdout (the responder link) to #gtky.
exec "$HOME/.hermes/scripts/voice-ask" \
  "Morning check-in: how did you sleep, your energy level from 1 to 10, your single most important priority today, and any blockers?" \
  "discord:#gtky"
