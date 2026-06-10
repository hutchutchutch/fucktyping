"""Stable STT interface that every backend implements.

Phase A is file-based (the eval harness hands each adapter a wav path and times the
call). Streaming is declared via `supports_streaming` and an optional
`transcribe_stream` so realtime backends can be exercised later without changing the
interface the rest of the system depends on.
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Iterable, Iterator, Optional

import numpy as np


@dataclass
class STTResult:
    """One transcription plus the timing the harness needs for RTF."""
    transcript: str
    audio_seconds: float
    latency_seconds: float
    adapter: str = ""

    @property
    def rtf(self) -> float:
        """Real-time factor: latency / audio duration. <1 means faster than realtime."""
        if self.audio_seconds <= 0:
            return float("inf")
        return self.latency_seconds / self.audio_seconds


class STTAdapter(ABC):
    """Base class for a speech-to-text backend.

    Implementations should keep model loading in `load()` (called lazily) so that
    constructing an adapter is cheap and the harness can time load separately.
    """

    name: str = "base"
    supports_streaming: bool = False

    def __init__(self) -> None:
        self._loaded = False

    @abstractmethod
    def load(self) -> None:
        """Download/instantiate the model. Set self._loaded = True when done."""

    @abstractmethod
    def transcribe_file(self, wav_path: str) -> str:
        """Transcribe a wav file to text. Must call load() if not loaded."""

    def transcribe_array(self, audio: np.ndarray, sample_rate: int) -> str:
        """Transcribe an in-memory float32 mono array.

        Default writes a temp wav and calls transcribe_file, so every file-based
        adapter gets array support for free (used by the Pipecat STT service for live
        utterances). Streaming adapters may override for efficiency.
        """
        import os
        import tempfile

        import soundfile as sf

        self._ensure_loaded()
        fd, path = tempfile.mkstemp(suffix=".wav")
        os.close(fd)
        try:
            sf.write(path, audio, sample_rate)
            return self.transcribe_file(path)
        finally:
            try:
                os.unlink(path)
            except OSError:
                pass

    def start_stream(self, sample_rate: int, **kwargs) -> "StreamingSTTSession":
        """Begin an incremental streaming session (realtime-capable adapters only)."""
        raise NotImplementedError(f"{self.name} does not support streaming sessions")

    def _ensure_loaded(self) -> None:
        if not self._loaded:
            self.load()
            self._loaded = True


class StreamingSTTSession(ABC):
    """A live transcription session fed audio chunk-by-chunk.

    `add_audio` returns the current best partial transcript (cumulative); `finalize`
    returns the final transcript and releases resources. This shape lets the streaming
    latency harness timestamp each partial relative to the audio fed so far.
    """

    @abstractmethod
    def add_audio(self, chunk: np.ndarray) -> str:
        ...

    @abstractmethod
    def finalize(self) -> str:
        ...

    def close(self) -> None:
        pass

    def __enter__(self) -> "StreamingSTTSession":
        return self

    def __exit__(self, *exc) -> None:
        self.close()
