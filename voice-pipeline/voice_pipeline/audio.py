"""Audio loading / resampling / chunking helpers for the harnesses."""
from __future__ import annotations

from math import gcd

import numpy as np
import soundfile as sf


def _resample(audio: np.ndarray, sr: int, target_sr: int) -> np.ndarray:
    if sr == target_sr:
        return audio
    try:
        from scipy.signal import resample_poly  # best quality; pip install -e ".[stream]"
        g = gcd(sr, target_sr)
        return resample_poly(audio, target_sr // g, sr // g).astype(np.float32)
    except Exception:
        # linear-interp fallback — fine for timing, slightly worse for WER
        n = int(round(len(audio) * target_sr / sr))
        x_old = np.linspace(0.0, 1.0, num=len(audio), endpoint=False)
        x_new = np.linspace(0.0, 1.0, num=n, endpoint=False)
        return np.interp(x_new, x_old, audio).astype(np.float32)


def load_mono(path: str, target_sr: int = 16000) -> tuple[np.ndarray, int]:
    audio, sr = sf.read(path, dtype="float32")
    if audio.ndim > 1:
        audio = audio.mean(axis=1)
    audio = _resample(audio, sr, target_sr)
    return audio.astype(np.float32), target_sr


def chunk_audio(audio: np.ndarray, sample_rate: int, chunk_ms: int) -> list[np.ndarray]:
    n = max(1, int(sample_rate * chunk_ms / 1000))
    return [audio[i : i + n] for i in range(0, len(audio), n)]
