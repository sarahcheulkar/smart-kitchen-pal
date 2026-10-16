"""
Smart Kitchen Pal — OpenAI Whisper Audio Transcription
Robust, multilingual speech-to-text that handles kitchen noise and accents.
"""

import logging
import tempfile
import os
from pathlib import Path

import whisper

from backend.config import settings

logger = logging.getLogger("smart_kitchen.models.audio")


class WhisperTranscriber:
    """Wrapper around OpenAI Whisper for robust audio transcription."""

    def __init__(self, model):
        self.model = model

    def transcribe(
        self,
        audio_bytes: bytes,
        language: str = "en",
        task: str = "transcribe",
    ) -> dict:
        """
        Transcribe audio bytes to text.
        Supports multilingual input and translation to English.
        """
        # Write to temp file (Whisper requires file path)
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
            f.write(audio_bytes)
            temp_path = f.name

        try:
            result = self.model.transcribe(
                temp_path,
                language=language if language != "auto" else None,
                task=task,  # 'transcribe' or 'translate'
                fp16=False,
            )

            # Extract segment-level details
            segments = []
            for seg in result.get("segments", []):
                segments.append({
                    "start": round(seg["start"], 2),
                    "end": round(seg["end"], 2),
                    "text": seg["text"].strip(),
                    "confidence": round(1.0 - seg.get("no_speech_prob", 0), 4),
                })

            return {
                "text": result["text"].strip(),
                "language": result.get("language", language),
                "segments": segments,
                "duration": segments[-1]["end"] if segments else 0,
            }

        finally:
            os.unlink(temp_path)

    def detect_language(self, audio_bytes: bytes) -> dict:
        """Detect the spoken language from audio."""
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
            f.write(audio_bytes)
            temp_path = f.name

        try:
            audio = whisper.load_audio(temp_path)
            audio = whisper.pad_or_trim(audio)
            mel = whisper.log_mel_spectrogram(audio).to(self.model.device)

            _, probs = self.model.detect_language(mel)
            top_languages = sorted(probs.items(), key=lambda x: x[1], reverse=True)[:5]

            return {
                "detected": top_languages[0][0],
                "confidence": round(top_languages[0][1], 4),
                "top_5": [{"lang": l, "prob": round(p, 4)} for l, p in top_languages],
            }
        finally:
            os.unlink(temp_path)


def load_whisper_model() -> WhisperTranscriber:
    """Load Whisper model."""
    model_size = settings.WHISPER_MODEL_SIZE
    logger.info(f"Loading Whisper {model_size}")

    model = whisper.load_model(
        model_size,
        download_root=str(settings.MODEL_CACHE_DIR),
    )
    return WhisperTranscriber(model)
