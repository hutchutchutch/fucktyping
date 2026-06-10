"""Control plane: outbound WebSocket to the form's Cloudflare Durable Object.

The Mac dials OUT to the DO (no inbound, no port-forwarding) — matching the
connectivity design. Protocol (JSON frames):

    -> {"type": "start", "form_id": "..."}
    <- {"type": "assistant", "text": "<opening question>", "done": false}
    -> {"type": "user_answer", "text": "<transcript>"}
    <- {"type": "assistant", "text": "<next question | closing>", "done": <bool>}

`done: true` means the FormConfig is fully collected and the call should end.
"""
from __future__ import annotations

import json
from dataclasses import dataclass


@dataclass
class AgentReply:
    text: str
    done: bool = False


class DurableObjectClient:
    def __init__(self, url: str, form_id: str | None = None) -> None:
        self.url = url
        self.form_id = form_id
        self._ws = None

    async def connect(self) -> None:
        import websockets  # type: ignore
        self._ws = await websockets.connect(self.url)

    async def start(self) -> AgentReply:
        await self._send({"type": "start", "form_id": self.form_id})
        return await self._recv()

    async def send_answer(self, text: str) -> AgentReply:
        await self._send({"type": "user_answer", "text": text})
        return await self._recv()

    async def close(self) -> None:
        if self._ws is not None:
            await self._ws.close()

    async def _send(self, obj: dict) -> None:
        await self._ws.send(json.dumps(obj))

    async def _recv(self) -> AgentReply:
        msg = json.loads(await self._ws.recv())
        return AgentReply(text=msg.get("text", ""), done=bool(msg.get("done", False)))


class EchoDOClient(DurableObjectClient):
    """No-Cloudflare stub: walks a fixed question list so the full audio loop runs
    locally before the real Durable Object exists."""

    def __init__(self, questions: list[str] | None = None) -> None:
        self._questions = questions or [
            "What is your name?",
            "On a scale of one to five, how was your experience?",
            "Do you have any additional comments?",
        ]
        self._i = -1

    async def connect(self) -> None:
        return None

    async def start(self) -> AgentReply:
        self._i = 0
        return AgentReply(text=self._questions[0], done=False)

    async def send_answer(self, text: str) -> AgentReply:
        self._i += 1
        if self._i >= len(self._questions):
            return AgentReply(text="Thanks — that's everything. Goodbye!", done=True)
        return AgentReply(text=self._questions[self._i], done=False)

    async def close(self) -> None:
        return None
