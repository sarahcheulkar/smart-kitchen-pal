import { Ingredient } from "@/types/kitchen";
import { Tag, Check } from "lucide-react";

interface IngredientsListProps {
  ingredients: Ingredient[];
}

const categoryColors: Record<string, string> = {
  vegetable: "bg-kitchen-green/10 text-kitchen-green border-kitchen-green/30",
  fruit: "bg-kitchen-amber/10 text-kitchen-brown border-kitchen-amber/30",
  protein: "bg-kitchen-red/10 text-kitchen-red border-kitchen-red/30",
  dairy: "bg-primary/10 text-primary border-primary/30",
  grain: "bg-kitchen-amber/10 text-kitchen-brown border-kitchen-amber/30",
  spice: "bg-kitchen-warm/10 text-kitchen-warm border-kitchen-warm/30",
  condiment: "bg-muted text-muted-foreground border-border",
  other: "bg-muted text-muted-foreground border-border",
};

export function IngredientsList({ ingredients }: IngredientsListProps) {
  return (
    <div className="kitchen-card">
      <h2 className="text-lg font-display font-bold text-foreground mb-4 flex items-center gap-2">
        <Tag className="w-5 h-5 text-primary" />
        Detected Ingredients
        <span className="ml-auto text-sm font-sans font-normal text-muted-foreground">{ingredients.length} found</span>
      </h2>
      <div className="flex flex-wrap gap-2">
        {ingredients.map((ing, i) => (
          <div
            key={i}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border animate-fade-in-up ${categoryColors[ing.category] || categoryColors.other}`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <Check className="w-3.5 h-3.5" />
            {ing.name}
            <span className="text-xs opacity-60">
              {Math.round(ing.confidence * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
