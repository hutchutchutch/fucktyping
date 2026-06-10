import { describe, expect, it } from "vitest";

import { encodeWavPcm16 } from "./audio";

describe("encodeWavPcm16", () => {
  it("writes a valid 16 kHz mono PCM WAV header", () => {
    const samples = new Float32Array([0, 0.5, -0.5, 1, -1]);
    const buf = encodeWavPcm16(samples, 16000);
    const view = new DataView(buf);
    const str = (o: number, n: number) =>
      String.fromCharCode(...Array.from({ length: n }, (_, i) => view.getUint8(o + i)));

    expect(buf.byteLength).toBe(44 + samples.length * 2);
    expect(str(0, 4)).toBe("RIFF");
    expect(str(8, 4)).toBe("WAVE");
    expect(str(36, 4)).toBe("data");
    expect(view.getUint16(22, true)).toBe(1); // mono
    expect(view.getUint32(24, true)).toBe(16000); // sample rate
    expect(view.getUint16(34, true)).toBe(16); // bits/sample
    expect(view.getUint32(40, true)).toBe(samples.length * 2); // data length
    // full-scale samples clamp to int16 extremes
    expect(view.getInt16(44 + 3 * 2, true)).toBe(0x7fff);
    expect(view.getInt16(44 + 4 * 2, true)).toBe(-0x8000);
  });
});
