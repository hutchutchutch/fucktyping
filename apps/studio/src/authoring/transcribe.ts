/** POST WAV bytes to the edge /transcribe endpoint (Workers AI Whisper) → text. */
export async function transcribeAudio(httpBase: string, wav: Blob, token: string): Promise<string> {
  const res = await fetch(`${httpBase.replace(/\/$/, "")}/transcribe`, {
    method: "POST",
    headers: { "content-type": "audio/wav", authorization: `Bearer ${token}` },
    body: wav,
  });
  if (!res.ok) throw new Error(`transcribe failed: ${res.status}`);
  const value: unknown = await res.json();
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("invalid transcription response");
  }
  const text = (value as Record<string, unknown>).text;
  if (typeof text !== "string") throw new Error("invalid transcription response");
  return text;
}
