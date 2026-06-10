"""Word Error Rate with light normalization.

Uses jiwer if installed (preferred), otherwise a pure-python word-level Levenshtein so
the harness runs with zero extra deps.
"""
from __future__ import annotations

import re
import string

_PUNCT = str.maketrans("", "", string.punctuation)


def normalize_text(text: str) -> str:
    text = text.lower().translate(_PUNCT)
    return re.sub(r"\s+", " ", text).strip()


def _wer_pure(ref: str, hyp: str) -> float:
    r = normalize_text(ref).split()
    h = normalize_text(hyp).split()
    if not r:
        return 0.0 if not h else 1.0
    # word-level edit distance (Levenshtein)
    prev = list(range(len(h) + 1))
    for i, rw in enumerate(r, 1):
        cur = [i] + [0] * len(h)
        for j, hw in enumerate(h, 1):
            cost = 0 if rw == hw else 1
            cur[j] = min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost)
        prev = cur
    return prev[len(h)] / len(r)


def word_error_rate(ref: str, hyp: str) -> float:
    try:
        import jiwer  # type: ignore
        return float(jiwer.wer(normalize_text(ref), normalize_text(hyp)))
    except Exception:
        return _wer_pure(ref, hyp)
