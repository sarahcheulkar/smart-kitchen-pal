import { useState } from "react";
import { Calendar, AlertTriangle, CheckCircle } from "lucide-react";
import { ExpiryItem } from "@/types/kitchen";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    const now = new Date();
    return Math.ceil((expiry.getTime() - now.getTime()) / 86400000);
  };

  if (ingredients.length === 0) return null;

  return (
    <div className="kitchen-card">
      <h2 className="text-lg font-display font-bold text-foreground mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-primary" />
        Expiry Tracker
      </h2>

      <div className="flex gap-2 mb-4">
        <select
          value={selectedIngredient}
          onChange={(e) => setSelectedIngredient(e.target.value)}
          className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Select ingredient</option>
          {ingredients.map(ing => (
            <option key={ing} value={ing}>{ing}</option>
          ))}
        </select>
        <Input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} className="w-36" />
        <Button size="sm" onClick={addItem} disabled={!selectedIngredient || !purchaseDate} className="gradient-warm text-primary-foreground border-0">
          Add
        </Button>
      </div>

      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item, i) => {
            const daysLeft = getDaysLeft(item);
            const isExpired = daysLeft <= 0;
            const isExpiring = daysLeft > 0 && daysLeft <= 3;
            return (
              <div key={i} className={`flex items-center justify-between p-2.5 rounded-lg text-sm ${isExpired ? "bg-destructive/10" : isExpiring ? "bg-kitchen-amber/10" : "bg-secondary/10"}`}>
                <span className="font-medium text-foreground">{item.ingredient}</span>
                <span className={`flex items-center gap-1 ${isExpired ? "text-destructive" : isExpiring ? "text-kitchen-amber" : "text-secondary"}`}>
                  {isExpired ? <AlertTriangle className="w-3.5 h-3.5" /> : isExpiring ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  {isExpired ? "Expired" : `${daysLeft} days left`}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
