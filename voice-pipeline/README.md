# voice-pipeline

Local voice models for FuckTyping personal voice agents, running on the Mac Studio
(Apple Silicon). This package is **transport-agnostic**: it exposes swappable
**STT** and **TTS** adapters behind a stable interface plus an **eval harness** so you
can benchmark backends head-to-head and pick a winner before wiring anything into
Cloudflare Realtime / Pipecat.

## What "MPS" means

`MPS` = **Metal Performance Shaders**, Apple's GPU backend in PyTorch. `device="mps"`
is the Apple-Silicon equivalent of `device="cuda"` — it runs the tensor math on the
Mac's GPU. There is no "MPS server"; the *server* is whatever process loads a model
onto MPS and exposes it (later: a Pipecat/FastAPI app). This package is that layer's
model code.

## The three ASR paths (see `stt/`)

| Path | Adapter (`name`)   | Status      | Notes |
|------|--------------------|-------------|-------|
| 1    | `nemo`             | works (CPU) | Nemotron via NeMo, CPU/MPS. Push-to-talk only; streaming unsupported on Mac. |
| 3a   | `whispercpp`       | works       | Metal-accelerated whisper.cpp. Lowest friction. |
| 3b   | `parakeet-mlx`     | works       | NVIDIA Parakeet (FastConformer) ported to Apple MLX. Closest Mac-native cousin of Nemotron. Streaming-capable. |
| 2    | `sherpa-onnx`      | **stub**    | Nemotron exported to ONNX, served by sherpa-onnx (streaming transducer). Drop exported model files into `models/nemotron-onnx/` and implement `stt/sherpa_onnx.py`. |

TTS is MisoTTS (8B, CSM-architecture) on MPS — see `tts/miso_mps.py`.

## Install (per-backend, so you don't drag in NeMo to test Parakeet)

```bash
cd voice-pipeline
uv venv --python 3.11 && source .venv/bin/activate   # or python -m venv
pip install -e .                # base (numpy, soundfile)
pip install -e ".[parakeet]"    # Path 3b
pip install -e ".[whispercpp]"  # Path 3a
pip install -e ".[nemo]"        # Path 1  (heavy)
pip install -e ".[sherpa]"      # Path 2
pip install -e ".[miso]"        # TTS deps (torch/torchaudio); ALSO clone MisoTTS (below)
```

### MisoTTS extra step
MisoTTS ships custom inference code, not a pip package. Clone it and install it into
this venv so `from generator import load_miso_8b` resolves:
```bash
git clone https://github.com/MisoLabsAI/MisoTTS.git ../MisoTTS
pip install -e ../MisoTTS
```

## Run the STT eval (Path 1 vs Path 3)

Put `(audio, reference_text)` pairs in `samples/manifest.jsonl` (one JSON per line):
```json
{"audio": "samples/wav/q1.wav", "text": "yes that is correct"}
```
Then:
```bash
python -m voice_pipeline.eval.run_stt_eval \
    --adapters parakeet-mlx whispercpp nemo \
    --manifest samples/manifest.jsonl --warmup
```
Prints a per-adapter table of **WER**, **mean latency**, and **RTF** (real-time
factor; <1 = faster than real time) and writes `results/stt_eval_*.json`.
Adapters that aren't installed are skipped with a note, so partial installs still run.

## TTS smoke test

```bash
python -m voice_pipeline.eval.run_tts_smoke --text "Hello from your voice agent." --out results/miso.wav
```

## Path 2 (later): export Nemotron → ONNX → sherpa-onnx
1. In a CUDA or CPU env with NeMo: load `nvidia/nemotron-3.5-asr-streaming-0.6b` and
   export encoder/decoder/joiner to ONNX (`model.export(...)`), plus `tokens.txt`.
2. Drop the files in `models/nemotron-onnx/` (see `config.py` for expected names).
3. Implement the model construction in `stt/sherpa_onnx.py` (the call sites are
   stubbed with the exact `sherpa_onnx.OfflineRecognizer.from_transducer(...)` shape).
4. Re-run the eval with `--adapters sherpa-onnx parakeet-mlx whispercpp` to compare.

## Streaming latency eval (decides realtime feasibility)

Whole-file WER tells you accuracy; this tells you whether a backend can keep up with a
live mic. Feeds audio chunk-by-chunk and reports first-partial latency, worst per-chunk
compute vs the chunk budget, stream RTF, and final WER:

```bash
pip install -e ".[parakeet]" ".[stream]"   # scipy = better resampling
python -m voice_pipeline.eval.run_stt_stream_eval \
    --adapters parakeet-mlx --chunk-ms 320 --realtime
```
`keepsup = NO` (max per-chunk compute exceeds the chunk budget) means it falls behind
live audio. Only streaming-capable adapters run (parakeet-mlx today; sherpa-onnx once
Path 2 is built).

## The voice agent (Pipecat)

`voice_pipeline/agent/` wires the winning STT adapter + MisoTTS into a Pipecat pipeline:

```
transport.input -> LocalSTTService -> FormAgentProcessor -> LocalTTSService -> transport.output
                                            |
                                   outbound WS to the form Durable Object
                                   (the FormConfig interpreter = the "brain")
```

- **Control plane** (`do_client.py`): the Mac dials OUT to the form's Durable Object;
  `EchoDOClient` walks a fixed question list so the whole loop runs with **no
  Cloudflare dependency** while you iterate.
- **Media plane** (`cloudflare_realtime.py`): scaffolds the Cloudflare Realtime SFU
  handshake. Pipecat has no first-class Cloudflare transport yet, so test locally with
  `SmallWebRTCTransport` first, then build the custom transport.

Run it locally (browser mic <-> SmallWebRTC <-> local models, echo DO):
```bash
git clone https://github.com/MisoLabsAI/MisoTTS.git ../MisoTTS && pip install -e ../MisoTTS
pip install -e ".[agent]" ".[miso]" ".[parakeet]"
python -m voice_pipeline.agent.run_agent --stt parakeet-mlx --transport small-webrtc
```
Against a real Durable Object: add `--do-url wss://your-worker/forms/<id>/session`.

> Pipecat import paths drift between versions; if a `pipecat...` import fails, check the
> installed package layout and adjust `agent/pipecat_stt.py`, `pipecat_tts.py`,
> `form_agent.py`, or `run_agent.py`. The non-Pipecat pieces (adapters, DO client) run
> independently.

## How this plugs into the rest of the system
The Durable Object that `do_client.py` talks to is the same FormConfig-interpreter DO
from the Cloudflare architecture: it owns conversation state, validates answers (via AI
Gateway), and decides the next question. This package stays pure models + transport —
no form logic lives here.
