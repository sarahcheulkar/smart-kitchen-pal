import { useState } from "react";
import { Recipe } from "@/types/kitchen";
import { RecipeCard } from "./RecipeCard";
import { Filter, SlidersHorizontal, ChefHat } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface RecipeSectionProps {
  recipes: Recipe[];
  isFavorite: (name: string) => boolean;
  onToggleFavorite: (recipe: Recipe) => void;
  onAddToShoppingList: (items: string[]) => void;
  onFeedback?: (recipeName: string, rating: number, cuisine: string, ingredients: string[]) => Promise<any>;
}

const cuisines = ["All", "Indian", "Italian", "Chinese", "Healthy", "Mexican", "American", "Japanese", "Mediterranean"];

export function RecipeSection({ recipes, isFavorite, onToggleFavorite, onAddToShoppingList, onFeedback }: RecipeSectionProps) {
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [maxTime, setMaxTime] = useState(120);

  const filtered = recipes
    .filter(r => selectedCuisine === "All" || r.cuisine === selectedCuisine)
    .filter(r => r.cookingTime <= maxTime)
    .sort((a, b) => b.matchScore - a.matchScore);

  return (
    <div>
      <h2 className="text-2xl font-display font-bold text-foreground mb-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
          <ChefHat className="w-5 h-5 text-primary-foreground" />
        </div>
        <span>Recipe Suggestions</span>
        <span className="text-sm font-sans font-normal text-muted-foreground ml-auto">
          {filtered.length} recipes
        </span>
      </h2>

      <div className="glass-card mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-muted-foreground mr-1" />
          {cuisines.map(c => (
            <button
              key={c}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                selectedCuisine === c
                  ? "gradient-primary text-primary-foreground shadow-[0_2px_15px_hsl(var(--neon-purple)/0.4)]"
                  : "bg-muted/50 text-muted-foreground border border-border/50 hover:border-primary/30 hover:text-foreground"
              }`}
              onClick={() => setSelectedCuisine(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-sm text-muted-foreground shrink-0">Max time:</span>
          <Slider value={[maxTime]} onValueChange={([v]) => setMaxTime(v)} min={5} max={120} step={5} className="flex-1" />
          <span className="text-sm font-bold text-neon-cyan w-16 text-right">{maxTime} min</span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card text-center py-12">
          <Filter className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">No recipes match your filters</p>
          <p className="text-muted-foreground/60 text-sm mt-1">Try adjusting cuisine or cooking time</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((recipe, i) => (
            <RecipeCard
              key={i}
              recipe={recipe}
              isFavorite={isFavorite(recipe.name)}
              onToggleFavorite={() => onToggleFavorite(recipe)}
              onAddToShoppingList={onAddToShoppingList}
              onFeedback={onFeedback}
            />
          ))}
        </div>
      )}
    </div>
  );
}
