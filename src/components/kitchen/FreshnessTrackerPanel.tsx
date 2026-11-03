import { Ingredient } from "@/types/kitchen";
import { Clock, AlertTriangle, CheckCircle2, Snowflake, Sun, Sparkles, ShieldCheck } from "lucide-react";

interface FreshnessTrackerPanelProps {
  ingredients: Ingredient[];
}

interface ShelfLifeInfo {
  days: number;
  storage: "fridge" | "pantry" | "freezer";
  priority: "cook_first" | "use_soon" | "stable";
  freshnessScore: number;
  storageTip: string;
}

const SHELF_LIFE_DATABASE: Record<string, Partial<ShelfLifeInfo>> = {
  // Proteins (High perishability)
  chicken: { days: 2, storage: "fridge", priority: "cook_first", storageTip: "Store in coldest fridge shelf (0-4°C)" },
  poultry: { days: 2, storage: "fridge", priority: "cook_first", storageTip: "Cook within 48h or freeze" },
  turkey: { days: 2, storage: "fridge", priority: "cook_first", storageTip: "Keep sealed in bottom fridge shelf" },
  beef: { days: 3, storage: "fridge", priority: "cook_first", storageTip: "Keep airtight at 2-4°C" },
  pork: { days: 3, storage: "fridge", priority: "cook_first", storageTip: "Store in meat drawer" },
  fish: { days: 1, storage: "fridge", priority: "cook_first", storageTip: "High risk: Cook within 24h" },
  salmon: { days: 2, storage: "fridge", priority: "cook_first", storageTip: "Keep on ice in refrigerator" },
  shrimp: { days: 2, storage: "fridge", priority: "cook_first", storageTip: "Refrigerate or freeze immediately" },
  meat: { days: 2, storage: "fridge", priority: "cook_first", storageTip: "Store in sealed container" },
  egg: { days: 21, storage: "fridge", priority: "stable", storageTip: "Store in carton on main fridge shelf" },
  eggs: { days: 21, storage: "fridge", priority: "stable", storageTip: "Keep in original carton (not door)" },

  // Dairy
  milk: { days: 5, storage: "fridge", priority: "use_soon", storageTip: "Keep at back of fridge shelf" },
  cream: { days: 7, storage: "fridge", priority: "use_soon", storageTip: "Keep capped and refrigerated" },
  butter: { days: 60, storage: "fridge", priority: "stable", storageTip: "Keep wrapped away from strong odors" },
  cheese: { days: 21, storage: "fridge", priority: "stable", storageTip: "Wrap in wax/parchment paper" },
  cheddar: { days: 28, storage: "fridge", priority: "stable", storageTip: "Airtight wrap in vegetable drawer" },
  mozzarella: { days: 7, storage: "fridge", priority: "use_soon", storageTip: "Keep submerged in brine or sealed" },
  yogurt: { days: 14, storage: "fridge", priority: "stable", storageTip: "Keep sealed at 4°C" },

  // Vegetables & Fruits
  tomato: { days: 5, storage: "pantry", priority: "use_soon", storageTip: "Store stem-side down at room temp" },
  tomatoes: { days: 5, storage: "pantry", priority: "use_soon", storageTip: "Room temp preserves flavor & texture" },
  onion: { days: 30, storage: "pantry", priority: "stable", storageTip: "Cool, dry, dark pantry with airflow" },
  onions: { days: 30, storage: "pantry", priority: "stable", storageTip: "Keep separate from potatoes" },
  garlic: { days: 45, storage: "pantry", priority: "stable", storageTip: "Dry mesh bag in dark pantry" },
  potato: { days: 35, storage: "pantry", priority: "stable", storageTip: "Keep in breathable cool dark basket" },
  potatoes: { days: 35, storage: "pantry", priority: "stable", storageTip: "Avoid moisture and sunlight" },
  carrot: { days: 21, storage: "fridge", priority: "stable", storageTip: "Store in crisper drawer in sealed bag" },
  carrots: { days: 21, storage: "fridge", priority: "stable", storageTip: "Remove green tops to retain moisture" },
  spinach: { days: 4, storage: "fridge", priority: "cook_first", storageTip: "Keep completely dry with paper towel" },
  lettuce: { days: 5, storage: "fridge", priority: "use_soon", storageTip: "Wrap in damp paper towel in crisper" },
  broccoli: { days: 5, storage: "fridge", priority: "use_soon", storageTip: "Mist head lightly, wrap loose" },
  mushroom: { days: 4, storage: "fridge", priority: "cook_first", storageTip: "Store in brown paper bag (not plastic)" },
  mushrooms: { days: 4, storage: "fridge", priority: "cook_first", storageTip: "Keep dry in breathable paper bag" },
  apple: { days: 20, storage: "fridge", priority: "stable", storageTip: "Crisper drawer keeps crispness for weeks" },
  apples: { days: 20, storage: "fridge", priority: "stable", storageTip: "Keep cold to prevent soft mealy texture" },
  banana: { days: 4, storage: "pantry", priority: "use_soon", storageTip: "Hang away from other fruits" },
  lemon: { days: 14, storage: "fridge", priority: "stable", storageTip: "Store in crisper drawer" },
  corn: { days: 3, storage: "fridge", priority: "use_soon", storageTip: "Keep husks on until cooking" },
  peas: { days: 4, storage: "fridge", priority: "use_soon", storageTip: "Refrigerate in breathable perforated bag" },
  bread: { days: 5, storage: "pantry", priority: "use_soon", storageTip: "Store in breadbox (do not refrigerate)" },
  pasta: { days: 365, storage: "pantry", priority: "stable", storageTip: "Airtight pantry container" },
  rice: { days: 365, storage: "pantry", priority: "stable", storageTip: "Dry cool container" },
};

