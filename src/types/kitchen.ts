export interface Ingredient {
  name: string;
  confidence: number;
  category: string;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber?: number;
}

export interface Recipe {
  name: string;
  cuisine: string;
  cookingTime: number;
  ingredients: string[];
  missingIngredients: string[];
  matchScore: number;
  instructions: string;
  detailedSteps?: string[];
  tips?: string;
  servings?: number;
  difficulty?: string;
  nutrition: NutritionInfo;
}

export interface IngredientNutrition {
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface AnalysisResult {
  caption: string;
  ingredients: Ingredient[];
  recipes: Recipe[];
  nutritionPerIngredient: IngredientNutrition[];
}

export interface ExpiryItem {
  ingredient: string;
  purchaseDate: string;
  estimatedDays: number;
}
