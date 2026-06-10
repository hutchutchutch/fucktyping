"""The 'brain' processor: bridges transcripts to the form Durable Object.

This replaces a generic LLM service. Instead of free-form generation, the next thing
to say is decided by the DO's FormConfig interpreter (validation + which question is
next). Flow:

    TranscriptionFrame (user answer)
        -> DO.send_answer(text)            # outbound WS round-trip
        -> push reply as LLM/Text frames   # downstream TTS speaks it
        -> EndFrame when the form is complete

NOTE: Pipecat frame names/imports vary by version; adjust if imports fail.
"""
from __future__ import annotations

try:
    from pipecat.frames.frames import (
        EndFrame,
        LLMFullResponseEndFrame,
        LLMFullResponseStartFrame,
        TextFrame,
        TranscriptionFrame,
    )
    from pipecat.processors.frame_processor import FrameProcessor
    _PIPECAT = True
except Exception:  # pragma: no cover
    FrameProcessor = object  # type: ignore
    _PIPECAT = False

from .do_client import DurableObjectClient


class FormAgentProcessor(FrameProcessor):  # type: ignore[misc]
    def __init__(self, do_client: DurableObjectClient) -> None:
        if not _PIPECAT:
            raise ImportError("pipecat-ai not installed; run: pip install -e '.[agent]'")
        super().__init__()
        self._do = do_client

    async def _say(self, text: str) -> None:
        # Wrap in LLM response frames so the TTS service treats it as a spoken turn.
        await self.push_frame(LLMFullResponseStartFrame())
        await self.push_frame(TextFrame(text))
        await self.push_frame(LLMFullResponseEndFrame())

    async def kickoff(self) -> None:
        """Connect to the DO and speak the opening question. Call on client connect."""
        await self._do.connect()
        opening = await self._do.start()
        await self._say(opening.text)

    async def process_frame(self, frame, direction) -> None:
        await super().process_frame(frame, direction)

        if isinstance(frame, TranscriptionFrame):
            reply = await self._do.send_answer(frame.text)
            await self._say(reply.text)
            if reply.done:
                await self.push_frame(EndFrame())
            return

        await self.push_frame(frame, direction)
