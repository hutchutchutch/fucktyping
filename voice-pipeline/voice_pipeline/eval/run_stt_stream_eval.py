"""Streaming-latency benchmark — the metric that actually decides realtime feasibility.

Unlike run_stt_eval (whole-file WER + RTF), this feeds audio chunk-by-chunk through a
streaming session and measures *responsiveness*:

  - first_partial_s : compute time until the first non-empty partial transcript appears
  - max_chunk_ms    : worst per-chunk compute time. If this exceeds the chunk duration,
                      the model cannot keep up with live audio at that moment.
  - stream_rtf      : total compute / audio duration (headroom; must be < 1 for realtime)
  - finalize_s      : compute time to produce the final transcript after the last chunk
  - final_wer       : WER of the final transcript vs the reference

    python -m voice_pipeline.eval.run_stt_stream_eval \
        --adapters parakeet-mlx --manifest samples/manifest.jsonl --chunk-ms 320 --realtime

Only streaming-capable adapters run; others are skipped with a note.
"""
from __future__ import annotations

import argparse
import json
import statistics
import time
from dataclasses import asdict, dataclass

from .. import config
from ..audio import chunk_audio, load_mono
from ..stt import AVAILABLE_STT, build_stt
from .dataset import load_manifest, Sample
from .metrics import word_error_rate


@dataclass
class StreamSampleResult:
    audio: str
    reference: str
    final_hyp: str
    final_wer: float
    audio_seconds: float
    first_partial_s: float
    mean_chunk_ms: float
    max_chunk_ms: float
    finalize_s: float
    stream_rtf: float
    keeps_up: bool


@dataclass
class StreamReport:
    adapter: str
    status: str
    detail: str = ""
    chunk_ms: int = 0
    mean_first_partial_s: float = 0.0
    mean_max_chunk_ms: float = 0.0
    mean_stream_rtf: float = 0.0
    mean_final_wer: float = 0.0
    keeps_up: bool = False
    samples: list | None = None


def _bench_sample(adapter, s: Sample, sample_rate: int, chunk_ms: int, realtime: bool) -> StreamSampleResult:
    audio, sr = load_mono(s.audio_path, target_sr=sample_rate)
    chunks = chunk_audio(audio, sr, chunk_ms)
    chunk_budget_s = chunk_ms / 1000.0

    session = adapter.start_stream(sr)
    per_chunk_ms: list[float] = []
    first_partial_s = float("nan")
    cumulative_compute = 0.0
    try:
        for chunk in chunks:
            t = time.perf_counter()
            partial = session.add_audio(chunk)
            dt = time.perf_counter() - t
            cumulative_compute += dt
            per_chunk_ms.append(dt * 1000.0)
            if partial and first_partial_s != first_partial_s:  # NaN check = not yet set
                first_partial_s = cumulative_compute
            if realtime:
                slack = chunk_budget_s - dt
                if slack > 0:
                    time.sleep(slack)

        t = time.perf_counter()
        final = session.finalize()
        finalize_s = time.perf_counter() - t
        cumulative_compute += finalize_s
    finally:
        session.close()

    max_chunk_ms = max(per_chunk_ms) if per_chunk_ms else 0.0
    return StreamSampleResult(
        audio=s.audio_path,
        reference=s.reference,
        final_hyp=final,
        final_wer=word_error_rate(s.reference, final),
        audio_seconds=s.duration,
        first_partial_s=0.0 if first_partial_s != first_partial_s else first_partial_s,
        mean_chunk_ms=statistics.mean(per_chunk_ms) if per_chunk_ms else 0.0,
        max_chunk_ms=max_chunk_ms,
        finalize_s=finalize_s,
        stream_rtf=cumulative_compute / s.duration if s.duration else float("inf"),
        keeps_up=max_chunk_ms <= chunk_ms,
    )


