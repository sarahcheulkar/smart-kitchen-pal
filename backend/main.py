"""
Smart Kitchen Pal — FastAPI Backend
The real deep learning engine powering the entire application.

Endpoints:
    POST /api/analyze       — Full pipeline: BLIP-2 + YOLOv8 + USDA + RAG + Waste
    POST /api/transcribe    — Whisper v3 audio transcription
    POST /api/generate-dish — Stable Diffusion dish image generation
    POST /api/feedback      — RLHF feedback recording
    GET  /api/preferences   — User preference insights
    GET  /api/health        — System and model status
"""

import asyncio
import base64
import logging
import time
from io import BytesIO
from typing import Optional

from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from PIL import Image

from backend.config import settings
from backend.models import ModelManager
from backend.services.nutrition import nutrition_service
from backend.services.recipe_rag import recipe_rag
from backend.services.waste_tracker import waste_tracker
from backend.services.feedback import feedback_service

# ── Logging ──
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger("smart_kitchen")

# ── App ──
app = FastAPI(
    title="Smart Kitchen Pal — DL Backend",
    description="Competition-level deep learning backend with BLIP-2, YOLOv8, Whisper, RAG, USDA, and RLHF",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ──────────────────────────────────────────────
# Request / Response Models
# ──────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    imageBase64: Optional[str] = None
    voiceIngredients: Optional[str] = None


class FeedbackRequest(BaseModel):
    recipeName: str
    rating: int  # 1 or -1
    cuisine: str = ""
    ingredients: list[str] = []


# ──────────────────────────────────────────────
# STARTUP — initialize RAG engine
# ──────────────────────────────────────────────

@app.on_event("startup")
async def startup():
    """Initialize the RAG engine on server start."""
    if settings.ENABLE_RAG:
        try:
            embedding_model = await ModelManager.get_embedding_model()
            await recipe_rag.initialize(embedding_model)
        except Exception as e:
            logger.error(f"Failed to initialize RAG: {e}")


# ──────────────────────────────────────────────
# POST /api/analyze — Full analysis pipeline
# ──────────────────────────────────────────────

@app.post("/api/analyze")
async def analyze_food(request: AnalyzeRequest):
    """
    Full deep learning analysis pipeline:
    1. BLIP-2 — Image captioning (multi-prompt)
    2. YOLOv8 — Object detection with bounding boxes
    3. USDA  — Real nutritional data
    4. RAG   — Recipe retrieval from real database
    5. Waste — Carbon footprint calculation
    6. RLHF  — Re-rank recipes by user preferences
    """
    start_time = time.time()
    pipeline_log = []

    image_base64 = request.imageBase64
    voice_ingredients = request.voiceIngredients

    if not image_base64 and not voice_ingredients:
        raise HTTPException(status_code=400, detail="Provide an image or ingredients")

    # ── Decode image if provided ──
    pil_image = None
    if image_base64:
        try:
            from backend.models.vision import decode_image
            pil_image = decode_image(image_base64)
        except Exception as e:
            logger.error(f"Image decode failed: {e}")
            raise HTTPException(status_code=400, detail="Invalid image data")

    # ── Stage 1: Florence-2 Vision Foundation Model (Captioning & Detection) ──
    blip_output = None
    yolo_output = None
    if pil_image and settings.ENABLE_FLORENCE:
        try:
            t = time.time()
            florence = await ModelManager.get_florence()
            florence_outputs = florence.analyze_food(pil_image)
            
            blip_output = florence_outputs.get("blip")
            yolo_output = florence_outputs.get("yolo")
            
            elapsed = round(time.time() - t, 2)
            pipeline_log.append({"model": "Hybrid Vision Ensemble (CNN + ViT)", "status": "success", "time_s": elapsed})
            logger.info(f"Vision ensemble caption: {blip_output['general_caption']}")
            logger.info(f"Vision ensemble detected: {yolo_output['unique_foods']}")
        except Exception as e:
            logger.error(f"Vision ensemble failed: {e}")
            pipeline_log.append({"model": "Hybrid Vision Ensemble (CNN + ViT)", "status": "error", "error": str(e)})

    # ── Fuse ingredients from all sources ──
    all_ingredients = _fuse_ingredients(blip_output, yolo_output, voice_ingredients)

    # ── Stage 3: USDA Nutrition ──
    nutrition_data = []
    if all_ingredients and settings.ENABLE_USDA:
        try:
            t = time.time()
            for ing in all_ingredients:
                grams = ing.get("estimated_grams", 100)
                qty_str = f"{grams}g"
                nd = await nutrition_service.get_nutrition(ing["name"], quantity_str=qty_str)
                nd["name"] = ing["name"]
                nutrition_data.append(nd)
            elapsed = round(time.time() - t, 2)
            pipeline_log.append({"model": "USDA API", "status": "success", "time_s": elapsed})
        except Exception as e:
            logger.error(f"USDA lookup failed: {e}")
            pipeline_log.append({"model": "USDA API", "status": "error", "error": str(e)})

    # ── Stage 4: RAG Recipe Retrieval ──
    recipes = []
    if all_ingredients and settings.ENABLE_RAG:
        try:
            t = time.time()
            embedding_model = await ModelManager.get_embedding_model()
            ingredient_names = [ing["name"] for ing in all_ingredients]
            recipes = await recipe_rag.search(ingredient_names, embedding_model)
            elapsed = round(time.time() - t, 2)
            pipeline_log.append({"model": "RAG (ChromaDB)", "status": "success", "time_s": elapsed, "results": len(recipes)})
        except Exception as e:
            logger.error(f"RAG search failed: {e}")
            pipeline_log.append({"model": "RAG (ChromaDB)", "status": "error", "error": str(e)})

    # ── Stage 5: RLHF Re-ranking ──
    if recipes:
        try:
            recipes = feedback_service.rerank_recipes(recipes)
            pipeline_log.append({"model": "RLHF Re-ranker", "status": "success"})
        except Exception as e:
            logger.error(f"RLHF re-ranking failed: {e}")

    # ── Stage 6: Waste & Carbon Footprint ──
    waste_impact = None
    if all_ingredients and settings.ENABLE_WASTE_TRACKER:
        try:
            waste_impact = waste_tracker.calculate_impact(all_ingredients, len(recipes))
            pipeline_log.append({"model": "Waste Tracker", "status": "success"})
        except Exception as e:
            logger.error(f"Waste tracker failed: {e}")

    # ── Build response ──
    total_time = round(time.time() - start_time, 2)

    # Build the caption
    caption = ""
    if blip_output:
        caption = blip_output["general_caption"]
    elif voice_ingredients:
        caption = f"Voice input: {voice_ingredients}"

    response = {
        "caption": caption,
        "ingredients": all_ingredients,
        "recipes": recipes,
        "nutritionPerIngredient": [
            {
                "name": n.get("name", ""),
                "calories": n.get("calories", 0),
                "protein": n.get("protein", 0),
                "fat": n.get("fat", 0),
                "carbs": n.get("carbs", 0),
                "fiber": n.get("fiber", 0),
                "source": n.get("source", ""),
            }
            for n in nutrition_data
        ],
        # ── Deep Learning extras ──
        "vision": {
            "blip": blip_output,
            "yolo": yolo_output,
        },
        "wasteImpact": waste_impact,
        "pipeline": {
            "stages": pipeline_log,
            "totalTime_s": total_time,
            "modelsUsed": len(pipeline_log),
            "device": settings.DEVICE,
        },
    }

    return JSONResponse(content=response)


# ──────────────────────────────────────────────
# POST /api/transcribe — Whisper audio transcription
# ──────────────────────────────────────────────

@app.post("/api/transcribe")
async def transcribe_audio(
    audio: UploadFile = File(...),
    language: str = Form(default="en"),
):
    """Transcribe audio using Whisper v3."""
    if not settings.ENABLE_WHISPER:
        raise HTTPException(status_code=503, detail="Whisper is not enabled")

    audio_bytes = await audio.read()

    try:
        whisper_model = await ModelManager.get_whisper()
        result = whisper_model.transcribe(audio_bytes, language=language)
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Transcription failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ──────────────────────────────────────────────
# POST /api/generate-dish — Stable Diffusion plating
# ──────────────────────────────────────────────

class DishGenerateRequest(BaseModel):
    dishName: str
    ingredients: list[str] = []
    cuisine: str = ""


@app.post("/api/generate-dish")
async def generate_dish_image(request: DishGenerateRequest):
    """Generate a photorealistic dish image using Stable Diffusion XL."""
    if not settings.ENABLE_DIFFUSION:
        raise HTTPException(
            status_code=503,
            detail="Diffusion model is not enabled. Set ENABLE_DIFFUSION=true in .env",
        )

    try:
        diffusion = await ModelManager.get_diffusion()
        result = diffusion.generate(
            dish_name=request.dishName,
            ingredients=request.ingredients,
            cuisine=request.cuisine,
        )
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Dish generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ──────────────────────────────────────────────
# POST /api/feedback — RLHF feedback
# ──────────────────────────────────────────────

@app.post("/api/feedback")
async def record_feedback(request: FeedbackRequest):
    """Record user feedback (thumbs up/down) on a recipe."""
    if request.rating not in (1, -1):
        raise HTTPException(status_code=400, detail="Rating must be 1 or -1")

    result = feedback_service.record_feedback(
        recipe_name=request.recipeName,
        rating=request.rating,
        cuisine=request.cuisine,
        ingredients=request.ingredients,
    )
    return JSONResponse(content=result)


# ──────────────────────────────────────────────
# GET /api/preferences — User preference insights
# ──────────────────────────────────────────────

@app.get("/api/preferences")
async def get_preferences():
    """Get RLHF-learned user preference insights."""
    return JSONResponse(content=feedback_service.get_insights())


# ──────────────────────────────────────────────
# GET /api/health — System status
# ──────────────────────────────────────────────

@app.get("/api/health")
async def health_check():
    """Full system health check with model status."""
    return JSONResponse(content={
        "status": "healthy",
        "device": settings.DEVICE,
        "models": ModelManager.status(),
        "rag": recipe_rag.get_stats(),
        "features": {
            "florence": settings.ENABLE_FLORENCE,
            "whisper": settings.ENABLE_WHISPER,
            "diffusion": settings.ENABLE_DIFFUSION,
            "rag": settings.ENABLE_RAG,
            "usda": settings.ENABLE_USDA,
            "waste_tracker": settings.ENABLE_WASTE_TRACKER,
        },
    })


# ──────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────

def _fuse_ingredients(
    blip_output: Optional[dict],
    yolo_output: Optional[dict],
    voice_ingredients: Optional[str],
) -> list[dict]:
    """
    Multi-source ingredient fusion:
    1. YOLOv8 detected objects (highest confidence)
    2. BLIP-2 extracted ingredients (NLP from caption)
    3. Voice / text input from user
    """
    fused: dict[str, dict] = {}

    # 1. YOLO detections (high confidence, bounding-box verified)
    if yolo_output:
        for item in yolo_output.get("food_items", []):
            name = item["label"].lower()
            if name not in fused or item["confidence"] > fused[name]["confidence"]:
                fused[name] = {
                    "name": item["label"],
                    "confidence": item["confidence"],
                    "category": item.get("category", "other"),
                    "source": "Vision Ensemble (CNN + ViT)",
                    "bbox": item.get("bbox"),
                    "estimated_grams": item.get("estimated_grams", 100)
                }

    # 2. BLIP-2 ingredient extraction (parsed from natural language)
    if blip_output:
        ingredient_text = blip_output.get("ingredient_caption", "")
        # Simple NLP extraction: split by commas and common delimiters
        for token in _extract_food_tokens(ingredient_text):
            if token not in fused:
                fused[token] = {
                    "name": token,
                    "confidence": 0.7,
                    "category": _guess_category(token),
                    "source": "Vision Transformer (ViT)",
                }

    # 3. Voice / text input (user-provided, highest trust)
    if voice_ingredients:
        for token in _extract_food_tokens(voice_ingredients):
            if token in fused:
                fused[token]["confidence"] = min(1.0, fused[token]["confidence"] + 0.2)
                fused[token]["source"] += " + Voice"
            else:
                fused[token] = {
                    "name": token,
                    "confidence": 0.9,
                    "category": _guess_category(token),
                    "source": "Voice",
                }

    # Sort by confidence
    result = sorted(fused.values(), key=lambda x: x["confidence"], reverse=True)
    return result


def _extract_food_tokens(text: str) -> list[str]:
    """Extract individual food items from natural language text."""
    import re
    text = text.lower().strip()
    # Remove common non-food words
    stop_words = {
        "a", "an", "the", "and", "or", "with", "some", "few", "i", "have",
        "there", "is", "are", "was", "of", "in", "on", "to", "for", "it",
        "that", "this", "my", "your", "can", "see", "also", "very", "just",
        "like", "what", "image", "photo", "picture", "shows", "appears",
        "looks", "seems", "may", "might", "could", "would", "visible",
    }

    # Split by commas, "and", periods
    text = re.sub(r"[.!?]", ",", text)
    text = re.sub(r"\band\b", ",", text)

    tokens = []
    for chunk in text.split(","):
        chunk = chunk.strip()
        words = [w for w in chunk.split() if w not in stop_words and len(w) > 1]
        if words:
            token = " ".join(words)
            if len(token) > 1 and len(token) < 30:
                tokens.append(token)

    return tokens


def _guess_category(name: str) -> str:
    """Guess the food category from ingredient name."""
    categories = {
        "vegetable": ["onion", "tomato", "potato", "carrot", "broccoli", "spinach", "pepper", "garlic", "ginger", "lettuce", "cabbage", "corn", "peas", "zucchini", "mushroom", "celery", "cucumber", "eggplant", "cauliflower", "sweet potato"],
        "fruit": ["apple", "banana", "orange", "lemon", "lime", "avocado", "berry", "mango", "pineapple", "grape", "strawberry", "blueberry", "peach"],
        "protein": ["chicken", "beef", "pork", "fish", "salmon", "tuna", "shrimp", "lamb", "turkey", "tofu", "tempeh", "sausage"],
        "dairy": ["cheese", "milk", "cream", "butter", "yogurt", "paneer", "ghee", "mozzarella", "cheddar", "parmesan", "feta", "ricotta"],
        "grain": ["rice", "bread", "pasta", "flour", "oats", "noodles", "tortilla", "wheat", "quinoa", "couscous"],
        "spice": ["cumin", "turmeric", "coriander", "paprika", "cinnamon", "oregano", "basil", "thyme", "rosemary", "chili", "garam masala", "nutmeg", "clove", "cardamom"],
        "condiment": ["soy sauce", "vinegar", "mustard", "ketchup", "mayonnaise", "olive oil", "sesame oil", "hot sauce", "salsa", "honey", "maple syrup"],
    }

    name_lower = name.lower()
    for category, keywords in categories.items():
        if any(k in name_lower for k in keywords):
            return category

    return "other"


# ──────────────────────────────────────────────
# Run
# ──────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
