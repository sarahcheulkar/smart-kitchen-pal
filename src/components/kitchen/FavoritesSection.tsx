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
      <h2 className="text-2xl font-display font-bold text-foreground mb-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
          <Heart className="w-5 h-5 text-primary-foreground fill-primary-foreground" />
        </div>
        <span>Favorite Recipes</span>
        <span className="text-sm font-sans font-normal bg-neon-pink/10 text-neon-pink px-3 py-1 rounded-full">
          {favorites.length} saved
        </span>
      </h2>
      <div className="grid md:grid-cols-2 gap-5">
        {favorites.map((recipe, i) => (
          <RecipeCard key={i} recipe={recipe} isFavorite={true} onToggleFavorite={() => onToggleFavorite(recipe)} onAddToShoppingList={() => {}} />
        ))}
      </div>
    </div>
  );
}
