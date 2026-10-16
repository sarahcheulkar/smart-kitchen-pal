import { WasteImpact } from "@/types/kitchen";
import { Leaf, Car, TreePine, Smartphone, Droplets, Recycle, TrendingDown } from "lucide-react";

interface WasteTrackerPanelProps {
  impact: WasteImpact;
}

export function WasteTrackerPanel({ impact }: WasteTrackerPanelProps) {
  const score = impact.sustainability_score;
  const scoreColor = score > 70 ? "text-neon-green" : score > 40 ? "text-neon-orange" : "text-neon-pink";
  const scoreBg = score > 70 ? "from-neon-green/20 to-neon-green/5" : score > 40 ? "from-neon-orange/20 to-neon-orange/5" : "from-neon-pink/20 to-neon-pink/5";
  const scoreBorder = score > 70 ? "border-neon-green/30" : score > 40 ? "border-neon-orange/30" : "border-neon-pink/30";

  const equivalencies = [
    { icon: Car, label: "Car km avoided", value: impact.equivalencies.car_km_avoided, unit: "km", color: "text-neon-cyan" },
    { icon: TreePine, label: "Tree-days absorbed", value: impact.equivalencies.trees_daily_absorption, unit: "days", color: "text-neon-green" },
    { icon: Smartphone, label: "Phone charges", value: impact.equivalencies.smartphone_charges, unit: "", color: "text-neon-purple" },
    { icon: Droplets, label: "Water saved", value: impact.equivalencies.water_saved_liters, unit: "L", color: "text-neon-cyan" },
  ];

  return (
    <div className="glass-card animate-fade-in-up">
      <h2 className="text-lg font-display font-bold text-foreground mb-4 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-neon-green to-neon-cyan flex items-center justify-center">
          <Leaf className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
        Environmental Impact
      </h2>

      {/* Sustainability Score */}
      <div className={`p-4 rounded-xl bg-gradient-to-r ${scoreBg} border ${scoreBorder} mb-4 text-center`}>
        <div className={`text-4xl font-bold ${scoreColor} font-display`}>
          {score}
          <span className="text-lg text-muted-foreground">/100</span>
        </div>
        <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Sustainability Score</div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-neon-green/5 border border-neon-green/15 text-center">
          <TrendingDown className="w-5 h-5 text-neon-green mx-auto mb-1" />
          <div className="text-xl font-bold text-neon-green">{impact.co2_saved_kg}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">kg CO₂ saved</div>
        </div>
        <div className="p-3 rounded-xl bg-neon-cyan/5 border border-neon-cyan/15 text-center">
          <Recycle className="w-5 h-5 text-neon-cyan mx-auto mb-1" />
          <div className="text-xl font-bold text-neon-cyan">{impact.waste_prevented_kg}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">kg waste prevented</div>
        </div>
      </div>

      {/* Equivalencies */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {equivalencies.map(({ icon: Icon, label, value, unit, color }) => (
          <div key={label} className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 border border-border/20">
            <Icon className={`w-4 h-4 ${color} shrink-0`} />
            <div className="min-w-0">
              <div className={`text-sm font-bold ${color}`}>{value} {unit}</div>
              <div className="text-[9px] text-muted-foreground truncate">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Per-ingredient breakdown */}
      {impact.per_ingredient.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">
            Per-Ingredient CO₂ Impact
          </p>
          <div className="space-y-1.5">
            {impact.per_ingredient.slice(0, 6).map((ing, i) => {
              const maxCo2 = Math.max(...impact.per_ingredient.map(x => x.co2_saved_kg), 0.01);
              return (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="w-20 truncate text-foreground font-medium">{ing.name}</span>
                  <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-neon-green to-neon-cyan transition-all duration-700"
                      style={{ width: `${(ing.co2_saved_kg / maxCo2) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground font-mono w-16 text-right">
                    {ing.co2_saved_kg} kg
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
