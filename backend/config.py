"""
Smart Kitchen Pal — Backend Configuration
Centralized settings with environment variable overrides.
"""

from pydantic_settings import BaseSettings
from pathlib import Path
import torch


class Settings(BaseSettings):
    """Application settings loaded from environment / .env file."""

    # ── Server ──
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True

    # ── Device ──
    DEVICE: str = "cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu"
    TORCH_DTYPE: str = "float16" if torch.cuda.is_available() else "float32"

    # ── Model IDs (HuggingFace) ──
    FLORENCE_MODEL_ID: str = "microsoft/Florence-2-large"
    WHISPER_MODEL_SIZE: str = "large-v3"  # SOTA Whisper
    DIFFUSION_MODEL_ID: str = "black-forest-labs/FLUX.1-schnell"  # SOTA Image Gen
    EMBEDDING_MODEL_ID: str = "BAAI/bge-large-en-v1.5"  # SOTA Embeddings

    # ── USDA FoodData Central ──
    USDA_API_KEY: str = "DEMO_KEY"
    USDA_BASE_URL: str = "https://api.nal.usda.gov/fdc/v1"

    # ── Paths ──
    BASE_DIR: Path = Path(__file__).resolve().parent
    DATA_DIR: Path = BASE_DIR / "data"
    DB_DIR: Path = BASE_DIR / "db" / "chroma_store"
    FEEDBACK_DB: Path = BASE_DIR / "db" / "feedback.db"
    MODEL_CACHE_DIR: Path = BASE_DIR / ".model_cache"

    # ── RAG Settings ──
    RAG_TOP_K: int = 8
    RAG_MIN_SCORE: float = 0.3

    # ── Feature Flags ──
    ENABLE_FLORENCE: bool = True
    ENABLE_WHISPER: bool = True
    ENABLE_DIFFUSION: bool = False  # Heavy; opt-in
    ENABLE_RAG: bool = True
    ENABLE_USDA: bool = True
    ENABLE_WASTE_TRACKER: bool = True

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
