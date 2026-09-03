const APPLICATION_PROTOCOL = "fucktyping";
const AUTH_PROTOCOL_PREFIX = "fucktyping-auth.";
const TOKEN_RE = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

function protocols(header: string | null): string[] {
  return (header ?? "").split(",").map((value) => value.trim()).filter(Boolean);
}

export function webSocketToken(header: string | null): string {
  const offered = protocols(header);
  if (!offered.includes(APPLICATION_PROTOCOL)) return "";
  const auth = offered.find((value) => value.startsWith(AUTH_PROTOCOL_PREFIX));
  const token = auth?.slice(AUTH_PROTOCOL_PREFIX.length) ?? "";
  return token.length <= 4096 && TOKEN_RE.test(token) ? token : "";
}

export function selectedWebSocketProtocol(header: string | null): string | null {
  return protocols(header).includes(APPLICATION_PROTOCOL) ? APPLICATION_PROTOCOL : null;
}

export function webSocketResponseHeaders(request: Request): Headers {
  const selected = selectedWebSocketProtocol(request.headers.get("sec-websocket-protocol"));
  const headers = new Headers();
  if (selected) headers.set("Sec-WebSocket-Protocol", selected);
  return headers;
}
