import { Ingredient } from "@/types/kitchen";
import { Tag, Check, Sparkles, Leaf, Drumstick } from "lucide-react";

interface IngredientsListProps {
  ingredients: Ingredient[];
}

const nonVegKeywords = [
  "beef", "chicken", "turkey", "pork", "meat", "fish", "salmon",
  "tuna", "shrimp", "lamb", "mutton", "sausage", "bacon", "broth",
  "bone", "egg", "eggs", "duck", "veal", "ham", "seafood"
];

function isVeg(name: string, category: string): boolean {
  const lowerName = name.toLowerCase();
  if (nonVegKeywords.some(keyword => lowerName.includes(keyword))) {
    return false;
  }
  return category !== "protein";
}

export function IngredientsList({ ingredients }: IngredientsListProps) {
  return (
    <div className="glass-card animate-fade-in-up">
      <h2 className="text-lg font-display font-bold text-foreground mb-4 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg gradient-secondary flex items-center justify-center">
          <Tag className="w-3.5 h-3.5 text-secondary-foreground" />
        </div>
        Detected Ingredients
        <span className="ml-auto flex items-center gap-1 text-sm font-sans font-normal text-muted-foreground">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          {ingredients.length} found
        </span>
      </h2>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Leaf className="w-3 h-3 text-neon-green" /> Veg</span>
        <span className="flex items-center gap-1"><Drumstick className="w-3 h-3 text-neon-orange" /> Non-Veg</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {ingredients.map((ing, i) => {
          const veg = isVeg(ing.name, ing.category);
          return (
            <div
              key={i}
              className={`chip-ingredient bg-gradient-to-r animate-bounce-in ${
                veg
                  ? "from-neon-green/20 to-neon-green/5 border-neon-green/30"
                  : "from-neon-orange/20 via-neon-pink/10 to-neon-pink/5 border-neon-pink/30"
              }`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {veg ? (
                <Leaf className="w-3.5 h-3.5 text-neon-green" />
              ) : (
                <Drumstick className="w-3.5 h-3.5 text-neon-orange" />
              )}
              <span className="text-foreground">{ing.name}</span>
              <span className={`text-xs font-semibold ${veg ? "text-neon-green" : "text-neon-orange"}`}>
                {Math.round(ing.confidence * 100)}%
              </span>
              {ing.source && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted/50 text-muted-foreground border border-border/30 ml-auto">
                  {ing.source.replace("Florence-2 (Detection)", "Vision Ensemble (CNN + ViT)").replace("Florence-2", "Vision Ensemble")}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
