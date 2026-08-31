import { describe, expect, it } from "vitest";

import { dedupAppend, nextSegment, overlapWordCount, tokenize } from "./recorder";

describe("nextSegment", () => {
  it("returns null when no fresh audio past the cursor", () => {
    expect(nextSegment(16000, 16000, 16000)).toBeNull();
    expect(nextSegment(16000, 16000, 20000)).toBeNull();
  });

  it("backs the start up by the overlap window", () => {
    // cursor at 2s, 4s total, 0.5s overlap -> start at 1.5s, end at 4s
    const seg = nextSegment(64000, 16000, 32000, { overlapSec: 0.5 });
    expect(seg).toEqual({ start: 24000, end: 64000 });
  });

  it("clamps the overlap at zero for the first segment", () => {
    const seg = nextSegment(48000, 16000, 0, { overlapSec: 0.5 });
    expect(seg).toEqual({ start: 0, end: 48000 });
  });

  it("suppresses tiny tails unless flushing", () => {
    // only 0.2s of new audio, min 0.6s required
    expect(nextSegment(16000 + 3200, 16000, 16000, { minNewSec: 0.6 })).toBeNull();
    // min 0 (final flush) lets it through
    const seg = nextSegment(16000 + 3200, 16000, 16000, { minNewSec: 0, overlapSec: 0 });
    expect(seg).toEqual({ start: 16000, end: 19200 });
  });
});

describe("tokenize", () => {
  it("lowercases and strips punctuation", () => {
    expect(tokenize("Hello, World!  it's me.")).toEqual(["hello", "world", "it's", "me"]);
  });
});

describe("overlapWordCount", () => {
  it("finds the longest suffix/prefix word overlap", () => {
    expect(overlapWordCount(tokenize("build a form for"), tokenize("for collecting feedback"))).toBe(1);
    expect(overlapWordCount(tokenize("the quick brown"), tokenize("quick brown fox"))).toBe(2);
    expect(overlapWordCount(tokenize("alpha beta"), tokenize("gamma delta"))).toBe(0);
  });
});

describe("dedupAppend", () => {
  it("emits the whole fragment when running is empty", () => {
    const r = dedupAppend("", "Build a form");
    expect(r.emit).toBe("Build a form");
    expect(r.running).toBe("Build a form");
  });

  it("drops words that overlap the running tail, preserving casing/punctuation", () => {
    const r = dedupAppend("I want to build a form", "build a form for customer feedback.");
    expect(r.emit).toBe("for customer feedback.");
    expect(r.running).toBe("I want to build a form for customer feedback.");
  });

  it("emits nothing when the fragment is fully duplicate", () => {
    const r = dedupAppend("build a form", "build a form");
    expect(r.emit).toBe("");
    expect(r.running).toBe("build a form");
  });

  it("emits nothing for blank fragments", () => {
    expect(dedupAppend("hello", "   ").emit).toBe("");
    expect(dedupAppend("hello", "...").emit).toBe("");
  });

  it("accumulates across several segments without duplication", () => {
    let running = "";
    const segs = [
      "I want a survey",
      "a survey about coffee",
      "about coffee preferences for the team",
    ];
    const emitted: string[] = [];
    for (const s of segs) {
      const r = dedupAppend(running, s);
      running = r.running;
      if (r.emit) emitted.push(r.emit);
    }
    expect(running).toBe("I want a survey about coffee preferences for the team");
    expect(emitted).toEqual(["I want a survey", "about coffee", "preferences for the team"]);
  });
});
