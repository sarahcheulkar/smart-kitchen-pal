import { useState } from "react";
import { Recipe } from "@/types/kitchen";
import { Clock, Heart, ShoppingCart, ChefHat, AlertCircle, Flame, X, Users, Gauge, Utensils, Database, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { FeedbackButtons } from "./FeedbackButtons";

interface RecipeCardProps {
  recipe: Recipe;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onAddToShoppingList: (items: string[]) => void;
  onFeedback?: (recipeName: string, rating: number, cuisine: string, ingredients: string[]) => Promise<any>;
}

const cuisineEmoji: Record<string, string> = {
  Indian: "🇮🇳", Italian: "🇮🇹", Chinese: "🇨🇳", Healthy: "🥗",
  Mexican: "🇲🇽", American: "🇺🇸", Japanese: "🇯🇵", Mediterranean: "🫒",
};

export function RecipeCard({ recipe, isFavorite, onToggleFavorite, onAddToShoppingList, onFeedback }: RecipeCardProps) {
  const [open, setOpen] = useState(false);
  const matchPercent = Math.round(recipe.matchScore * 100);

  return (
    <>
      {/* Compact preview card */}
      <div
        onClick={() => setOpen(true)}
        className="glass-card animated-border animate-fade-in-up group cursor-pointer hover:scale-[1.02] transition-all duration-300 flex flex-col items-center text-center p-5"
      >
        {/* Recipe emoji/image placeholder */}
        <div className="w-20 h-20 rounded-2xl gradient-cosmic flex items-center justify-center mb-3 shadow-lg group-hover:shadow-[0_0_30px_hsl(var(--neon-purple)/0.4)] transition-shadow">
          <span className="text-3xl">{cuisineEmoji[recipe.cuisine] || "🍽️"}</span>
        </div>

        <h3 className="text-base font-display font-bold text-foreground group-hover:text-gradient transition-colors line-clamp-2">
          {recipe.name}
        </h3>

        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {recipe.cookingTime}m</span>
          <span className={`font-bold ${matchPercent > 80 ? "text-neon-green" : matchPercent > 50 ? "text-neon-orange" : "text-neon-pink"}`}>
            {matchPercent}% match
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          className={`mt-2 w-8 h-8 rounded-xl transition-all duration-300 ${
            isFavorite
              ? "text-neon-pink bg-neon-pink/10 shadow-[0_0_15px_hsl(var(--neon-pink)/0.3)]"
              : "text-muted-foreground hover:text-neon-pink hover:bg-neon-pink/10"
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
        </Button>
      </div>

      {/* Detailed dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-card/95 backdrop-blur-xl border-border/50">
          <DialogTitle className="sr-only">{recipe.name}</DialogTitle>

          {/* Header */}
          <div className="flex items-start gap-4 mb-5">
            <div className="w-16 h-16 rounded-2xl gradient-cosmic flex items-center justify-center shrink-0 shadow-lg">
              <span className="text-3xl">{cuisineEmoji[recipe.cuisine] || "🍽️"}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-display font-bold text-gradient">{recipe.name}</h2>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                  {cuisineEmoji[recipe.cuisine] || "🍽️"} {recipe.cuisine}
                </Badge>
                <span className="text-muted-foreground text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {recipe.cookingTime} min
                </span>
                {recipe.servings && (
                  <span className="text-muted-foreground text-xs flex items-center gap-1">
                    <Users className="w-3 h-3" /> {recipe.servings} servings
                  </span>
                )}
                {recipe.difficulty && (
                  <span className="text-muted-foreground text-xs flex items-center gap-1">
                    <Gauge className="w-3 h-3" /> {recipe.difficulty}
                  </span>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleFavorite()}
              className={`w-10 h-10 rounded-xl shrink-0 transition-all duration-300 ${
                isFavorite
                  ? "text-neon-pink bg-neon-pink/10 shadow-[0_0_15px_hsl(var(--neon-pink)/0.3)]"
                  : "text-muted-foreground hover:text-neon-pink hover:bg-neon-pink/10"
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
            </Button>
          </div>

          {/* Match score */}
          <div className="mb-5">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-muted-foreground flex items-center gap-1">
                <Flame className="w-3 h-3 text-neon-orange" /> Ingredient Match
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
          <div className="mb-4">
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
            <div className="mb-4 p-3 rounded-xl bg-destructive/5 border border-destructive/15">
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

          {/* Detailed instructions */}
          <div className="mb-4">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
              <Utensils className="w-3.5 h-3.5" /> Step-by-Step Instructions
            </p>
            {recipe.detailedSteps && recipe.detailedSteps.length > 0 ? (
              <ol className="space-y-3">
                {recipe.detailedSteps.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-foreground/90">
                    <span className="w-6 h-6 rounded-full gradient-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed">{recipe.instructions}</p>
            )}
          </div>

          {/* Tips */}
          {recipe.tips && (
            <div className="mb-4 p-3 rounded-xl bg-neon-cyan/5 border border-neon-cyan/15">
              <p className="text-xs font-semibold text-neon-cyan mb-1">💡 Pro Tips</p>
              <p className="text-sm text-foreground/80 leading-relaxed">{recipe.tips}</p>
            </div>
          )}

          {/* Source & RLHF badges */}
          <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-border/30 mb-3">
            {recipe.source && (
              <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-neon-purple/10 text-neon-purple border border-neon-purple/20">
                <Database className="w-3 h-3" /> {recipe.source}
              </span>
            )}
            {recipe.preferenceBoost !== undefined && recipe.preferenceBoost !== 0 && (
              <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${
                recipe.preferenceBoost > 0
                  ? "bg-neon-green/10 text-neon-green border-neon-green/20"
                  : "bg-neon-pink/10 text-neon-pink border-neon-pink/20"
              }`}>
                <TrendingUp className="w-3 h-3" />
                RLHF {recipe.preferenceBoost > 0 ? "+" : ""}{(recipe.preferenceBoost * 100).toFixed(0)}%
              </span>
            )}
            {recipe.ragSimilarity !== undefined && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20">
                RAG similarity: {(recipe.ragSimilarity * 100).toFixed(0)}%
              </span>
            )}
          </div>

          {/* Nutrition */}
          <div className="grid grid-cols-4 gap-2 mb-3">
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

          {/* RLHF Feedback */}
          {onFeedback && (
            <div className="flex items-center justify-between pt-3 border-t border-border/30">
              <span className="text-xs text-muted-foreground">Help our AI learn your taste</span>
              <FeedbackButtons
                recipeName={recipe.name}
                cuisine={recipe.cuisine}
                ingredients={recipe.ingredients}
                onFeedback={onFeedback}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
