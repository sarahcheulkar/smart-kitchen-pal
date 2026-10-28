import { Ingredient, BoundingBox } from "@/types/kitchen";

interface DetectionOverlayProps {
  previewUrl: string;
  ingredients: Ingredient[];
}

const CATEGORY_COLORS: Record<string, string> = {
  vegetable: "#22c55e",
  fruit: "#f59e0b",
  protein: "#ef4444",
  dairy: "#3b82f6",
  grain: "#a78bfa",
  spice: "#f97316",
  condiment: "#06b6d4",
  other: "#94a3b8",
};

export function DetectionOverlay({ previewUrl, ingredients }: DetectionOverlayProps) {
  const bboxIngredients = ingredients.filter(ing => ing.bbox);

  return (
    <div className="relative rounded-xl overflow-hidden group">
      <img
        src={previewUrl}
        alt="Analyzed food"
        className="w-full h-72 object-cover rounded-xl"
      />

      {/* Bounding box overlays */}
      {bboxIngredients.map((ing, i) => {
        const bbox = ing.bbox!;
        const color = CATEGORY_COLORS[ing.category] || CATEGORY_COLORS.other;

        return (
          <div
            key={i}
            className="absolute pointer-events-none animate-fade-in"
            style={{
              left: `${bbox.x1 * 100}%`,
              top: `${bbox.y1 * 100}%`,
              width: `${(bbox.x2 - bbox.x1) * 100}%`,
              height: `${(bbox.y2 - bbox.y1) * 100}%`,
              border: `2px solid ${color}`,
              borderRadius: "6px",
              boxShadow: `0 0 8px ${color}40`,
              animationDelay: `${i * 150}ms`,
            }}
          >
            {/* Label tag */}
            <div
              className="absolute -top-5 left-0 px-1.5 py-0.5 rounded text-[10px] font-bold text-white whitespace-nowrap"
              style={{ backgroundColor: color }}
            >
              {ing.name} {Math.round(ing.confidence * 100)}%
            </div>
          </div>
        );
      })}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent rounded-xl pointer-events-none" />

      {/* Detection count badge */}
      {bboxIngredients.length > 0 && (
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card/80 backdrop-blur-md border border-border/50 text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
          <span className="text-foreground font-medium">
            {bboxIngredients.length} objects localized by Hybrid Vision Ensemble
          </span>
        </div>
      )}

      {/* Source badges */}
      <div className="absolute top-3 left-3 flex gap-1">
        {ingredients.some(i => i.source?.includes("Caption") || i.source?.includes("Transformer")) && (
          <span className="px-2 py-0.5 rounded-full bg-neon-purple/20 backdrop-blur-md text-neon-purple text-[10px] font-bold border border-neon-purple/30">
            Vision Transformer (ViT)
          </span>
        )}
        {ingredients.some(i => i.source?.includes("Detection") || i.source?.includes("Ensemble")) && (
          <span className="px-2 py-0.5 rounded-full bg-neon-orange/20 backdrop-blur-md text-neon-orange text-[10px] font-bold border border-neon-orange/30">
            CNN Spatial Backbone
          </span>
        )}
      </div>
    </div>
  );
}
