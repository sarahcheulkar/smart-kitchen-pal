"""
Smart Kitchen Pal — Generative AI Plating
Generates photorealistic images of predicted dishes using Stable Diffusion XL.
X-Factor feature for hackathon/competition wow factor.
"""

import logging
import base64
from io import BytesIO
from typing import Optional

import torch

from backend.config import settings

logger = logging.getLogger("smart_kitchen.models.plating")


class DishImageGenerator:
    """Generate photorealistic dish images with FLUX / Diffusion Pipeline."""

    def __init__(self, pipeline):
        self.pipeline = pipeline

    def generate(
        self,
        dish_name: str,
        ingredients: list[str],
        cuisine: str = "",
        style: str = "professional food photography",
        num_inference_steps: int = 30,
        guidance_scale: float = 7.5,
    ) -> dict:
        """
        Generate a photorealistic image of a predicted dish.
        Returns base64-encoded image and metadata.
        """
        # Build a rich, descriptive prompt for food photography
        ingredient_str = ", ".join(ingredients[:8])
        cuisine_str = f"{cuisine} " if cuisine else ""

        prompt = (
            f"A stunning {style} shot of {cuisine_str}{dish_name}, "
            f"made with {ingredient_str}. "
            f"Beautiful plating on a ceramic plate, soft natural lighting, "
            f"shallow depth of field, garnished perfectly, "
            f"8k resolution, food magazine quality, appetizing colors"
        )

        negative_prompt = (
            "blurry, low quality, cartoon, illustration, drawing, "
            "ugly, deformed, text, watermark, signature, "
            "oversaturated, underexposed, bad lighting"
        )

        logger.info(f"Generating dish image: {dish_name}")

        with torch.no_grad():
            result = self.pipeline(
                prompt=prompt,
                num_inference_steps=4,  # FLUX schnell uses 4 steps
                guidance_scale=0.0,     # FLUX schnell uses 0.0 guidance
                width=768,
                height=768,
            )

        image = result.images[0]

        # Convert to base64
        buffer = BytesIO()
        image.save(buffer, format="WEBP", quality=85)
        image_b64 = base64.b64encode(buffer.getvalue()).decode()

        return {
            "image_base64": image_b64,
            "prompt_used": prompt,
            "dish_name": dish_name,
            "format": "webp",
        }


def load_diffusion_pipeline() -> DishImageGenerator:
    """Load FLUX / Diffusion pipeline."""
    from diffusers import DiffusionPipeline

    model_id = settings.DIFFUSION_MODEL_ID
    device = settings.DEVICE
    logger.info(f"Loading FLUX from {model_id} on {device}")

    dtype = torch.float16 if device == "cuda" else torch.float32

    pipeline = DiffusionPipeline.from_pretrained(
        model_id,
        torch_dtype=dtype,
        cache_dir=str(settings.MODEL_CACHE_DIR),
        use_safetensors=True,
    )

    pipeline = pipeline.to(device)

    # Optimizations
    if device == "cuda":
        pipeline.enable_xformers_memory_efficient_attention()

    return DishImageGenerator(pipeline)
