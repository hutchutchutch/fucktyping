"""Path 3b: NVIDIA Parakeet (FastConformer) on Apple MLX.

API per parakeet-mlx:
    from parakeet_mlx import from_pretrained
    model = from_pretrained("mlx-community/parakeet-tdt-0.6b-v3")
    result = model.transcribe("audio.wav"); result.text
    # streaming: with model.transcribe_stream(context_size=(256,256)) as t: t.add_audio(chunk); t.result
"""
from __future__ import annotations

from .base import STTAdapter, StreamingSTTSession
from .. import config


class ParakeetMLXSTT(STTAdapter):
    name = "parakeet-mlx"
    supports_streaming = True

    def __init__(self, model_id: str | None = None) -> None:
        super().__init__()
        self.model_id = model_id or config.PARAKEET_MODEL_ID
        self._model = None

    def load(self) -> None:
        from parakeet_mlx import from_pretrained  # type: ignore
        self._model = from_pretrained(self.model_id)

    def transcribe_file(self, wav_path: str) -> str:
        self._ensure_loaded()
        result = self._model.transcribe(wav_path)
        return result.text.strip()

    def start_stream(self, sample_rate: int, context_size=(256, 256)) -> StreamingSTTSession:
        self._ensure_loaded()
        return _ParakeetStreamSession(self._model, context_size)


class _ParakeetStreamSession(StreamingSTTSession):
    """Wraps parakeet-mlx's `transcribe_stream` context manager.

    Assumes ~16 kHz float32 mono chunks (resample upstream). add_audio accepts an MLX
    array; we convert from numpy if mlx is importable.
    """

    def __init__(self, model, context_size):
        self._cm = model.transcribe_stream(context_size=context_size)
        self._tx = self._cm.__enter__()

    @staticmethod
    def _coerce(chunk):
        try:
            import mlx.core as mx  # parakeet-mlx operates on mlx arrays
            return mx.array(chunk)
        except Exception:
            return chunk

    def add_audio(self, chunk) -> str:
        self._tx.add_audio(self._coerce(chunk))
        result = getattr(self._tx, "result", None)
        return (result.text if result else "").strip()

    def finalize(self) -> str:
        result = getattr(self._tx, "result", None)
        return (result.text if result else "").strip()

    def close(self) -> None:
        try:
            self._cm.__exit__(None, None, None)
        except Exception:
            pass
