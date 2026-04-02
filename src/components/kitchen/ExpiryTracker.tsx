import { useState } from "react";
import { Calendar, AlertTriangle, CheckCircle, Plus } from "lucide-react";
import { ExpiryItem } from "@/types/kitchen";
import { Input } from "@/components/ui/input";

const EXPIRY_ESTIMATES: Record<string, number> = {
  milk: 7, bread: 5, eggs: 21, chicken: 3, cheese: 14, tomato: 7, lettuce: 5,
  apple: 14, banana: 5, yogurt: 10, butter: 30, rice: 365, pasta: 365,
};

interface ExpiryTrackerProps {
  ingredients: string[];
}

export function ExpiryTracker({ ingredients }: ExpiryTrackerProps) {
  const [items, setItems] = useState<ExpiryItem[]>([]);
  const [selectedIngredient, setSelectedIngredient] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");

  const addItem = () => {
    if (!selectedIngredient || !purchaseDate) return;
    const estimatedDays = EXPIRY_ESTIMATES[selectedIngredient.toLowerCase()] || 7;
    setItems(prev => [...prev, { ingredient: selectedIngredient, purchaseDate, estimatedDays }]);
    setSelectedIngredient("");
    setPurchaseDate("");
  };

  const getDaysLeft = (item: ExpiryItem) => {
    const purchase = new Date(item.purchaseDate);
    const expiry = new Date(purchase.getTime() + item.estimatedDays * 86400000);
    return Math.ceil((expiry.getTime() - Date.now()) / 86400000);
  };

  if (ingredients.length === 0) return null;

  return (
    <div className="glass-card animate-fade-in-up">
      <h2 className="text-lg font-display font-bold text-foreground mb-4 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-neon-orange/15 flex items-center justify-center">
          <Calendar className="w-3.5 h-3.5 text-neon-orange" />
        </div>
        Expiry Tracker
      </h2>

      <div className="flex gap-2 mb-4">
        <select
          value={selectedIngredient}
          onChange={(e) => setSelectedIngredient(e.target.value)}
          className="flex-1 h-10 rounded-xl border border-border/50 bg-muted/30 px-3 text-sm text-foreground focus:border-primary/50 focus:outline-none"
        >
          <option value="">Select ingredient</option>
          {ingredients.map(ing => (
            <option key={ing} value={ing}>{ing}</option>
          ))}
        </select>
        <Input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} className="w-36 rounded-xl bg-muted/30 border-border/50" />
        <button onClick={addItem} disabled={!selectedIngredient || !purchaseDate} className="btn-glow w-10 h-10 flex items-center justify-center rounded-xl disabled:opacity-40">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item, i) => {
            const daysLeft = getDaysLeft(item);
            const isExpired = daysLeft <= 0;
            const isExpiring = daysLeft > 0 && daysLeft <= 3;
            return (
              <div key={i} className={`flex items-center justify-between p-3 rounded-xl text-sm border transition-all ${
                isExpired ? "bg-destructive/10 border-destructive/20" : isExpiring ? "bg-neon-orange/10 border-neon-orange/20" : "bg-neon-green/5 border-neon-green/20"
              }`}>
                <span className="font-medium text-foreground">{item.ingredient}</span>
                <span className={`flex items-center gap-1.5 font-semibold ${isExpired ? "text-destructive" : isExpiring ? "text-neon-orange" : "text-neon-green"}`}>
                  {isExpired ? <AlertTriangle className="w-3.5 h-3.5" /> : isExpiring ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  {isExpired ? "Expired" : `${daysLeft}d left`}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
