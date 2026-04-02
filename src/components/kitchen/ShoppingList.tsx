import { ShoppingCart, X, Copy } from "lucide-react";
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
    <div className="kitchen-card border-kitchen-amber/30">
      <h2 className="text-lg font-display font-bold text-foreground mb-3 flex items-center gap-2">
        <ShoppingCart className="w-5 h-5 text-kitchen-amber" />
        Shopping List
        <span className="ml-auto text-sm font-sans font-normal text-muted-foreground">{items.length} items</span>
      </h2>
      <div className="space-y-1.5 mb-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-muted/50 text-sm">
            <span className="text-foreground">• {item}</span>
            <button onClick={() => onRemove(item)} className="text-muted-foreground hover:text-destructive transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={copyToClipboard} className="text-xs">
          <Copy className="w-3 h-3 mr-1" /> Copy
        </Button>
        <Button variant="ghost" size="sm" onClick={onClear} className="text-xs text-destructive">
          Clear All
        </Button>
      </div>
    </div>
  );
}
