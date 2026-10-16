"""
Smart Kitchen Pal — RLHF Feedback System
Reinforcement Learning from Human Feedback: records thumbs up/down
on recipes and builds a preference model to re-rank future results.
"""

import json
import logging
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Optional
from collections import Counter

from backend.config import settings

logger = logging.getLogger("smart_kitchen.services.feedback")


class FeedbackService:
    """
    RLHF-inspired feedback system that learns user preferences.

    - Records thumbs up/down on recipes
    - Tracks ingredient preferences and cuisine affinities
    - Re-ranks future recipe results based on learned preferences
    """

    def __init__(self):
        self.db_path = settings.FEEDBACK_DB
        self._ensure_db()

    def _ensure_db(self):
        """Create the feedback database if it doesn't exist."""
        Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
        conn = sqlite3.connect(str(self.db_path))
        cursor = conn.cursor()

        cursor.executescript("""
            CREATE TABLE IF NOT EXISTS feedback (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                recipe_name TEXT NOT NULL,
                cuisine TEXT DEFAULT '',
                ingredients TEXT DEFAULT '[]',
                rating INTEGER NOT NULL,  -- 1 = thumbs up, -1 = thumbs down
                timestamp TEXT NOT NULL,
                context TEXT DEFAULT '{}'
            );

            CREATE TABLE IF NOT EXISTS preferences (
                key TEXT PRIMARY KEY,
                value REAL DEFAULT 0,
                count INTEGER DEFAULT 0,
                updated_at TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_feedback_recipe ON feedback(recipe_name);
            CREATE INDEX IF NOT EXISTS idx_feedback_rating ON feedback(rating);
        """)

        conn.commit()
        conn.close()

    def record_feedback(
        self,
        recipe_name: str,
        rating: int,
        cuisine: str = "",
        ingredients: list[str] = None,
        context: dict = None,
    ) -> dict:
        """
        Record user feedback on a recipe.
        rating: 1 (thumbs up) or -1 (thumbs down)
        """
        ingredients = ingredients or []
        context = context or {}

        conn = sqlite3.connect(str(self.db_path))
        cursor = conn.cursor()

        cursor.execute(
            """INSERT INTO feedback (recipe_name, cuisine, ingredients, rating, timestamp, context)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (
                recipe_name,
                cuisine,
                json.dumps(ingredients),
                rating,
                datetime.now().isoformat(),
                json.dumps(context),
            ),
        )

        conn.commit()
        conn.close()

        # Update preference scores
        self._update_preferences(cuisine, ingredients, rating)

        total = self._get_total_feedback()
        return {
            "recorded": True,
            "recipe": recipe_name,
            "rating": "positive" if rating > 0 else "negative",
            "total_feedback": total,
        }

    def _update_preferences(self, cuisine: str, ingredients: list[str], rating: int):
        """Update preference scores based on feedback."""
        conn = sqlite3.connect(str(self.db_path))
        cursor = conn.cursor()
        now = datetime.now().isoformat()

        # Update cuisine preference
        if cuisine:
            key = f"cuisine:{cuisine.lower()}"
            cursor.execute(
                """INSERT INTO preferences (key, value, count, updated_at) VALUES (?, ?, 1, ?)
                   ON CONFLICT(key) DO UPDATE SET
                   value = value + ?, count = count + 1, updated_at = ?""",
                (key, rating * 0.1, now, rating * 0.1, now),
            )

        # Update ingredient preferences
        for ing in ingredients:
            key = f"ingredient:{ing.lower()}"
            cursor.execute(
                """INSERT INTO preferences (key, value, count, updated_at) VALUES (?, ?, 1, ?)
                   ON CONFLICT(key) DO UPDATE SET
                   value = value + ?, count = count + 1, updated_at = ?""",
                (key, rating * 0.05, now, rating * 0.05, now),
            )

        conn.commit()
        conn.close()

    def rerank_recipes(self, recipes: list[dict]) -> list[dict]:
        """
        Re-rank recipes based on learned user preferences.
        Adds a preference boost to the match score.
        """
        prefs = self._get_all_preferences()

        for recipe in recipes:
            boost = 0.0

            # Cuisine boost
            cuisine_key = f"cuisine:{recipe.get('cuisine', '').lower()}"
            if cuisine_key in prefs:
                boost += prefs[cuisine_key]["value"]

            # Ingredient boost
            for ing in recipe.get("ingredients", []):
                ing_key = f"ingredient:{ing.lower()}"
                if ing_key in prefs:
                    boost += prefs[ing_key]["value"]

            # Apply boost (clamped)
            original_score = recipe.get("matchScore", 0.5)
            recipe["matchScore"] = round(
                max(0, min(1, original_score + boost)), 4
            )
            recipe["preferenceBoost"] = round(boost, 4)

        # Re-sort by adjusted score
        recipes.sort(key=lambda r: r["matchScore"], reverse=True)
        return recipes

    def get_insights(self) -> dict:
        """Get learned preference insights for the user."""
        prefs = self._get_all_preferences()

        cuisines = {}
        ingredients = {}

        for key, data in prefs.items():
            if key.startswith("cuisine:"):
                name = key.split(":", 1)[1].title()
                cuisines[name] = {
                    "score": round(data["value"], 3),
                    "feedback_count": data["count"],
                }
            elif key.startswith("ingredient:"):
                name = key.split(":", 1)[1].title()
                ingredients[name] = {
                    "score": round(data["value"], 3),
                    "feedback_count": data["count"],
                }

        # Sort by score
        top_cuisines = sorted(cuisines.items(), key=lambda x: x[1]["score"], reverse=True)[:5]
        top_ingredients = sorted(ingredients.items(), key=lambda x: x[1]["score"], reverse=True)[:10]
        avoided_ingredients = sorted(ingredients.items(), key=lambda x: x[1]["score"])[:5]

        total = self._get_total_feedback()
        positive = self._count_feedback(1)
        negative = self._count_feedback(-1)

        return {
            "total_feedback": total,
            "positive_count": positive,
            "negative_count": negative,
            "satisfaction_rate": round(positive / max(total, 1) * 100, 1),
            "favorite_cuisines": [{"name": n, **d} for n, d in top_cuisines],
            "preferred_ingredients": [{"name": n, **d} for n, d in top_ingredients],
            "avoided_ingredients": [{"name": n, **d} for n, d in avoided_ingredients if d["score"] < 0],
        }

    def _get_all_preferences(self) -> dict:
        conn = sqlite3.connect(str(self.db_path))
        cursor = conn.cursor()
        cursor.execute("SELECT key, value, count FROM preferences")
        prefs = {row[0]: {"value": row[1], "count": row[2]} for row in cursor.fetchall()}
        conn.close()
        return prefs

    def _get_total_feedback(self) -> int:
        conn = sqlite3.connect(str(self.db_path))
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM feedback")
        total = cursor.fetchone()[0]
        conn.close()
        return total

    def _count_feedback(self, rating: int) -> int:
        conn = sqlite3.connect(str(self.db_path))
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM feedback WHERE rating = ?", (rating,))
        count = cursor.fetchone()[0]
        conn.close()
        return count


# Singleton
feedback_service = FeedbackService()
