"""Path 1: Nemotron ASR via NVIDIA NeMo, as-is on the Mac.

This is the "does it just work" path. Reality on Apple Silicon:
  - CPU works for non-streaming, push-to-talk transcription (0.6B is small).
  - MPS support in NeMo is partial; we set PYTORCH_ENABLE_MPS_FALLBACK=1 so unsupported
    ops fall back to CPU instead of crashing, and default to CPU for stability.
  - Cache-aware *streaming* is not expected to work here — use Path 2 (sherpa-onnx) or
    Path 3 (parakeet-mlx / whisper.cpp) for streaming on Mac.

API per the model card:
    import nemo.collections.asr as nemo_asr
    m = nemo_asr.models.ASRModel.from_pretrained("nvidia/nemotron-3.5-asr-streaming-0.6b")
    out = m.transcribe(["file.wav"])     # list of strings OR Hypothesis objects by version
"""
from __future__ import annotations

import os

from .base import STTAdapter
from .. import config


def _coerce_text(item) -> str:
    """NeMo returns str or a Hypothesis (with .text) depending on version."""
    if isinstance(item, str):
        return item.strip()
    text = getattr(item, "text", None)
    return (text or str(item)).strip()


class NeMoSTT(STTAdapter):
    name = "nemo"
    supports_streaming = False  # not on Mac; see module docstring

    def __init__(self, model_id: str | None = None, device: str = "cpu") -> None:
        super().__init__()
        self.model_id = model_id or config.NEMO_MODEL_ID
        self.device = device  # "cpu" (recommended on Mac) or "mps" (best-effort)
        self._model = None

    def load(self) -> None:
        os.environ.setdefault("PYTORCH_ENABLE_MPS_FALLBACK", "1")
        import nemo.collections.asr as nemo_asr  # type: ignore

        self._model = nemo_asr.models.ASRModel.from_pretrained(model_name=self.model_id)
        if self.device != "cpu":
            try:
                self._model = self._model.to(self.device)
            except Exception as exc:  # noqa: BLE001 - MPS gaps are expected
                print(f"[nemo] could not move model to {self.device} ({exc}); staying on CPU")
        self._model.eval()

    def transcribe_file(self, wav_path: str) -> str:
        self._ensure_loaded()
        out = self._model.transcribe([wav_path])
        # transcribe may return a list, or a tuple of (best, all) for some configs
        if isinstance(out, tuple):
            out = out[0]
        return _coerce_text(out[0])
