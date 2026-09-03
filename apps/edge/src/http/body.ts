export type BoundedBodyResult<T> =
  | { ok: true; value: T }
  | { ok: false; status: 400 | 413; error: string };

export async function readBoundedBytes(
  request: Request,
  maxBytes: number,
): Promise<BoundedBodyResult<Uint8Array>> {
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxBytes) {
    return { ok: false, status: 413, error: "request body too large" };
  }

  if (!request.body) return { ok: true, value: new Uint8Array() };
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel("request body too large");
      return { ok: false, status: 413, error: "request body too large" };
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return { ok: true, value: bytes };
}

export async function readBoundedJson(
  request: Request,
  maxBytes: number,
): Promise<BoundedBodyResult<unknown>> {
  const body = await readBoundedBytes(request, maxBytes);
  if (!body.ok) return body;
  try {
    return { ok: true, value: JSON.parse(new TextDecoder().decode(body.value)) as unknown };
  } catch {
    return { ok: false, status: 400, error: "invalid JSON" };
  }
}
