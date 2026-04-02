import { Heart } from "lucide-react";
import { Recipe } from "@/types/kitchen";
import { RecipeCard } from "./RecipeCard";

interface FavoritesSectionProps {
  favorites: Recipe[];
  onToggleFavorite: (recipe: Recipe) => void;
}

export function FavoritesSection({ favorites, onToggleFavorite }: FavoritesSectionProps) {
  if (favorites.length === 0) return null;

  return (
    <div>
      <h2 className="text-2xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
        <Heart className="w-6 h-6 text-kitchen-red fill-kitchen-red" />
        Favorite Recipes
      </h2>
      <div className="grid md:grid-cols-2 gap-4">
        {favorites.map((recipe, i) => (
          <RecipeCard
            key={i}
            recipe={recipe}
            isFavorite={true}
            onToggleFavorite={() => onToggleFavorite(recipe)}
            onAddToShoppingList={() => {}}
          />
        ))}
      </div>
    </div>
  );
}
