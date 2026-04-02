import { IngredientNutrition } from "@/types/kitchen";
import { BarChart3 } from "lucide-react";

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

  return (
    <div className="kitchen-card">
      <h2 className="text-lg font-display font-bold text-foreground mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-primary" />
        Nutritional Analysis
      </h2>

      <div className="grid grid-cols-4 gap-3 mb-5 p-3 rounded-lg bg-muted/50">
        {[
          { label: "Calories", value: totals.calories, unit: "kcal", color: "text-kitchen-warm" },
          { label: "Protein", value: totals.protein, unit: "g", color: "text-kitchen-green" },
          { label: "Fat", value: totals.fat, unit: "g", color: "text-kitchen-amber" },
          { label: "Carbs", value: totals.carbs, unit: "g", color: "text-primary" },
        ].map(({ label, value, unit, color }) => (
          <div key={label} className="text-center">
            <div className={`text-xl font-bold ${color}`}>{Math.round(value)}</div>
            <div className="text-xs text-muted-foreground">{unit} {label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-2.5">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-sm text-foreground w-24 truncate">{item.name}</span>
            <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full gradient-warm rounded-full transition-all duration-500"
                style={{ width: `${(item.calories / maxCal) * 100}%`, animationDelay: `${i * 100}ms` }}
              />
            </div>
            <span className="text-xs text-muted-foreground w-14 text-right">{item.calories} kcal</span>
          </div>
        ))}
      </div>
    </div>
  );
}
