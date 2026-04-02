import { useState } from "react";
import { Recipe } from "@/types/kitchen";
import { RecipeCard } from "./RecipeCard";
import { Filter, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

interface RecipeSectionProps {
  recipes: Recipe[];
  isFavorite: (name: string) => boolean;
  onToggleFavorite: (recipe: Recipe) => void;
  onAddToShoppingList: (items: string[]) => void;
}

const cuisines = ["All", "Indian", "Italian", "Chinese", "Healthy", "Mexican", "American", "Japanese", "Mediterranean"];

export function RecipeSection({ recipes, isFavorite, onToggleFavorite, onAddToShoppingList }: RecipeSectionProps) {
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [maxTime, setMaxTime] = useState(120);

  const filtered = recipes
    .filter(r => selectedCuisine === "All" || r.cuisine === selectedCuisine)
    .filter(r => r.cookingTime <= maxTime)
    .sort((a, b) => b.matchScore - a.matchScore);

  return (
    <div>
      <h2 className="text-2xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
        <Filter className="w-6 h-6 text-primary" />
        Recipe Suggestions
      </h2>

      <div className="kitchen-card mb-4">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {cuisines.map(c => (
            <Badge
              key={c}
              variant={selectedCuisine === c ? "default" : "outline"}
              className={`cursor-pointer transition-all ${selectedCuisine === c ? "gradient-warm text-primary-foreground border-0" : ""}`}
              onClick={() => setSelectedCuisine(c)}
            >
              {c}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-sm text-muted-foreground shrink-0">Max cooking time:</span>
          <Slider value={[maxTime]} onValueChange={([v]) => setMaxTime(v)} min={5} max={120} step={5} className="flex-1" />
          <span className="text-sm font-medium text-foreground w-16 text-right">{maxTime} min</span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="kitchen-card text-center py-8">
          <p className="text-muted-foreground">No recipes match your filters. Try adjusting them!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((recipe, i) => (
            <RecipeCard
              key={i}
              recipe={recipe}
              isFavorite={isFavorite(recipe.name)}
              onToggleFavorite={() => onToggleFavorite(recipe)}
              onAddToShoppingList={onAddToShoppingList}
            />
          ))}
        </div>
      )}
    </div>
  );
}
