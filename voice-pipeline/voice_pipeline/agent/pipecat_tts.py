"""Pipecat TTS service wrapping a voice_pipeline TTSAdapter (MisoTTS today).

MisoTTS is non-streaming, so we synthesize the whole utterance on a worker thread and
emit one raw-audio frame; Pipecat handles playout and resampling to the transport rate.
Default sample_rate is 24000 (Mimi codec); the actual rate is taken from the adapter at
synth time.
"""
from __future__ import annotations

import asyncio

import numpy as np

from ..tts.base import TTSAdapter

try:
    from pipecat.frames.frames import TTSAudioRawFrame, TTSStartedFrame, TTSStoppedFrame
    from pipecat.services.tts_service import TTSService
    _PIPECAT = True
except Exception:  # pragma: no cover
    TTSService = object  # type: ignore
    _PIPECAT = False


class LocalTTSService(TTSService):  # type: ignore[misc]
    def __init__(self, adapter: TTSAdapter, sample_rate: int = 24000, **kwargs) -> None:
        if not _PIPECAT:
            raise ImportError("pipecat-ai not installed; run: pip install -e '.[agent]'")
        super().__init__(sample_rate=sample_rate, **kwargs)
        self._adapter = adapter

    async def run_tts(self, text: str):
        yield TTSStartedFrame()
        audio, sr = await asyncio.to_thread(self._adapter.synthesize, text)
        pcm = (np.clip(audio, -1.0, 1.0) * 32767.0).astype(np.int16).tobytes()
        yield TTSAudioRawFrame(audio=pcm, sample_rate=sr, num_channels=1)
        yield TTSStoppedFrame()
