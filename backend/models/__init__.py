"""
Smart Kitchen Pal — Lazy Model Manager
Loads heavy DL models on-demand and caches them in memory.
Thread-safe singleton pattern for each model pipeline.
"""

import asyncio
import logging
import time
from typing import Optional

logger = logging.getLogger("smart_kitchen.models")


class ModelManager:
    """
    Centralized lazy-loader for all deep learning models.
    Models are loaded on first access and cached for subsequent calls.
    """

    _florence_pipeline = None
    _whisper_model = None
    _diffusion_pipeline = None
    _embedding_model = None
    _loading_locks: dict[str, asyncio.Lock] = {}

    @classmethod
    def _get_lock(cls, name: str) -> asyncio.Lock:
        if name not in cls._loading_locks:
            cls._loading_locks[name] = asyncio.Lock()
        return cls._loading_locks[name]

    # ── Florence-2 (Vision Foundation Model: Detection + Captioning) ──
    @classmethod
    async def get_florence(cls):
        if cls._florence_pipeline is None:
            async with cls._get_lock("florence"):
                if cls._florence_pipeline is None:
                    logger.info("⏳ Loading SOTA Florence-2 vision model...")
                    t = time.time()
                    from backend.models.vision import load_florence_pipeline
                    cls._florence_pipeline = await asyncio.to_thread(load_florence_pipeline)
                    logger.info(f"✅ Florence-2 loaded in {time.time() - t:.1f}s")
        return cls._florence_pipeline

    # ── Whisper (Audio Transcription) ──
    @classmethod
    async def get_whisper(cls):
        if cls._whisper_model is None:
            async with cls._get_lock("whisper"):
                if cls._whisper_model is None:
                    logger.info("⏳ Loading Whisper v3 model...")
                    t = time.time()
                    from backend.models.audio import load_whisper_model
                    cls._whisper_model = await asyncio.to_thread(load_whisper_model)
                    logger.info(f"✅ Whisper loaded in {time.time() - t:.1f}s")
        return cls._whisper_model

    # ── Stable Diffusion (Dish Image Generation) ──
    @classmethod
    async def get_diffusion(cls):
        if cls._diffusion_pipeline is None:
            async with cls._get_lock("diffusion"):
                if cls._diffusion_pipeline is None:
                    logger.info("⏳ Loading SOTA FLUX model...")
                    t = time.time()
                    from backend.models.plating import load_diffusion_pipeline
                    cls._diffusion_pipeline = await asyncio.to_thread(load_diffusion_pipeline)
                    logger.info(f"✅ Diffusion model loaded in {time.time() - t:.1f}s")
        return cls._diffusion_pipeline

    # ── Sentence-Transformers (Embeddings for RAG) ──
    @classmethod
    async def get_embedding_model(cls):
        if cls._embedding_model is None:
            async with cls._get_lock("embedding"):
                if cls._embedding_model is None:
                    logger.info("⏳ Loading SOTA BGE Embeddings...")
                    t = time.time()
                    from sentence_transformers import SentenceTransformer
                    from backend.config import settings
                    cls._embedding_model = await asyncio.to_thread(
                        SentenceTransformer, settings.EMBEDDING_MODEL_ID
                    )
                    logger.info(f"✅ Embeddings loaded in {time.time() - t:.1f}s")
        return cls._embedding_model

    # ── Status ──
    @classmethod
    def status(cls) -> dict:
        return {
            "florence": cls._florence_pipeline is not None,
            "whisper": cls._whisper_model is not None,
            "diffusion": cls._diffusion_pipeline is not None,
            "embeddings": cls._embedding_model is not None,
        }
