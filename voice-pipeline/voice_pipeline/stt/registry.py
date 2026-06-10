"""Name -> adapter factory.

Imports are lazy and inside each branch so that installing only one backend's deps
(e.g. just `[parakeet]`) does not force the others (e.g. NeMo) to be importable.
"""
from __future__ import annotations

from .base import STTAdapter

AVAILABLE_STT = ["parakeet-mlx", "whispercpp", "nemo", "sherpa-onnx"]


def build_stt(name: str, **kwargs) -> STTAdapter:
    if name == "parakeet-mlx":
        from .parakeet_mlx import ParakeetMLXSTT
        return ParakeetMLXSTT(**kwargs)
    if name == "whispercpp":
        from .whispercpp import WhisperCppSTT
        return WhisperCppSTT(**kwargs)
    if name == "nemo":
        from .nemo_cpu import NeMoSTT
        return NeMoSTT(**kwargs)
    if name == "sherpa-onnx":
        from .sherpa_onnx import SherpaOnnxSTT
        return SherpaOnnxSTT(**kwargs)
    raise ValueError(f"Unknown STT adapter '{name}'. Available: {AVAILABLE_STT}")
