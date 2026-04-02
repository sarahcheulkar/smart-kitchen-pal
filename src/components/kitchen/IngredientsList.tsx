import { Ingredient } from "@/types/kitchen";
import { Tag, Check, Sparkles } from "lucide-react";

interface IngredientsListProps {
  ingredients: Ingredient[];
}

const categoryConfig: Record<string, { gradient: string; text: string }> = {
  vegetable: { gradient: "from-neon-green/20 to-neon-cyan/10", text: "text-neon-green" },
  fruit: { gradient: "from-neon-orange/20 to-neon-pink/10", text: "text-neon-orange" },
  protein: { gradient: "from-neon-pink/20 to-neon-purple/10", text: "text-neon-pink" },
  dairy: { gradient: "from-neon-cyan/20 to-neon-purple/10", text: "text-neon-cyan" },
  grain: { gradient: "from-neon-orange/15 to-neon-orange/5", text: "text-neon-orange" },
  spice: { gradient: "from-neon-pink/20 to-neon-orange/10", text: "text-neon-pink" },
  condiment: { gradient: "from-muted to-muted/50", text: "text-muted-foreground" },
  other: { gradient: "from-muted to-muted/50", text: "text-muted-foreground" },
};

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
      <div className="flex flex-wrap gap-2">
        {ingredients.map((ing, i) => {
          const config = categoryConfig[ing.category] || categoryConfig.other;
          return (
            <div
              key={i}
              className={`chip-ingredient bg-gradient-to-r ${config.gradient} animate-bounce-in`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <Check className={`w-3.5 h-3.5 ${config.text}`} />
              <span className="text-foreground">{ing.name}</span>
              <span className={`text-xs ${config.text} font-semibold`}>
                {Math.round(ing.confidence * 100)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
