"""Run the local voice-agent pipeline:  transport.in -> STT -> FormAgent -> TTS -> transport.out

Local end-to-end (no Cloudflare; browser <-> SmallWebRTC; echo DO walks fixed questions):
    python -m voice_pipeline.agent.run_agent --stt parakeet-mlx --transport small-webrtc

Against a real Durable Object (control plane), still local media:
    python -m voice_pipeline.agent.run_agent --stt parakeet-mlx \
        --transport small-webrtc --do-url wss://your-worker.example/forms/123/session

Cloudflare Realtime media is not wired yet — see cloudflare_realtime.py.

NOTE: Pipecat import paths drift across versions; if a transport/VAD import fails,
check the installed pipecat's module layout and adjust _build_transport.
"""
from __future__ import annotations

import argparse
import asyncio

from ..stt import build_stt
from ..tts.miso_mps import MisoTTS
from .do_client import DurableObjectClient, EchoDOClient
from .form_agent import FormAgentProcessor
from .pipecat_stt import LocalSTTService
from .pipecat_tts import LocalTTSService


def _build_transport(name: str):
    if name == "small-webrtc":
        from pipecat.audio.vad.silero import SileroVADAnalyzer
        from pipecat.transports.base_transport import TransportParams
        from pipecat.transports.network.small_webrtc import SmallWebRTCTransport

        transport = SmallWebRTCTransport(
            params=TransportParams(
                audio_in_enabled=True,
                audio_out_enabled=True,
                vad_analyzer=SileroVADAnalyzer(),
            )
        )
        return transport
    raise SystemExit(
        f"transport '{name}' not wired yet. Use 'small-webrtc' for local testing; "
        "Cloudflare Realtime is scaffolded in cloudflare_realtime.py."
    )


async def run(args) -> None:
    from pipecat.pipeline.pipeline import Pipeline
    from pipecat.pipeline.runner import PipelineRunner
    from pipecat.pipeline.task import PipelineParams, PipelineTask

    stt = LocalSTTService(build_stt(args.stt))
    tts = LocalTTSService(MisoTTS(force_cpu=args.force_cpu))
    do = DurableObjectClient(args.do_url, args.do_token) if args.do_url else EchoDOClient()
    agent = FormAgentProcessor(do)

    transport = _build_transport(args.transport)
    pipeline = Pipeline([transport.input(), stt, agent, tts, transport.output()])
    task = PipelineTask(pipeline, PipelineParams(allow_interruptions=True))

    @transport.event_handler("on_client_connected")
    async def _on_connected(_transport, _client):  # noqa: ANN001
        await agent.kickoff()

    try:
        await PipelineRunner().run(task)
    finally:
        await do.close()


def main() -> None:
    ap = argparse.ArgumentParser(description="Local voice-agent pipeline.")
    ap.add_argument("--stt", default="parakeet-mlx", help="STT adapter name")
    ap.add_argument("--transport", default="small-webrtc")
    ap.add_argument("--do-url", default=None, help="wss:// URL of the form Durable Object")
    ap.add_argument("--do-token", default=None, help="signed respondent token (kept out of the URL)")
    ap.add_argument("--force-cpu", action="store_true", help="force MisoTTS onto CPU")
    args = ap.parse_args()
    asyncio.run(run(args))


if __name__ == "__main__":
    main()
