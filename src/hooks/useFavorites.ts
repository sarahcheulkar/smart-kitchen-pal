import { useState, useCallback, useEffect } from "react";
import { Recipe } from "@/types/kitchen";
import { useToast } from "@/hooks/use-toast";

const FAVORITES_KEY = "kitchen-assistant-favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) setFavorites(JSON.parse(stored));
    } catch {}
  }, []);

  const saveFavorites = useCallback((items: Recipe[]) => {
    setFavorites(items);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(items));
  }, []);

  const toggleFavorite = useCallback((recipe: Recipe) => {
    setFavorites(prev => {
      const exists = prev.some(f => f.name === recipe.name);
      const next = exists ? prev.filter(f => f.name !== recipe.name) : [...prev, recipe];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      toast({ title: exists ? "Removed from favorites" : "Added to favorites!", description: recipe.name });
      return next;
    });
  }, [toast]);

  const isFavorite = useCallback((name: string) => favorites.some(f => f.name === name), [favorites]);

  return { favorites, toggleFavorite, isFavorite };
}
