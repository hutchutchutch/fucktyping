"""Stable TTS interface. Returns float32 mono audio + sample rate so any backend
(MisoTTS today, a lighter streaming model later) is a drop-in swap.
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass

import numpy as np


@dataclass
class TTSResult:
    audio: np.ndarray       # float32 mono, range ~[-1, 1]
    sample_rate: int
    latency_seconds: float  # wall time to first/full audio
    audio_seconds: float

    @property
    def rtf(self) -> float:
        if self.audio_seconds <= 0:
            return float("inf")
        return self.latency_seconds / self.audio_seconds


class TTSAdapter(ABC):
    name: str = "base"
    supports_streaming: bool = False

    def __init__(self) -> None:
        self._loaded = False

    @abstractmethod
    def load(self) -> None:
        ...

    @abstractmethod
    def synthesize(self, text: str, **kwargs) -> tuple[np.ndarray, int]:
        """Return (audio float32 mono, sample_rate)."""

    def _ensure_loaded(self) -> None:
        if not self._loaded:
            self.load()
            self._loaded = True