def _bench_adapter(name: str, samples: list[Sample], sample_rate: int, chunk_ms: int, realtime: bool) -> StreamReport:
    try:
        adapter = build_stt(name)
    except Exception as exc:  # noqa: BLE001
        return StreamReport(adapter=name, status="error", detail=f"build failed: {exc}", chunk_ms=chunk_ms)

    if not getattr(adapter, "supports_streaming", False):
        return StreamReport(adapter=name, status="skipped", detail="no streaming support", chunk_ms=chunk_ms)

    try:
        adapter.load()
        adapter._loaded = True
    except ImportError as exc:
        return StreamReport(adapter=name, status="skipped", detail=f"not installed: {exc}", chunk_ms=chunk_ms)
    except Exception as exc:  # noqa: BLE001
        return StreamReport(adapter=name, status="skipped", detail=str(exc), chunk_ms=chunk_ms)

    rows: list[StreamSampleResult] = []
    for s in samples:
        try:
            rows.append(_bench_sample(adapter, s, sample_rate, chunk_ms, realtime))
        except NotImplementedError as exc:
            return StreamReport(adapter=name, status="skipped", detail=str(exc), chunk_ms=chunk_ms)
        except Exception as exc:  # noqa: BLE001
            return StreamReport(adapter=name, status="error", detail=f"stream failed: {exc}", chunk_ms=chunk_ms)

    return StreamReport(
        adapter=name,
        status="ok",
        chunk_ms=chunk_ms,
        mean_first_partial_s=statistics.mean(r.first_partial_s for r in rows),
        mean_max_chunk_ms=statistics.mean(r.max_chunk_ms for r in rows),
        mean_stream_rtf=statistics.mean(r.stream_rtf for r in rows),
        mean_final_wer=statistics.mean(r.final_wer for r in rows),
        keeps_up=all(r.keeps_up for r in rows),
        samples=[asdict(r) for r in rows],
    )


def _print_table(reports: list[StreamReport], chunk_ms: int) -> None:
    print(f"\nchunk budget: {chunk_ms} ms  (max_chunk must stay under this to keep up)")
    print(f"{'adapter':<16} {'status':<8} {'WER':>6} {'1st(s)':>7} {'maxchunk':>9} {'RTF':>6} {'keepsup':>8}")
    print("-" * 68)
    for r in reports:
        if r.status == "ok":
            print(f"{r.adapter:<16} {r.status:<8} {r.mean_final_wer:>6.3f} "
                  f"{r.mean_first_partial_s:>7.2f} {r.mean_max_chunk_ms:>8.0f}ms "
                  f"{r.mean_stream_rtf:>6.2f} {('yes' if r.keeps_up else 'NO'):>8}")
        else:
            print(f"{r.adapter:<16} {r.status:<8}  {r.detail}")
    print()


def main() -> None:
    ap = argparse.ArgumentParser(description="Streaming STT latency benchmark.")
    ap.add_argument("--adapters", nargs="+", default=["parakeet-mlx", "sherpa-onnx"],
                    help=f"subset of {AVAILABLE_STT} (streaming-capable only)")
    ap.add_argument("--manifest", default=str(config.SAMPLES_DIR / "manifest.jsonl"))
    ap.add_argument("--chunk-ms", type=int, default=320)
    ap.add_argument("--sample-rate", type=int, default=16000)
    ap.add_argument("--realtime", action="store_true",
                    help="pace feeding to wall-clock to emulate a live mic")
    args = ap.parse_args()

    config.ensure_dirs()
    samples = load_manifest(args.manifest)
    print(f"Loaded {len(samples)} samples ({sum(s.duration for s in samples):.1f}s) from {args.manifest}")

    reports = [_bench_adapter(n, samples, args.sample_rate, args.chunk_ms, args.realtime) for n in args.adapters]
    _print_table(reports, args.chunk_ms)

    out = config.RESULTS_DIR / f"stt_stream_eval_{int(time.time())}.json"
    out.write_text(json.dumps([asdict(r) for r in reports], indent=2))
    print(f"Wrote {out}")


if __name__ == "__main__":
    main()
