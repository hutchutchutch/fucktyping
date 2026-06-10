"""Media plane: bridge to Cloudflare Realtime (SFU) for a server-side participant.

THIS IS THE INTEGRATION FRONTIER. Pipecat ships no first-class Cloudflare Realtime
transport, so for local end-to-end testing use SmallWebRTCTransport
(run_agent.py --transport small-webrtc). This module scaffolds the Cloudflare side so
you can build a custom transport once the SmallWebRTC path works.

Cloudflare Realtime flow for a server participant (HTTPS control + aiortc media):
  1. POST  /v1/apps/{APP_ID}/sessions/new
            -> { "sessionId": "..." }
  2. create a local aiortc RTCPeerConnection; add a sendrecv audio transceiver
            (local track = our TTS output; remote track = the caller's mic)
  3. POST  /v1/apps/{APP_ID}/sessions/{sessionId}/tracks/new
            body: { "sessionDescription": { "type": "offer", "sdp": <local offer> },
                    "tracks": [ ... ] }
            -> { "sessionDescription": { "type": "answer", "sdp": <remote answer> } }
  4. pc.setRemoteDescription(answer) — media now flows pc <-> Cloudflare SFU
  5. wire pc's inbound audio -> Pipecat input; Pipecat TTS output -> pc's outbound track

Auth: Authorization: Bearer {APP_TOKEN}. Verify exact endpoints/payloads against the
Cloudflare Realtime docs for your account — the shapes below are a starting point.
"""
from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass
class CloudflareRealtimeConfig:
    app_id: str
    app_token: str
    base_url: str = "https://rtc.live.cloudflare.com/v1"

    @classmethod
    def from_env(cls) -> "CloudflareRealtimeConfig":
        app_id = os.environ.get("CF_REALTIME_APP_ID")
        app_token = os.environ.get("CF_REALTIME_APP_TOKEN")
        if not app_id or not app_token:
            raise RuntimeError(
                "Set CF_REALTIME_APP_ID and CF_REALTIME_APP_TOKEN to use Cloudflare Realtime"
            )
        return cls(app_id=app_id, app_token=app_token)


class CloudflareRealtimeClient:
    """Thin async client for the Cloudflare Realtime session/track HTTP API.

    Media wiring (aiortc <-> Pipecat) is intentionally left to a custom transport;
    this class only handles the control handshake.
    """

    def __init__(self, config: CloudflareRealtimeConfig) -> None:
        self.config = config

    def _headers(self) -> dict:
        return {"Authorization": f"Bearer {self.config.app_token}"}

    async def new_session(self) -> str:
        import httpx  # type: ignore
        url = f"{self.config.base_url}/apps/{self.config.app_id}/sessions/new"
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, headers=self._headers())
            resp.raise_for_status()
            return resp.json()["sessionId"]

    async def new_tracks(self, session_id: str, local_offer_sdp: str, tracks: list) -> str:
        """Send our local SDP offer + track list, return the remote SDP answer."""
        import httpx  # type: ignore
        url = f"{self.config.base_url}/apps/{self.config.app_id}/sessions/{session_id}/tracks/new"
        body = {
            "sessionDescription": {"type": "offer", "sdp": local_offer_sdp},
            "tracks": tracks,
        }
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, headers=self._headers(), json=body)
            resp.raise_for_status()
            return resp.json()["sessionDescription"]["sdp"]

    # TODO: build CloudflareRealtimeTransport(BaseTransport) that owns an aiortc
    # RTCPeerConnection, runs the handshake above, and exposes .input()/.output()
    # frame processors like SmallWebRTCTransport does.
