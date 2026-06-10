"""Path 2 (slot): Nemotron exported to ONNX, served by sherpa-onnx.

This is the "real streaming Nemotron on Apple Silicon" path. It is intentionally a
working *scaffold*: the adapter, config wiring, and exact sherpa-onnx call shape are in
place, but it raises a clear, actionable error until you (1) export the NeMo model to
ONNX and (2) drop the files into models/nemotron-onnx/ (see config.SHERPA_FILES).

Export sketch (run once, in a NeMo-capable env):
    import nemo.collections.asr as nemo_asr
    m = nemo_asr.models.ASRModel.from_pretrained("nvidia/nemotron-3.5-asr-streaming-0.6b")
    m.export("nemotron.onnx")           # produces encoder/decoder/joiner for transducers
    # write the vocabulary to tokens.txt in the sherpa-onnx format

Then implement load() below by uncommenting the from_transducer(...) call.
"""
from __future__ import annotations

from .base import STTAdapter
from .. import config


class SherpaOnnxSTT(STTAdapter):
    name = "sherpa-onnx"
    supports_streaming = True  # the whole point of this path

    def __init__(self, num_threads: int = 4) -> None:
        super().__init__()
        self.num_threads = num_threads
        self._recognizer = None

    def _check_files(self) -> None:
        missing = [str(p) for p in config.SHERPA_FILES.values() if not p.exists()]
        if missing:
            raise FileNotFoundError(
                "Path 2 not ready: exported Nemotron ONNX files are missing:\n  "
                + "\n  ".join(missing)
                + "\nExport the model and place the files there (see this module's docstring "
                "and README 'Path 2')."
            )

    def load(self) -> None:
        self._check_files()
        import sherpa_onnx  # type: ignore

        f = config.SHERPA_FILES
        # Offline (chunked) transducer recognizer. Swap to OnlineRecognizer.from_transducer
        # for fully streaming decode once the export is validated.
        self._recognizer = sherpa_onnx.OfflineRecognizer.from_transducer(
            encoder=str(f["encoder"]),
            decoder=str(f["decoder"]),
            joiner=str(f["joiner"]),
            tokens=str(f["tokens"]),
            num_threads=self.num_threads,
        )

    def transcribe_file(self, wav_path: str) -> str:
        self._ensure_loaded()
        import soundfile as sf

        audio, sample_rate = sf.read(wav_path, dtype="float32")
        if audio.ndim > 1:
            audio = audio.mean(axis=1)
        stream = self._recognizer.create_stream()
        stream.accept_waveform(sample_rate, audio)
        self._recognizer.decode_stream(stream)
        return stream.result.text.strip()
