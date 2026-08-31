"""Smoke-test MisoTTS on MPS: synthesize a line, save it, report latency + RTF.

    python -m voice_pipeline.eval.run_tts_smoke --text "Hello from your voice agent." \
        --out results/miso.wav

Use --force-cpu if MPS hits a hard-coded .cuda() in the MisoTTS repo.
"""
from __future__ import annotations

import argparse
import time

import soundfile as sf

from .. import config
from ..tts.base import TTSResult
from ..tts.miso_mps import MisoTTS


def main() -> None:
    ap = argparse.ArgumentParser(description="MisoTTS smoke test on Apple Silicon.")
    ap.add_argument("--text", default="Hello from your voice agent.")
    ap.add_argument("--out", default=str(config.RESULTS_DIR / "miso.wav"))
    ap.add_argument("--device", default=None, help="mps | cpu | cuda (default: auto)")
    ap.add_argument("--force-cpu", action="store_true")
    ap.add_argument("--max-ms", type=int, default=10_000)
    args = ap.parse_args()

    config.ensure_dirs()
    tts = MisoTTS(device=args.device, force_cpu=args.force_cpu, max_audio_length_ms=args.max_ms)

    print(f"Loading MisoTTS on device={tts.device} ...")
    t0 = time.perf_counter()
    tts.load()
    tts._loaded = True
    print(f"Loaded in {time.perf_counter() - t0:.1f}s")

    t1 = time.perf_counter()
    audio, sr = tts.synthesize(args.text)
    latency = time.perf_counter() - t1

    audio_seconds = len(audio) / sr
    result = TTSResult(audio=audio, sample_rate=sr, latency_seconds=latency, audio_seconds=audio_seconds)
    sf.write(args.out, audio, sr)

    print(f"text       : {args.text!r}")
    print(f"audio       : {audio_seconds:.2f}s @ {sr} Hz -> {args.out}")
    print(f"latency     : {latency:.2f}s  (RTF {result.rtf:.2f}; <1 = faster than realtime)")


if __name__ == "__main__":
    main()
