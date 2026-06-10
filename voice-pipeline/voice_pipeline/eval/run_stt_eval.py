"""Benchmark STT adapters head-to-head: WER, latency, RTF.

    python -m voice_pipeline.eval.run_stt_eval \
        --adapters parakeet-mlx whispercpp nemo \
        --manifest samples/manifest.jsonl --warmup

Adapters whose deps aren't installed (or that fail to load) are skipped with a note,
so partial installs and the not-yet-ready sherpa-onnx slot don't abort the run.
"""
from __future__ import annotations

import argparse
import json
import statistics
import time
from dataclasses import asdict, dataclass

from .. import config
from ..stt import AVAILABLE_STT, build_stt
from .dataset import load_manifest, Sample
from .metrics import word_error_rate


@dataclass
class PerSample:
    audio: str
    reference: str
    hypothesis: str
    wer: float
    audio_seconds: float
    latency_seconds: float
    rtf: float


@dataclass
class AdapterReport:
    adapter: str
    status: str               # "ok" | "skipped" | "error"
    detail: str = ""
    load_seconds: float = 0.0
    mean_wer: float = 0.0
    mean_latency: float = 0.0
    mean_rtf: float = 0.0
    samples: list | None = None


def _bench_adapter(name: str, samples: list[Sample], warmup: bool) -> AdapterReport:
    try:
        adapter = build_stt(name)
    except Exception as exc:  # noqa: BLE001
        return AdapterReport(adapter=name, status="error", detail=f"build failed: {exc}")

    t0 = time.perf_counter()
    try:
        adapter.load()
        adapter._loaded = True
    except ImportError as exc:
        return AdapterReport(adapter=name, status="skipped", detail=f"not installed: {exc}")
    except Exception as exc:  # noqa: BLE001 (e.g. Path 2 files missing)
        return AdapterReport(adapter=name, status="skipped", detail=str(exc))
    load_seconds = time.perf_counter() - t0

    if warmup:
        try:
            adapter.transcribe_file(samples[0].audio_path)
        except Exception:  # noqa: BLE001 - warmup failure surfaces below
            pass

    rows: list[PerSample] = []
    for s in samples:
        try:
            t = time.perf_counter()
            hyp = adapter.transcribe_file(s.audio_path)
            latency = time.perf_counter() - t
        except Exception as exc:  # noqa: BLE001
            return AdapterReport(adapter=name, status="error", detail=f"transcribe failed: {exc}",
                                 load_seconds=load_seconds)
        w = word_error_rate(s.reference, hyp)
        rtf = latency / s.duration if s.duration else float("inf")
        rows.append(PerSample(s.audio_path, s.reference, hyp, w, s.duration, latency, rtf))

    return AdapterReport(
        adapter=name,
        status="ok",
        load_seconds=load_seconds,
        mean_wer=statistics.mean(r.wer for r in rows),
        mean_latency=statistics.mean(r.latency_seconds for r in rows),
        mean_rtf=statistics.mean(r.rtf for r in rows),
        samples=[asdict(r) for r in rows],
    )


def _print_table(reports: list[AdapterReport]) -> None:
    print(f"\n{'adapter':<16} {'status':<8} {'WER':>7} {'lat(s)':>8} {'RTF':>7} {'load(s)':>8}")
    print("-" * 60)
    for r in reports:
        if r.status == "ok":
            print(f"{r.adapter:<16} {r.status:<8} {r.mean_wer:>7.3f} {r.mean_latency:>8.2f} "
                  f"{r.mean_rtf:>7.2f} {r.load_seconds:>8.1f}")
        else:
            print(f"{r.adapter:<16} {r.status:<8}  {r.detail}")
    print()


def main() -> None:
    ap = argparse.ArgumentParser(description="Benchmark STT adapters (WER / latency / RTF).")
    ap.add_argument("--adapters", nargs="+", default=AVAILABLE_STT,
                    help=f"subset of {AVAILABLE_STT}")
    ap.add_argument("--manifest", default=str(config.SAMPLES_DIR / "manifest.jsonl"))
    ap.add_argument("--warmup", action="store_true", help="one untimed pass to warm the model")
    args = ap.parse_args()

    config.ensure_dirs()
    samples = load_manifest(args.manifest)
    print(f"Loaded {len(samples)} samples "
          f"({sum(s.duration for s in samples):.1f}s audio) from {args.manifest}")

    reports = [_bench_adapter(name, samples, args.warmup) for name in args.adapters]
    _print_table(reports)

    out = config.RESULTS_DIR / f"stt_eval_{int(time.time())}.json"
    out.write_text(json.dumps([asdict(r) for r in reports], indent=2))
    print(f"Wrote {out}")

    ok = [r for r in reports if r.status == "ok"]
    if ok:
        best = min(ok, key=lambda r: r.mean_wer)
        print(f"Lowest WER: {best.adapter} ({best.mean_wer:.3f}, RTF {best.mean_rtf:.2f})")


if __name__ == "__main__":
    main()
