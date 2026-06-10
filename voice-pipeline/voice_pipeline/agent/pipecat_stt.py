"""Pipecat STT service that wraps any voice_pipeline STTAdapter.

Pipecat's VAD segments speech into utterances and calls run_stt with raw PCM
(s16le mono at self.sample_rate); we transcribe each utterance via the adapter on a
worker thread (adapters are blocking/CPU/MPS-bound).

NOTE: Pipecat import paths and the run_stt signature shift across versions. If imports
fail, check `pipecat.services` for the current STTService location.
"""
from __future__ import annotations

import asyncio

import numpy as np

from ..stt.base import STTAdapter

try:
    from pipecat.frames.frames import TranscriptionFrame
    from pipecat.services.stt_service import STTService
    from pipecat.utils.time import time_now_iso8601
    _PIPECAT = True
except Exception:  # pragma: no cover - allows import without pipecat installed
    STTService = object  # type: ignore
    _PIPECAT = False


class LocalSTTService(STTService):  # type: ignore[misc]
    def __init__(self, adapter: STTAdapter, sample_rate: int = 16000, **kwargs) -> None:
        if not _PIPECAT:
            raise ImportError("pipecat-ai not installed; run: pip install -e '.[agent]'")
        super().__init__(sample_rate=sample_rate, **kwargs)
        self._adapter = adapter

    async def run_stt(self, audio: bytes):
        samples = np.frombuffer(audio, dtype=np.int16).astype(np.float32) / 32768.0
        text = await asyncio.to_thread(self._adapter.transcribe_array, samples, self.sample_rate)
        if text:
            yield TranscriptionFrame(text, "", time_now_iso8601())
