import { MessageSquare, Quote } from "lucide-react";

interface CaptionDisplayProps {
  caption: string;
}

export function CaptionDisplay({ caption }: CaptionDisplayProps) {
  return (
    <div className="glass-card animate-fade-in-up">
      <h2 className="text-lg font-display font-bold text-foreground mb-3 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg gradient-warm flex items-center justify-center">
          <MessageSquare className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
        AI Caption
      </h2>
      <div className="relative p-4 rounded-xl bg-muted/30 border border-border/30">
        <Quote className="w-5 h-5 text-primary/30 absolute top-3 left-3" />
        <p className="text-foreground/90 leading-relaxed italic pl-6">{caption}</p>
      </div>
    </div>
  );
}
