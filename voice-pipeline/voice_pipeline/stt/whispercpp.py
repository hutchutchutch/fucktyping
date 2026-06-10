"""Path 3a: whisper.cpp (Metal-accelerated) via pywhispercpp.

API per pywhispercpp:
    from pywhispercpp.model import Model
    model = Model("base.en")          # downloads ggml weights on first use
    segments = model.transcribe("audio.wav")
    text = " ".join(seg.text for seg in segments)
"""
from __future__ import annotations

from .base import STTAdapter
from .. import config


class WhisperCppSTT(STTAdapter):
    name = "whispercpp"
    supports_streaming = False  # the `stream` example exists but is out of scope for Phase A

    def __init__(self, model: str | None = None, **model_kwargs) -> None:
        super().__init__()
        self.model_name = model or config.WHISPERCPP_MODEL
        self.model_kwargs = model_kwargs
        self._model = None

    def load(self) -> None:
        from pywhispercpp.model import Model  # type: ignore
        self._model = Model(self.model_name, **self.model_kwargs)

    def transcribe_file(self, wav_path: str) -> str:
        self._ensure_loaded()
        segments = self._model.transcribe(wav_path)
        return " ".join(seg.text.strip() for seg in segments).strip()
