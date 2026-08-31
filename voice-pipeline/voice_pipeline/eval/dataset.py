"""Load an eval manifest: JSONL of {"audio": <path>, "text": <reference transcript>}."""
from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

import soundfile as sf

from .. import config


@dataclass
class Sample:
    audio_path: str
    reference: str
    duration: float  # seconds


def load_manifest(manifest_path: str | Path) -> list[Sample]:
    manifest_path = Path(manifest_path)
    base = manifest_path.parent
    samples: list[Sample] = []
    with manifest_path.open() as fh:
        for line_no, line in enumerate(fh, 1):
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            row = json.loads(line)
            audio = Path(row["audio"])
            if not audio.is_absolute():
                # resolve relative to the manifest, then to the project root
                audio = (base / audio) if (base / audio).exists() else (config.ROOT / row["audio"])
            if not audio.exists():
                raise FileNotFoundError(f"{manifest_path}:{line_no} audio not found: {row['audio']}")
            duration = float(sf.info(str(audio)).duration)
            samples.append(Sample(str(audio), row["text"], duration))
    if not samples:
        raise ValueError(f"No samples found in {manifest_path}")
    return samples
