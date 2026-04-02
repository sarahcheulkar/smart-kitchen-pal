import { MessageSquare } from "lucide-react";

interface CaptionDisplayProps {
  caption: string;
}

export function CaptionDisplay({ caption }: CaptionDisplayProps) {
  return (
    <div className="kitchen-card">
      <h2 className="text-lg font-display font-bold text-foreground mb-3 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-primary" />
        AI Caption
      </h2>
      <p className="text-foreground/80 leading-relaxed italic">"{caption}"</p>
    </div>
  );
}
