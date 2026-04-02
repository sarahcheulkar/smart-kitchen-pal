import { Recipe } from "@/types/kitchen";
import { Clock, Heart, ShoppingCart, ChefHat, AlertCircle, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface RecipeCardProps {
  recipe: Recipe;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onAddToShoppingList: (items: string[]) => void;
}

const cuisineEmoji: Record<string, string> = {
  Indian: "🇮🇳", Italian: "🇮🇹", Chinese: "🇨🇳", Healthy: "🥗",
  Mexican: "🇲🇽", American: "🇺🇸", Japanese: "🇯🇵", Mediterranean: "🫒",
};

export function RecipeCard({ recipe, isFavorite, onToggleFavorite, onAddToShoppingList }: RecipeCardProps) {
  const matchPercent = Math.round(recipe.matchScore * 100);

  return (
    <div className="glass-card animated-border animate-fade-in-up group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-display font-bold text-foreground group-hover:text-gradient transition-colors">
            {recipe.name}
          </h3>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
              {cuisineEmoji[recipe.cuisine] || "🍽️"} {recipe.cuisine}
            </Badge>
            <span className="text-muted-foreground text-xs flex items-center gap-1">
              <Clock className="w-3 h-3" /> {recipe.cookingTime} min
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleFavorite}
          className={`w-9 h-9 rounded-xl transition-all duration-300 ${
            isFavorite
              ? "text-neon-pink bg-neon-pink/10 shadow-[0_0_15px_hsl(var(--neon-pink)/0.3)]"
              : "text-muted-foreground hover:text-neon-pink hover:bg-neon-pink/10"
          }`}
        >
          <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
        </Button>
      </div>

      {/* Match score bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-muted-foreground flex items-center gap-1">
            <Flame className="w-3 h-3 text-neon-orange" /> Match Score
          </span>
          <span className={`font-bold ${matchPercent > 80 ? "text-neon-green" : matchPercent > 50 ? "text-neon-orange" : "text-neon-pink"}`}>
            {matchPercent}%
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              matchPercent > 80 ? "gradient-secondary" : matchPercent > 50 ? "bg-neon-orange" : "gradient-warm"
            }`}
            style={{ width: `${matchPercent}%` }}
          />
        </div>
      </div>

      {/* Ingredients */}
      <div className="mb-3">
        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
          <ChefHat className="w-3.5 h-3.5" /> Ingredients
        </p>
        <div className="flex flex-wrap gap-1.5">
          {recipe.ingredients.map((ing, i) => (
            <span key={i} className="chip-ingredient text-xs py-1 px-2.5">{ing}</span>
          ))}
        </div>
      </div>

      {/* Missing ingredients */}
      {recipe.missingIngredients.length > 0 && (
        <div className="mb-3 p-3 rounded-xl bg-destructive/5 border border-destructive/15">
          <p className="text-xs font-semibold text-destructive flex items-center gap-1 mb-2">
            <AlertCircle className="w-3.5 h-3.5" /> Missing ({recipe.missingIngredients.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {recipe.missingIngredients.map((ing, i) => (
              <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-destructive/10 text-destructive border border-destructive/20">{ing}</span>
            ))}
          </div>
          <Button
            size="sm"
            variant="outline"
            className="mt-2.5 text-xs h-8 border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10"
            onClick={() => onAddToShoppingList(recipe.missingIngredients)}
          >
            <ShoppingCart className="w-3 h-3 mr-1" /> Add to Shopping List
          </Button>
        </div>
      )}

      <p className="text-sm text-muted-foreground leading-relaxed">{recipe.instructions}</p>

      {/* Nutrition row */}
      <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-border/30">
        {[
          { label: "Cal", value: recipe.nutrition.calories, color: "text-neon-orange" },
          { label: "Protein", value: `${recipe.nutrition.protein}g`, color: "text-neon-green" },
          { label: "Fat", value: `${recipe.nutrition.fat}g`, color: "text-neon-pink" },
          { label: "Carbs", value: `${recipe.nutrition.carbs}g`, color: "text-neon-cyan" },
        ].map(({ label, value, color }) => (
          <div key={label} className="text-center">
            <div className={`text-sm font-bold ${color}`}>{value}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
