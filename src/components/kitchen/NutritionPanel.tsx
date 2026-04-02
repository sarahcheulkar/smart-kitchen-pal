import { IngredientNutrition } from "@/types/kitchen";
import { BarChart3, Flame, Beef, Droplets, Wheat } from "lucide-react";

interface NutritionPanelProps {
  data: IngredientNutrition[];
}

export function NutritionPanel({ data }: NutritionPanelProps) {
  const totals = data.reduce(
    (acc, d) => ({
      calories: acc.calories + d.calories,
      protein: acc.protein + d.protein,
      fat: acc.fat + d.fat,
      carbs: acc.carbs + d.carbs,
    }),
    { calories: 0, protein: 0, fat: 0, carbs: 0 }
  );

  const maxCal = Math.max(...data.map(d => d.calories), 1);

  const stats = [
    { label: "Calories", value: totals.calories, unit: "kcal", icon: Flame, color: "text-neon-orange", bg: "bg-neon-orange/10", border: "border-neon-orange/20" },
    { label: "Protein", value: totals.protein, unit: "g", icon: Beef, color: "text-neon-green", bg: "bg-neon-green/10", border: "border-neon-green/20" },
    { label: "Fat", value: totals.fat, unit: "g", icon: Droplets, color: "text-neon-pink", bg: "bg-neon-pink/10", border: "border-neon-pink/20" },
    { label: "Carbs", value: totals.carbs, unit: "g", icon: Wheat, color: "text-neon-cyan", bg: "bg-neon-cyan/10", border: "border-neon-cyan/20" },
  ];

  return (
    <div className="glass-card animate-fade-in-up">
      <h2 className="text-lg font-display font-bold text-foreground mb-4 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg gradient-warm flex items-center justify-center">
          <BarChart3 className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
        Nutritional Analysis
      </h2>

      <div className="grid grid-cols-2 gap-3 mb-5">
        {stats.map(({ label, value, unit, icon: Icon, color, bg, border }) => (
          <div key={label} className={`p-3 rounded-xl ${bg} border ${border} text-center transition-all hover:scale-[1.02]`}>
            <Icon className={`w-5 h-5 ${color} mx-auto mb-1`} />
            <div className={`text-xl font-bold ${color}`}>{Math.round(value)}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{unit} {label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-3 animate-slide-in-left" style={{ animationDelay: `${i * 100}ms` }}>
            <span className="text-sm text-foreground w-24 truncate font-medium">{item.name}</span>
            <div className="flex-1 h-3 bg-muted/50 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full gradient-primary transition-all duration-700"
                style={{ width: `${(item.calories / maxCal) * 100}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground w-16 text-right font-mono">{item.calories} kcal</span>
          </div>
        ))}
      </div>
    </div>
  );
}
