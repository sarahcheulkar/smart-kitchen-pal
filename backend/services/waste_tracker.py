"""
Smart Kitchen Pal — Food Waste & Carbon Footprint Tracker
Calculates environmental impact of using ingredients before they expire.
X-Factor feature for competition scoring.
"""

import json
import logging
from pathlib import Path
from datetime import datetime, timedelta
from typing import Optional

from backend.config import settings

logger = logging.getLogger("smart_kitchen.services.waste_tracker")

# ── Carbon footprint data (kg CO2e per kg of food) ──
# Source: Our World in Data / Poore & Nemecek (2018)
DEFAULT_CARBON_DATA = {
    "beef": 27.0, "lamb": 24.0, "cheese": 13.5, "pork": 7.6,
    "chicken": 6.9, "turkey": 5.7, "fish": 5.4, "salmon": 5.4,
    "tuna": 5.4, "shrimp": 11.8, "prawns": 11.8,
    "egg": 4.8, "eggs": 4.8, "milk": 3.2, "cream": 3.8,
    "butter": 11.5, "yogurt": 2.5, "rice": 2.7, "wheat": 1.4,
    "bread": 1.6, "pasta": 1.5, "flour": 1.4,
    "tomato": 1.4, "tomatoes": 1.4, "potato": 0.5, "potatoes": 0.5,
    "onion": 0.4, "onions": 0.4, "garlic": 0.5,
    "carrot": 0.4, "carrots": 0.4, "broccoli": 0.9,
    "spinach": 0.5, "lettuce": 0.7, "pepper": 1.0, "peppers": 1.0,
    "mushroom": 0.8, "mushrooms": 0.8,
    "apple": 0.4, "banana": 0.7, "orange": 0.5, "lemon": 0.4,
    "avocado": 2.5, "coconut": 0.6,
    "sugar": 3.2, "chocolate": 19.0, "coffee": 16.5,
    "oil": 3.5, "olive oil": 5.4, "soybean": 2.0, "tofu": 2.0,
    "beans": 0.8, "lentils": 0.9, "chickpeas": 0.8, "peas": 0.9,
    "corn": 1.1, "soy sauce": 1.0, "vinegar": 0.5,
    "nuts": 2.3, "almonds": 2.3, "peanuts": 1.2, "walnuts": 2.0,
    "honey": 1.2, "maple syrup": 1.5,
}

# Average food waste per ingredient category (grams typically wasted)
WASTE_ESTIMATES = {
    "fruit": 150, "vegetable": 200, "protein": 180,
    "dairy": 120, "grain": 100, "spice": 20,
    "condiment": 50, "other": 100,
}


class WasteTracker:
    """
    Tracks food waste reduction and carbon footprint savings.
    Calculates the environmental impact of cooking with available ingredients.
    """

    def __init__(self):
        self.carbon_data = DEFAULT_CARBON_DATA
        self._load_custom_carbon_data()

    def _load_custom_carbon_data(self):
        """Load custom carbon data if available."""
        carbon_path = settings.DATA_DIR / "carbon_data.json"
        if carbon_path.exists():
            try:
                with open(carbon_path, "r") as f:
                    custom = json.load(f)
                self.carbon_data.update(custom)
                logger.info(f"Loaded {len(custom)} custom carbon entries")
            except Exception as e:
                logger.warning(f"Failed to load carbon data: {e}")

    def calculate_impact(
        self,
        ingredients: list[dict],
        recipes_used: int = 1,
    ) -> dict:
        """
        Calculate the environmental impact of using the detected ingredients.

        Args:
            ingredients: List of dicts with 'name' and optional 'category' keys
            recipes_used: Number of recipes the user plans to cook

        Returns:
            Detailed impact metrics including CO2 saved, water saved, waste prevented
        """
        total_co2_saved = 0
        total_waste_prevented_g = 0
        ingredient_impacts = []

        for ing in ingredients:
            name = ing.get("name", "").lower()
            category = ing.get("category", "other")

            # Find carbon footprint (fuzzy match)
            co2_per_kg = self._find_carbon(name)
            waste_g = WASTE_ESTIMATES.get(category, 100)

            # CO2 saved = waste prevented * carbon intensity
            co2_saved = (waste_g / 1000) * co2_per_kg
            total_co2_saved += co2_saved
            total_waste_prevented_g += waste_g

            ingredient_impacts.append({
                "name": ing.get("name", name),
                "co2_saved_kg": round(co2_saved, 3),
                "co2_per_kg": co2_per_kg,
                "waste_prevented_g": waste_g,
                "category": category,
            })

        # Sort by impact
        ingredient_impacts.sort(key=lambda x: x["co2_saved_kg"], reverse=True)

        # Equivalency calculations
        co2_total = round(total_co2_saved, 2)
        waste_total_kg = round(total_waste_prevented_g / 1000, 2)

        return {
            "co2_saved_kg": co2_total,
            "waste_prevented_kg": waste_total_kg,
            "meals_from_waste": recipes_used,
            "per_ingredient": ingredient_impacts,
            "equivalencies": {
                "car_km_avoided": round(co2_total / 0.21, 1),      # avg car = 0.21 kg CO2/km
                "trees_daily_absorption": round(co2_total / 0.06, 1),  # tree absorbs ~22kg/year ≈ 0.06/day
                "smartphone_charges": round(co2_total / 0.008, 0),  # ~8g CO2 per charge
                "water_saved_liters": round(waste_total_kg * 200, 0),  # rough avg water footprint
            },
            "sustainability_score": min(100, round(co2_total * 15)),  # 0-100 score
        }

    def _find_carbon(self, ingredient_name: str) -> float:
        """Fuzzy-match ingredient to carbon data."""
        name = ingredient_name.lower().strip()

        # Direct match
        if name in self.carbon_data:
            return self.carbon_data[name]

        # Partial match
        for key, value in self.carbon_data.items():
            if key in name or name in key:
                return value

        # Default: average food carbon footprint
        return 2.5

    def get_weekly_summary(self, meals_cooked: int, ingredients_used: int) -> dict:
        """Generate a weekly sustainability summary."""
        avg_co2_per_meal = 2.5  # kg CO2e average
        return {
            "meals_cooked": meals_cooked,
            "ingredients_used": ingredients_used,
            "estimated_co2_saved": round(meals_cooked * avg_co2_per_meal * 0.3, 2),
            "estimated_waste_prevented_kg": round(ingredients_used * 0.15, 2),
            "streak_days": meals_cooked,  # Placeholder for real tracking
        }


# Singleton
waste_tracker = WasteTracker()
