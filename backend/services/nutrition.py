"""
Smart Kitchen Pal — USDA FoodData Central Nutrition Service
Replaces LLM-hallucinated macros with real USDA nutritional data.
"""

import logging
import re
from typing import Optional

import httpx

from backend.config import settings

logger = logging.getLogger("smart_kitchen.services.nutrition")

# ── Common unit conversions to grams ──
UNIT_TO_GRAMS = {
    "cup": 240, "cups": 240,
    "tablespoon": 15, "tablespoons": 15, "tbsp": 15,
    "teaspoon": 5, "teaspoons": 5, "tsp": 5,
    "ounce": 28.35, "ounces": 28.35, "oz": 28.35,
    "pound": 453.6, "pounds": 453.6, "lb": 453.6, "lbs": 453.6,
    "gram": 1, "grams": 1, "g": 1,
    "kilogram": 1000, "kg": 1000,
    "piece": 100, "pieces": 100,
    "slice": 30, "slices": 30,
    "clove": 3, "cloves": 3,
    "bunch": 150, "medium": 150, "large": 200, "small": 100,
}


class NutritionService:
    """Queries USDA FoodData Central for real nutritional data."""

    def __init__(self):
        self.api_key = settings.USDA_API_KEY
        self.base_url = settings.USDA_BASE_URL
        self._cache: dict[str, dict] = {}

    async def get_nutrition(self, ingredient_name: str, quantity_str: str = "") -> dict:
        """
        Look up real nutritional data for an ingredient.
        Parses quantity strings like "2 cups", "100g", etc.
        """
        # Check cache first
        cache_key = f"{ingredient_name}:{quantity_str}".lower()
        if cache_key in self._cache:
            return self._cache[cache_key]

        # Parse quantity
        quantity_grams = self._parse_quantity(quantity_str) if quantity_str else 100

        # Search USDA database
        try:
            food_data = await self._search_food(ingredient_name)
            if not food_data:
                return self._fallback_nutrition(ingredient_name, quantity_grams)

            # Extract nutrients
            nutrients = self._extract_nutrients(food_data, quantity_grams)
            nutrients["source"] = "USDA FoodData Central"
            nutrients["fdc_id"] = food_data.get("fdcId")
            nutrients["name"] = ingredient_name
            nutrients["quantity_grams"] = quantity_grams

            self._cache[cache_key] = nutrients
            return nutrients

        except Exception as e:
            logger.warning(f"USDA lookup failed for '{ingredient_name}': {e}")
            return self._fallback_nutrition(ingredient_name, quantity_grams)

    async def get_bulk_nutrition(self, ingredients: list[str]) -> list[dict]:
        """Get nutrition data for multiple ingredients."""
        results = []
        async with httpx.AsyncClient(timeout=10.0) as client:
            for ingredient in ingredients:
                data = await self.get_nutrition(ingredient)
                results.append(data)
        return results

    async def _search_food(self, query: str) -> Optional[dict]:
        """Search USDA FoodData Central for a food item."""
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{self.base_url}/foods/search",
                params={
                    "api_key": self.api_key,
                    "query": query,
                    "dataType": ["Foundation", "SR Legacy"],
                    "pageSize": 1,
                },
            )

            if response.status_code != 200:
                logger.warning(f"USDA API returned {response.status_code}")
                return None

            data = response.json()
            foods = data.get("foods", [])
            return foods[0] if foods else None

    def _extract_nutrients(self, food_data: dict, quantity_grams: float) -> dict:
        """Extract macro and micronutrients from USDA response."""
        nutrients = food_data.get("foodNutrients", [])

        # USDA nutrient ID mapping
        nutrient_map = {
            1008: "calories",       # Energy (kcal)
            1003: "protein",        # Protein (g)
            1004: "fat",            # Total lipid (g)
            1005: "carbs",          # Carbohydrate (g)
            1079: "fiber",          # Fiber (g)
            1087: "calcium",        # Calcium (mg)
            1089: "iron",           # Iron (mg)
            1090: "magnesium",      # Magnesium (mg)
            1092: "potassium",      # Potassium (mg)
            1093: "sodium",         # Sodium (mg)
            1162: "vitamin_c",      # Vitamin C (mg)
            1106: "vitamin_a",      # Vitamin A (IU)
            1109: "vitamin_e",      # Vitamin E (mg)
        }

        result = {v: 0 for v in nutrient_map.values()}
        scale = quantity_grams / 100  # USDA data is per 100g

        for nutrient in nutrients:
            nutrient_id = nutrient.get("nutrientId") or nutrient.get("nutrientNumber")

            # Try matching by ID
            if isinstance(nutrient_id, int) and nutrient_id in nutrient_map:
                key = nutrient_map[nutrient_id]
                value = nutrient.get("value", 0) or 0
                result[key] = round(value * scale, 2)
                continue

            # Fallback: match by name
            name = (nutrient.get("nutrientName") or "").lower()
            value = nutrient.get("value", 0) or 0

            if "energy" in name and "kcal" in name.lower():
                result["calories"] = round(value * scale, 2)
            elif "protein" in name:
                result["protein"] = round(value * scale, 2)
            elif "total lipid" in name or "fat" in name:
                result["fat"] = round(value * scale, 2)
            elif "carbohydrate" in name:
                result["carbs"] = round(value * scale, 2)
            elif "fiber" in name:
                result["fiber"] = round(value * scale, 2)

        return result

    def _parse_quantity(self, qty_str: str) -> float:
        """Parse a quantity string like '2 cups' into grams."""
        qty_str = qty_str.strip().lower()
        if not qty_str:
            return 100

        # Extract number and unit
        match = re.match(r"([\d.\/]+)\s*(.+)?", qty_str)
        if not match:
            return 100

        number_str, unit = match.group(1), (match.group(2) or "").strip()

        # Handle fractions
        if "/" in number_str:
            parts = number_str.split("/")
            number = float(parts[0]) / float(parts[1])
        else:
            number = float(number_str)

        # Convert to grams
        grams_per_unit = UNIT_TO_GRAMS.get(unit, 100)
        return round(number * grams_per_unit, 1)

    def _fallback_nutrition(self, name: str, quantity_grams: float) -> dict:
        """Provide estimated nutrition when USDA lookup fails."""
        scale = quantity_grams / 100
        
        # Hardcoded fallback macros per 100g to avoid returning 0 on 429 errors
        fallbacks = {
            "chicken": {"calories": 165, "protein": 31, "fat": 3.6, "carbs": 0},
            "beef": {"calories": 250, "protein": 26, "fat": 15, "carbs": 0},
            "milk": {"calories": 42, "protein": 3.4, "fat": 1, "carbs": 5},
            "cheese": {"calories": 402, "protein": 25, "fat": 33, "carbs": 1.3},
            "onion": {"calories": 40, "protein": 1.1, "fat": 0.1, "carbs": 9},
            "tomato": {"calories": 18, "protein": 0.9, "fat": 0.2, "carbs": 3.9},
            "butter": {"calories": 717, "protein": 0.9, "fat": 81, "carbs": 0.1},
            "sauce": {"calories": 80, "protein": 2, "fat": 2, "carbs": 15},
            "rice": {"calories": 130, "protein": 2.7, "fat": 0.3, "carbs": 28},
            "garlic": {"calories": 149, "protein": 6.4, "fat": 0.5, "carbs": 33},
            "bread": {"calories": 265, "protein": 9, "fat": 3.2, "carbs": 49},
            "lemon": {"calories": 29, "protein": 1.1, "fat": 0.3, "carbs": 9},
            "spice": {"calories": 20, "protein": 1, "fat": 1, "carbs": 3},
            "chili": {"calories": 40, "protein": 1.5, "fat": 0.4, "carbs": 9},
            "powder": {"calories": 300, "protein": 10, "fat": 10, "carbs": 40}
        }
        
        n_name = name.lower()
        macros = {"calories": 50, "protein": 2, "fat": 2, "carbs": 5} # Default generic
        
        for k, v in fallbacks.items():
            if k in n_name:
                macros = v
                break

        return {
            "name": name,
            "calories": round(macros["calories"] * scale, 2),
            "protein": round(macros["protein"] * scale, 2),
            "fat": round(macros["fat"] * scale, 2),
            "carbs": round(macros["carbs"] * scale, 2),
            "fiber": 0,
            "source": "Estimated (API Rate Limited)",
            "quantity_grams": quantity_grams,
        }


# Singleton
nutrition_service = NutritionService()
