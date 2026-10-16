# Smart Kitchen Pal - Deep Learning Upgrade Plan

This document summarizes the architectural upgrades discussed to elevate the project from a basic API-wrapper to a strong, competition-level Deep Learning project.

## Current State
- **Frontend:** React, Vite, Tailwind CSS, shadcn/ui.
- **Backend:** Supabase Edge Functions (`analyze-food` in Deno).
- **AI Logic:** A single prompt sent to `google/gemini-2.5-flash` via an API gateway, which hallucinates the caption, ingredients, nutrition, and recipes. The "hybrid" CLIP/BLIP logic is simulated with array slicing and keyword matching.

## The Competition-Level Vision (Option B)
To make this a true Deep Learning project, we are moving the AI logic to a dedicated **Python FastAPI** backend running real PyTorch/TensorFlow pipelines.

### 1. Computer Vision (Ingredient Recognition)
Instead of relying solely on an LLM to guess ingredients from an image:
- **Object Detection (YOLOv10 / DETR):** Run an object detection model fine-tuned on food datasets (e.g., Food-101, UEC Food-256) to get exact bounding boxes and counts of ingredients on the counter.
- **Scene Captioning (BLIP):** Use Salesforce's `blip-image-captioning-large` (via Hugging Face) to generate an accurate, contextual description of the kitchen environment and ingredients.
- **Zero-Shot Segmentation (SAM 2 - Optional):** For extra flair, use Meta's Segment Anything Model to perfectly mask and highlight ingredients in the UI.

### 2. NLP & Recommendation (Recipe Generation)
Instead of having Gemini invent recipes:
- **Retrieval-Augmented Generation (RAG):** Load a dataset of 100,000+ real recipes (like Recipe1M+) into a vector database (e.g., Supabase `pgvector` or Pinecone/Chroma).
- When ingredients are detected, search the vector DB for authentic recipes that match.
- Use an LLM (Llama-3, Gemini, or Mistral) only to format the retrieved recipe, substitute missing ingredients, and personalize the tone.

### 3. Nutritional Analysis
- **USDA FoodData Central API:** Replace LLM hallucinated macros with real data. Use an NLP model for Named Entity Recognition (NER) to extract quantities ("2 cups flour") and query the USDA API for exact protein, fat, carb, and micronutrient counts.

### 4. Audio Input
- **Whisper (OpenAI):** Upgrade browser-based speech-to-text with Whisper V3 for highly accurate, robust, and multilingual voice recognition (handles kitchen noise and accents better).

### 5. X-Factors for the Hackathon/Competition
- **Generative AI Plating:** Use a Diffusion model (Stable Diffusion XL / Flux) to generate a realistic image of the predicted final dish.
- **Food Waste Tracking:** Calculate and visualize the carbon footprint saved by using expiring ingredients.
- **RLHF (Reinforcement Learning from Human Feedback):** Implement a thumbs up/down system where the recipe engine learns user preferences over time.

---

## Next Steps for Implementation

1. **Scaffold the Backend:**
   - Create a `backend/` directory.
   - Set up a Python virtual environment (`python -m venv venv`).
   - Install dependencies: `fastapi`, `uvicorn`, `torch`, `transformers`, `pillow`, `python-multipart`.

2. **Build the FastAPI Server (`backend/main.py`):**
   - Create an endpoint `/api/analyze-food` that accepts `multipart/form-data` (images) and JSON (transcripts).

3. **Integrate Real Models (`backend/models/vision.py`):**
   - Use Hugging Face's `transformers` library to load the BLIP model and generate real captions locally.

4. **Connect Frontend to Backend:**
   - Modify `src/hooks/useAnalyzeFood.ts` to POST to `http://localhost:8000/api/analyze-food` instead of the Supabase Edge Function.
