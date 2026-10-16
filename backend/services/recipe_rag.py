"""
Smart Kitchen Pal — RAG Recipe Engine
Retrieval-Augmented Generation: embeds real recipes into ChromaDB,
retrieves the best matches by detected ingredients, then uses an LLM
only for formatting and personalization — never for inventing recipes.
"""

import json
import logging
from pathlib import Path
from typing import Optional

import chromadb
from chromadb.config import Settings as ChromaSettings

from backend.config import settings

logger = logging.getLogger("smart_kitchen.services.recipe_rag")


class RecipeRAGEngine:
    """
    RAG-based recipe recommendation engine.
    - Embeds recipes with Sentence-Transformers
    - Stores in ChromaDB
    - Retrieves by ingredient similarity
    """

    def __init__(self):
        self._client: Optional[chromadb.ClientAPI] = None
        self._collection = None
        self._initialized = False

    async def initialize(self, embedding_model):
        """Initialize ChromaDB and seed with recipe dataset."""
        if self._initialized:
            return

        # Create persistent ChromaDB client
        db_path = str(settings.DB_DIR)
        Path(db_path).mkdir(parents=True, exist_ok=True)

        self._client = chromadb.PersistentClient(
            path=db_path,
            settings=ChromaSettings(anonymized_telemetry=False),
        )

        self._collection = self._client.get_or_create_collection(
            name="recipes",
            metadata={"hnsw:space": "cosine"},
        )

        # Seed if empty
        if self._collection.count() == 0:
            await self._seed_recipes(embedding_model)

        self._initialized = True
        logger.info(f"✅ RAG engine initialized with {self._collection.count()} recipes")

    async def _seed_recipes(self, embedding_model):
        """Load and embed the seed recipe dataset."""
        recipes_path = settings.DATA_DIR / "recipes_seed.json"

        if not recipes_path.exists():
            logger.warning(f"No recipe dataset found at {recipes_path}")
            return

        with open(recipes_path, "r") as f:
            recipes = json.load(f)

        logger.info(f"Seeding {len(recipes)} recipes into ChromaDB...")

        documents = []
        metadatas = []
        ids = []

        for i, recipe in enumerate(recipes):
            # Create a rich text document for embedding
            ingredient_text = ", ".join(recipe.get("ingredients", []))
            doc = (
                f"{recipe['name']}. "
                f"Cuisine: {recipe.get('cuisine', 'General')}. "
                f"Ingredients: {ingredient_text}. "
                f"{recipe.get('description', '')}"
            )
            documents.append(doc)

            metadatas.append({
                "name": recipe["name"],
                "cuisine": recipe.get("cuisine", "General"),
                "cooking_time": recipe.get("cooking_time", 30),
                "servings": recipe.get("servings", 4),
                "difficulty": recipe.get("difficulty", "Medium"),
                "recipe_json": json.dumps(recipe),
            })

            ids.append(f"recipe_{i}")

        # Embed all documents
        embeddings = embedding_model.encode(documents).tolist()

        # Batch insert into ChromaDB
        batch_size = 100
        for start in range(0, len(documents), batch_size):
            end = min(start + batch_size, len(documents))
            self._collection.add(
                documents=documents[start:end],
                metadatas=metadatas[start:end],
                ids=ids[start:end],
                embeddings=embeddings[start:end],
            )

        logger.info(f"✅ Seeded {len(recipes)} recipes")

    async def search(
        self,
        ingredients: list[str],
        embedding_model,
        cuisine_filter: str = "",
        max_time: int = 120,
        top_k: int = 0,
    ) -> list[dict]:
        """
        Search for recipes matching the given ingredients.
        Uses cosine similarity on ingredient embeddings.
        """
        if not self._initialized:
            logger.warning("RAG engine not initialized")
            return []

        top_k = top_k or settings.RAG_TOP_K

        # Build query from detected ingredients
        query_text = f"Recipe with ingredients: {', '.join(ingredients)}"
        query_embedding = embedding_model.encode([query_text]).tolist()

        # Build ChromaDB filters
        where_filters = {}
        if cuisine_filter and cuisine_filter != "All":
            where_filters["cuisine"] = cuisine_filter

        # Query ChromaDB
        try:
            query_params = {
                "query_embeddings": query_embedding,
                "n_results": top_k * 2,  # Over-fetch for post-filtering
                "include": ["documents", "metadatas", "distances"],
            }

            if where_filters:
                query_params["where"] = where_filters

            results = self._collection.query(**query_params)
        except Exception as e:
            logger.error(f"ChromaDB query failed: {e}")
            return []

        # Process results
        recipes = []
        seen_names = set()

        for i in range(len(results["ids"][0])):
            metadata = results["metadatas"][0][i]
            distance = results["distances"][0][i]
            similarity = 1 - distance  # cosine distance → similarity

            # Skip duplicates
            if metadata["name"] in seen_names:
                continue
            seen_names.add(metadata["name"])

            # Post-filter by cooking time
            if metadata.get("cooking_time", 0) > max_time:
                continue

            # Parse the full recipe from metadata
            recipe_data = json.loads(metadata["recipe_json"])

            # Calculate ingredient match score
            recipe_ingredients_lower = [
                ing.lower() for ing in recipe_data.get("ingredients", [])
            ]
            detected_lower = [ing.lower() for ing in ingredients]

            matched = [
                ing for ing in detected_lower
                if any(ing in r_ing for r_ing in recipe_ingredients_lower)
            ]
            missing = [
                ing for ing in recipe_data.get("ingredients", [])
                if not any(d in ing.lower() for d in detected_lower)
            ]

            match_score = len(matched) / max(len(recipe_data.get("ingredients", [])), 1)

            recipes.append({
                "name": recipe_data["name"],
                "cuisine": recipe_data.get("cuisine", "General"),
                "cookingTime": recipe_data.get("cooking_time", 30),
                "servings": recipe_data.get("servings", 4),
                "difficulty": recipe_data.get("difficulty", "Medium"),
                "ingredients": recipe_data.get("ingredients", []),
                "missingIngredients": missing[:5],
                "matchScore": round(max(match_score, similarity), 4),
                "ragSimilarity": round(similarity, 4),
                "instructions": recipe_data.get("instructions", ""),
                "detailedSteps": recipe_data.get("steps", []),
                "tips": recipe_data.get("tips", ""),
                "nutrition": recipe_data.get("nutrition", {
                    "calories": 0, "protein": 0, "fat": 0, "carbs": 0
                }),
                "source": "RAG (ChromaDB)",
            })

        # Sort by match score
        recipes.sort(key=lambda r: r["matchScore"], reverse=True)
        return recipes[:top_k]

    def get_stats(self) -> dict:
        """Get RAG engine statistics."""
        if not self._initialized:
            return {"status": "not_initialized", "recipe_count": 0}
        return {
            "status": "ready",
            "recipe_count": self._collection.count(),
            "db_path": str(settings.DB_DIR),
        }


# Singleton
recipe_rag = RecipeRAGEngine()
