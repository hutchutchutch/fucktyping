/** Pure, browser-independent helpers for incremental (chunked) transcription.
 *
 * Workers AI Whisper is one-shot, so we fake "streaming" by repeatedly
 * transcribing a growing audio buffer. Each tick we transcribe only the
 * portion we have not transcribed yet (a rolling segment), then dedup the
 * returned text against what we already emitted before appending.
 *
 * These functions contain the segment-boundary and dedup math and have no
 * DOM / Web-Audio dependency, so they are unit-testable (and runnable under
 * `node --experimental-transform-types`). */

export interface Segment {
  /** First sample index (inclusive) to feed to the transcriber. */
  start: number;
  /** Last sample index (exclusive). */
  end: number;
}

/** Given the total number of decoded samples so far and a cursor marking how
 *  far we have already transcribed, compute the next segment to transcribe.
 *
 *  We back the start up by `overlapSec` worth of samples so words that were
 *  mid-utterance at the previous boundary are seen in full this time; the text
 *  dedup (see {@link dedupAppend}) then removes the repeated words. Returns
 *  `null` when there is no fresh audio worth sending. */
export function nextSegment(
  totalSamples: number,
  sampleRate: number,
  cursorSample: number,
  opts: { overlapSec?: number; minNewSec?: number } = {},
): Segment | null {
  const overlapSec = opts.overlapSec ?? 0.4;
  const minNewSec = opts.minNewSec ?? 0;
  const fresh = totalSamples - cursorSample;
  if (fresh <= 0) return null;
  if (fresh < Math.floor(minNewSec * sampleRate)) return null;
  const overlap = Math.floor(overlapSec * sampleRate);
  const start = Math.max(0, cursorSample - overlap);
  return { start, end: totalSamples };
}

/** Normalize a transcript fragment into comparable lowercase word tokens
 *  (drops surrounding punctuation, collapses whitespace). */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}'\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/** Length (in words) of the longest suffix of `prev` that equals a prefix of
 *  `next`, comparing normalized tokens. Used to drop the overlap region that
 *  both the previous and current segment transcribed. */
export function overlapWordCount(prevTokens: string[], nextTokens: string[]): number {
  const max = Math.min(prevTokens.length, nextTokens.length);
  for (let k = max; k > 0; k--) {
    let match = true;
    for (let i = 0; i < k; i++) {
      if (prevTokens[prevTokens.length - k + i] !== nextTokens[i]) {
        match = false;
        break;
      }
    }
    if (match) return k;
  }
  return 0;
}

export interface DedupResult {
  /** The novel text to hand to onTranscript (already trimmed), or "" if none. */
  emit: string;
  /** The full running transcript after appending `emit`, to carry forward. */
  running: string;
}

/** Append a freshly returned segment transcript to the running transcript,
 *  removing any leading words that duplicate the tail of what we already have.
 *
 *  Because segments include a backwards overlap, Whisper re-transcribes the
 *  last few words of the prior segment; we detect that word overlap and emit
 *  only the genuinely new words. Whitespace-only / fully-duplicate fragments
 *  emit nothing. */
export function dedupAppend(running: string, segmentText: string): DedupResult {
  const next = segmentText.trim();
  if (!next) return { emit: "", running };

  const prevTokens = tokenize(running);
  const nextTokens = tokenize(next);
  if (nextTokens.length === 0) return { emit: "", running };

  const skip = overlapWordCount(prevTokens, nextTokens);
  if (skip >= nextTokens.length) return { emit: "", running }; // entirely duplicate

  // Map the number of words to skip back onto the raw (punctuated) string so we
  // preserve the original casing/punctuation of the emitted portion.
  const emit = dropLeadingWords(next, skip).trim();
  if (!emit) return { emit: "", running };

  const runningTrimmed = running.trim();
  const combined = runningTrimmed ? `${runningTrimmed} ${emit}` : emit;
  return { emit, running: combined };
}

/** Drop the first `count` whitespace-delimited words from `text`, returning the
 *  remainder with its original spacing/punctuation. */
function dropLeadingWords(text: string, count: number): string {
  if (count <= 0) return text;
  // Walk past `count` word tokens. A "word" here mirrors tokenize(): a run of
  // letters/numbers/apostrophes. We advance through the raw string, counting
  // word starts, then return everything from the start of word #(count+1).
  const re = /[\p{L}\p{N}']+/gu;
  let seen = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    seen++;
    if (seen === count) {
      return text.slice(m.index + m[0].length);
    }
  }
  return ""; // fewer words than count -> nothing left
}
