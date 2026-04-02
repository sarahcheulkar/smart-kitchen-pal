import { ShoppingCart, X, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ShoppingListProps {
  items: string[];
  onRemove: (item: string) => void;
  onClear: () => void;
}

export function ShoppingList({ items, onRemove, onClear }: ShoppingListProps) {
  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(items.join("\n"));
    toast({ title: "Copied!", description: "Shopping list copied to clipboard" });
  };

  if (items.length === 0) return null;

  return (
    <div className="glass-card border-neon-cyan/20 animate-fade-in-up">
      <h2 className="text-lg font-display font-bold text-foreground mb-3 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg gradient-secondary flex items-center justify-center">
          <ShoppingCart className="w-3.5 h-3.5 text-secondary-foreground" />
        </div>
        Shopping List
        <span className="ml-auto text-sm font-sans font-normal bg-neon-cyan/10 text-neon-cyan px-2.5 py-0.5 rounded-full">
          {items.length}
        </span>
      </h2>
      <div className="space-y-1.5 mb-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 border border-border/20 text-sm group hover:border-neon-cyan/20 transition-all">
            <span className="text-foreground flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan" />
              {item}
            </span>
            <button onClick={() => onRemove(item)} className="text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-all">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={copyToClipboard} className="text-xs border-primary/20 text-primary hover:bg-primary/10">
          <Copy className="w-3 h-3 mr-1" /> Copy
        </Button>
        <Button variant="ghost" size="sm" onClick={onClear} className="text-xs text-destructive hover:bg-destructive/10">
          <Trash2 className="w-3 h-3 mr-1" /> Clear
        </Button>
      </div>
    </div>
  );
}
