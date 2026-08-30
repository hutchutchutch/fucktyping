/** POST WAV bytes to the edge /transcribe endpoint (Workers AI Whisper) → text. */
export async function transcribeAudio(httpBase: string, wav: Blob, token: string): Promise<string> {
  const res = await fetch(`${httpBase.replace(/\/$/, "")}/transcribe`, {
    method: "POST",
    headers: { "content-type": "audio/wav", authorization: `Bearer ${token}` },
    body: wav,
  });
  if (!res.ok) throw new Error(`transcribe failed: ${res.status}`);
  const data = (await res.json()) as { text?: string };
  return data.text ?? "";
}
