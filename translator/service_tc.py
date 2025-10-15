# Faster-Whisper API code
import os
from faster_whisper import WhisperModel

# Exact tuning can be found within Environmental variables
# Can be one of the following: tiny, base, small, medium, large-v3
MODEL_NAME = os.getenv("ASR_MODEL", "base")
# Use CPU (cpu) or NVidia gpu (cuda)
DEVICE = os.getenv("ASR_DEVICE", "cpu")
COMPUTE_TYPE = os.getenv("ASR_COMPUTE_TYPE", "int8")

_model = WhisperModel(MODEL_NAME, device=DEVICE, compute_type=COMPUTE_TYPE)

def transcribe_wav(path: str, language: str | None = None) -> dict:
    """
    Transcribe 16kHz wav at 'path'.
    Returns:
        {text, language, language_probability, duration}
    """
    segments, info = _model.transcribe(
        path,
        language=language,
        beam_size=5,
        # Filters out audio with no speach
        vad_filter=True,
    )
    # Joins up text within the transcription
    text = "".join(s.text for s in segments).strip()

    return {
        "text": text,
        "language": info.language,
        "language_probability": float(info.language_probability or 0.0),
        "duration": float(getattr(info, "duration", 0.0)),
    }

