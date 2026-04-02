import { Recipe } from "@/types/kitchen";
import { Clock, Heart, ShoppingCart, ChefHat, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

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
  return (
    <div className="kitchen-card animate-fade-in-up">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-display font-bold text-foreground">{recipe.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">
              {cuisineEmoji[recipe.cuisine] || "🍽️"} {recipe.cuisine}
            </Badge>
            <span className="text-muted-foreground text-xs flex items-center gap-1">
              <Clock className="w-3 h-3" /> {recipe.cookingTime} min
            </span>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onToggleFavorite} className={isFavorite ? "text-kitchen-red" : "text-muted-foreground"}>
          <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
        </Button>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>Match Score</span>
          <span>{Math.round(recipe.matchScore * 100)}%</span>
        </div>
        <Progress value={recipe.matchScore * 100} className="h-2" />
      </div>

      <div className="mb-3">
        <p className="text-sm text-muted-foreground font-medium mb-1 flex items-center gap-1">
          <ChefHat className="w-3.5 h-3.5" /> Ingredients
        </p>
        <div className="flex flex-wrap gap-1">
          {recipe.ingredients.map((ing, i) => (
            <span key={i} className="ingredient-chip text-xs">{ing}</span>
          ))}
        </div>
      </div>

      {recipe.missingIngredients.length > 0 && (
        <div className="mb-3 p-2.5 rounded-lg bg-destructive/5 border border-destructive/10">
          <p className="text-xs font-medium text-destructive flex items-center gap-1 mb-1.5">
            <AlertCircle className="w-3.5 h-3.5" /> Missing Ingredients
          </p>
          <div className="flex flex-wrap gap-1">
            {recipe.missingIngredients.map((ing, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">{ing}</span>
            ))}
          </div>
          <Button size="sm" variant="outline" className="mt-2 text-xs h-7" onClick={() => onAddToShoppingList(recipe.missingIngredients)}>
            <ShoppingCart className="w-3 h-3 mr-1" /> Add to Shopping List
          </Button>
        </div>
      )}

      <p className="text-sm text-foreground/70 leading-relaxed">{recipe.instructions}</p>

      <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-border">
        {[
          { label: "Cal", value: recipe.nutrition.calories },
          { label: "Protein", value: `${recipe.nutrition.protein}g` },
          { label: "Fat", value: `${recipe.nutrition.fat}g` },
          { label: "Carbs", value: `${recipe.nutrition.carbs}g` },
        ].map(({ label, value }) => (
          <div key={label} className="text-center">
            <div className="text-sm font-semibold text-foreground">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