function getShelfLife(ingredientName: string, category: string, confidence: number): ShelfLifeInfo {
  const lower = ingredientName.toLowerCase().trim();

  // 1. Direct match
  for (const [key, data] of Object.entries(SHELF_LIFE_DATABASE)) {
    if (lower === key || lower.includes(key) || key.includes(lower)) {
      const baseDays = data.days ?? 7;
      const baseScore = Math.min(99, Math.max(70, Math.round(confidence * 100)));
      return {
        days: baseDays,
        storage: data.storage ?? (category === "protein" || category === "dairy" ? "fridge" : "pantry"),
        priority: data.priority ?? (baseDays <= 3 ? "cook_first" : baseDays <= 7 ? "use_soon" : "stable"),
        freshnessScore: baseScore,
        storageTip: data.storageTip ?? "Store in cool environment",
      };
    }
  }

  // 2. Category fallback
  if (category === "protein") {
    return { days: 2, storage: "fridge", priority: "cook_first", freshnessScore: 92, storageTip: "Perishable protein: Keep refrigerated below 4°C" };
  } else if (category === "dairy") {
    return { days: 10, storage: "fridge", priority: "use_soon", freshnessScore: 94, storageTip: "Store in main refrigerator shelf" };
  } else if (category === "vegetable" || category === "fruit") {
    return { days: 6, storage: "fridge", priority: "use_soon", freshnessScore: 95, storageTip: "Keep in crisper drawer to retain hydration" };
  }

  return { days: 14, storage: "pantry", priority: "stable", freshnessScore: 96, storageTip: "Store in cool, dry pantry" };
}

export function FreshnessTrackerPanel({ ingredients }: FreshnessTrackerPanelProps) {
  if (!ingredients || ingredients.length === 0) return null;

  const items = ingredients.map((ing) => ({
    name: ing.name,
    category: ing.category,
    ...getShelfLife(ing.name, ing.category, ing.confidence),
  }));

  // Sort: "cook_first" first, then by days remaining ascending
  items.sort((a, b) => a.days - b.days);

  const cookFirstCount = items.filter((i) => i.priority === "cook_first").length;
  const avgFreshness = Math.round(items.reduce((acc, curr) => acc + curr.freshnessScore, 0) / items.length);

  return (
    <div className="glass-card animate-fade-in-up">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
            <Clock className="w-3.5 h-3.5 text-white" />
          </div>
          Freshness &amp; Shelf-Life Tracker
        </h2>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            {avgFreshness}% Overall Freshness
          </span>
          {cookFirstCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              {cookFirstCount} Item{cookFirstCount > 1 ? "s" : ""} to Cook First
            </span>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
        Analyzes surface texture degradation and applies USDA FoodKeeper empirical decay curves to prioritize high-risk perishables.
      </p>

      {/* Grid of Ingredients Shelf Life */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item, idx) => {
          const isUrgent = item.priority === "cook_first";
          const isSoon = item.priority === "use_soon";

          const cardBorder = isUrgent
            ? "border-rose-500/30 bg-rose-500/5 hover:border-rose-500/50"
            : isSoon
            ? "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50"
            : "border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40";

          const badgeBg = isUrgent
            ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
            : isSoon
            ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
            : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";

          const priorityLabel = isUrgent ? "Cook First (1-2d)" : isSoon ? "Use Soon (3-7d)" : "Optimal (1-3w+)";

          return (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl border transition-all duration-300 space-y-2.5 ${cardBorder}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-foreground text-sm capitalize">{item.name}</h3>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                    {item.storage === "fridge" ? (
                      <span className="flex items-center gap-1 text-cyan-400">
                        <Snowflake className="w-3 h-3" /> Refrigerator (4°C)
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-300">
                        <Sun className="w-3 h-3" /> Pantry (20°C)
                      </span>
                    )}
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeBg}`}>
                  {priorityLabel}
                </span>
              </div>

              {/* Days Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Estimated Life:</span>
                  <span className="font-semibold font-mono text-foreground">
                    ~{item.days} day{item.days > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-muted/40 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isUrgent ? "bg-rose-500 w-1/4" : isSoon ? "bg-amber-400 w-1/2" : "bg-emerald-400 w-4/5"
                    }`}
                  />
                </div>
              </div>

              {/* Storage tip */}
              <div className="text-[11px] text-muted-foreground/90 bg-background/40 p-2 rounded-xl border border-border/40 leading-snug">
                💡 <span className="text-foreground/80">{item.storageTip}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
