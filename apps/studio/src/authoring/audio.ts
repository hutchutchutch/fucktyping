/** Encode mono Float32 PCM as a 16-bit WAV ArrayBuffer. Pure + testable. */
export function encodeWavPcm16(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };
  const dataLen = samples.length * 2;
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + dataLen, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true); // PCM fmt chunk size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate (sr * blockAlign)
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeStr(36, "data");
  view.setUint32(40, dataLen, true);
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }
  return buffer;
}

/** Target sample rate for Whisper (16 kHz mono). */
export const TARGET_RATE = 16000;

/** Decode a recorded blob (e.g. webm/opus from MediaRecorder), downmix to mono, and
 *  resample to 16 kHz mono Float32 samples. Browser-only (uses Web Audio). */
export async function blobToSamples16k(blob: Blob): Promise<Float32Array> {
  const arrayBuffer = await blob.arrayBuffer();
  const AC: typeof AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
  const ctx = new AC();
  const decoded = await ctx.decodeAudioData(arrayBuffer);
  await ctx.close();

  const frames = Math.max(1, Math.ceil(decoded.duration * TARGET_RATE));
  const offline = new OfflineAudioContext(1, frames, TARGET_RATE);
  const source = offline.createBufferSource();
  source.buffer = decoded; // multi-channel auto-downmixes to the mono destination
  source.connect(offline.destination);
  source.start();
  const rendered = await offline.startRendering();
  return rendered.getChannelData(0);
}

/** Wrap a slice of mono 16 kHz Float32 samples in a WAV blob. Browser helper
 *  (Blob), but the encoding itself is the pure {@link encodeWavPcm16}. */
export function samples16kToWav(samples: Float32Array): Blob {
  return new Blob([encodeWavPcm16(samples, TARGET_RATE)], { type: "audio/wav" });
}

/** Decode a recorded blob, downmix to mono, and resample to 16 kHz WAV — the
 *  format Whisper handles most reliably. Browser-only. */
export async function blobToWav16k(blob: Blob): Promise<Blob> {
  return samples16kToWav(await blobToSamples16k(blob));
}
