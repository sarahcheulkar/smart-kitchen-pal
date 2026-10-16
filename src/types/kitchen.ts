// ── Core ingredient ──
export interface Ingredient {
  name: string;
  confidence: number;
  category: string;
  source?: string;          // "YOLOv8" | "BLIP-2" | "Voice" | combined
  bbox?: BoundingBox;       // From YOLOv8
}

export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

// ── Nutrition ──
export interface NutritionInfo {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber?: number;
}

export interface IngredientNutrition {
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber?: number;
  source?: string;   // "USDA FoodData Central" | "unavailable"
}

// ── Recipe ──
export interface Recipe {
  name: string;
  cuisine: string;
  cookingTime: number;
  ingredients: string[];
  missingIngredients: string[];
  matchScore: number;
  ragSimilarity?: number;     // Cosine similarity from RAG
  preferenceBoost?: number;   // RLHF boost applied
  instructions: string;
  detailedSteps?: string[];
  tips?: string;
  servings?: number;
  difficulty?: string;
  nutrition: NutritionInfo;
  source?: string;            // "RAG (ChromaDB)"
}

// ── BLIP-2 Vision Output ──
export interface BLIPOutput {
  general_caption: string;
  ingredient_caption: string;
  scene_description: string;
  cuisine_suggestion: string;
}

// ── YOLOv8 Detection Output ──
export interface YOLODetection {
  label: string;
  confidence: number;
  bbox: BoundingBox;
  category: string;
  is_food: boolean;
}

export interface YOLOOutput {
  food_items: YOLODetection[];
  scene_objects: YOLODetection[];
  total_food_detected: number;
  total_objects: number;
  unique_foods: string[];
}

// ── Vision combined ──
export interface VisionOutput {
  blip: BLIPOutput | null;
  yolo: YOLOOutput | null;
}

// ── Pipeline telemetry ──
export interface PipelineStage {
  model: string;
  status: "success" | "error";
  time_s?: number;
  error?: string;
  results?: number;
}

export interface PipelineInfo {
  stages: PipelineStage[];
  totalTime_s: number;
  modelsUsed: number;
  device: string;
}

// ── Waste & Carbon Footprint ──
export interface WasteEquivalency {
  car_km_avoided: number;
  trees_daily_absorption: number;
  smartphone_charges: number;
  water_saved_liters: number;
}

export interface IngredientImpact {
  name: string;
  co2_saved_kg: number;
  co2_per_kg: number;
  waste_prevented_g: number;
  category: string;
}

export interface WasteImpact {
  co2_saved_kg: number;
  waste_prevented_kg: number;
  meals_from_waste: number;
  per_ingredient: IngredientImpact[];
  equivalencies: WasteEquivalency;
  sustainability_score: number;
}

// ── Full Analysis Result ──
export interface AnalysisResult {
  caption: string;
  ingredients: Ingredient[];
  recipes: Recipe[];
  nutritionPerIngredient: IngredientNutrition[];
  // Deep Learning extras
  vision?: VisionOutput;
  wasteImpact?: WasteImpact;
  pipeline?: PipelineInfo;
  // Legacy hybrid field (backward compat)
  hybrid?: {
    apiIngredients: string[];
    clipIngredients: string[];
    blipIngredients: string[];
    finalIngredients: string[];
  };
}

// ── Whisper Transcription ──
export interface WhisperSegment {
  start: number;
  end: number;
  text: string;
  confidence: number;
}

export interface TranscriptionResult {
  text: string;
  language: string;
  segments: WhisperSegment[];
  duration: number;
}

// ── Feedback / RLHF ──
export interface FeedbackResult {
  recorded: boolean;
  recipe: string;
  rating: string;
  total_feedback: number;
}

export interface PreferenceInsight {
  name: string;
  score: number;
  feedback_count: number;
}

export interface UserPreferences {
  total_feedback: number;
  positive_count: number;
  negative_count: number;
  satisfaction_rate: number;
  favorite_cuisines: PreferenceInsight[];
  preferred_ingredients: PreferenceInsight[];
  avoided_ingredients: PreferenceInsight[];
}

// ── Misc ──
export interface ExpiryItem {
  ingredient: string;
  purchaseDate: string;
  estimatedDays: number;
}
