"""MisoTTS (8B, CSM architecture) on Apple Silicon via MPS.

MisoTTS API (from the cloned MisoLabs/MisoTTS repo, installed with `pip install -e`):
    from generator import load_miso_8b, Segment
    gen = load_miso_8b(device=device, model_path_or_repo_id="MisoLabs/MisoTTS")
    audio = gen.generate(text=..., speaker=0, context=[], max_audio_length_ms=10_000)
    # audio is a torch tensor; gen.sample_rate is the output rate

Apple-Silicon notes:
  - Their loader only branches cuda/cpu, so we explicitly pass device="mps".
  - We set PYTORCH_ENABLE_MPS_FALLBACK=1 so any op MPS lacks falls back to CPU instead
    of crashing — this is the single most important flag for running novel PyTorch
    models on MPS.
  - If load/generate hits a hard-coded `.cuda()` in their code, set force_cpu=True
    (slower but functional) until the call site is patched.
  - MisoTTS is non-streaming and English-only; first-audio latency == full generation.
"""
from __future__ import annotations

import os

import numpy as np

from .base import TTSAdapter
from .. import config


def _pick_device() -> str:
    import torch
    if torch.backends.mps.is_available():
        return "mps"
    if torch.cuda.is_available():
        return "cuda"
    return "cpu"


class MisoTTS(TTSAdapter):
    name = "miso"
    supports_streaming = False

    def __init__(
        self,
        device: str | None = None,
        repo_id: str | None = None,
        speaker: int = 0,
        max_audio_length_ms: int = 10_000,
        force_cpu: bool = False,
    ) -> None:
        super().__init__()
        self.repo_id = repo_id or config.MISO_REPO_ID
        self.speaker = speaker
        self.max_audio_length_ms = max_audio_length_ms
        self.device = "cpu" if force_cpu else (device or _pick_device())
        self._gen = None

    def load(self) -> None:
        os.environ.setdefault("PYTORCH_ENABLE_MPS_FALLBACK", "1")
        from generator import load_miso_8b  # type: ignore  # from cloned MisoTTS repo

        self._gen = load_miso_8b(device=self.device, model_path_or_repo_id=self.repo_id)

    def synthesize(self, text: str, context=None, speaker: int | None = None, **_) -> tuple[np.ndarray, int]:
        self._ensure_loaded()
        import torch

        audio = self._gen.generate(
            text=text,
            speaker=self.speaker if speaker is None else speaker,
            context=context or [],
            max_audio_length_ms=self.max_audio_length_ms,
        )
        arr = audio.detach().to("cpu").to(torch.float32).numpy()
        return arr, int(self._gen.sample_rate)
