"""Shared paths and model identifiers."""
from __future__ import annotations

import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SAMPLES_DIR = ROOT / "samples"
RESULTS_DIR = ROOT / "results"
MODELS_DIR = ROOT / "models"

# Path 2: where the exported Nemotron ONNX transducer files are expected to live.
SHERPA_MODEL_DIR = MODELS_DIR / "nemotron-onnx"
SHERPA_FILES = {
    "encoder": SHERPA_MODEL_DIR / "encoder.onnx",
    "decoder": SHERPA_MODEL_DIR / "decoder.onnx",
    "joiner": SHERPA_MODEL_DIR / "joiner.onnx",
    "tokens": SHERPA_MODEL_DIR / "tokens.txt",
}

# Default HF model ids per backend.
PARAKEET_MODEL_ID = os.environ.get("PARAKEET_MODEL_ID", "mlx-community/parakeet-tdt-0.6b-v3")
WHISPERCPP_MODEL = os.environ.get("WHISPERCPP_MODEL", "base.en")
NEMO_MODEL_ID = os.environ.get("NEMO_MODEL_ID", "nvidia/nemotron-3.5-asr-streaming-0.6b")
MISO_REPO_ID = os.environ.get("MISO_REPO_ID", "MisoLabs/MisoTTS")


def ensure_dirs() -> None:
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    SAMPLES_DIR.mkdir(parents=True, exist_ok=True)
