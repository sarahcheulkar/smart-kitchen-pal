import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface FeedbackButtonsProps {
  recipeName: string;
  cuisine: string;
  ingredients: string[];
  onFeedback: (recipeName: string, rating: number, cuisine: string, ingredients: string[]) => Promise<any>;
}

export function FeedbackButtons({ recipeName, cuisine, ingredients, onFeedback }: FeedbackButtonsProps) {
  const [submitted, setSubmitted] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeedback = async (rating: number) => {
    if (submitted !== null || isSubmitting) return;
    setIsSubmitting(true);
    await onFeedback(recipeName, rating, cuisine, ingredients);
    setSubmitted(rating);
    setIsSubmitting(false);
  };

  if (submitted !== null) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className={`flex items-center gap-1 px-2 py-1 rounded-full ${
          submitted > 0
            ? "bg-neon-green/10 text-neon-green border border-neon-green/20"
            : "bg-neon-pink/10 text-neon-pink border border-neon-pink/20"
        }`}>
          {submitted > 0 ? <ThumbsUp className="w-3 h-3" /> : <ThumbsDown className="w-3 h-3" />}
          {submitted > 0 ? "Liked!" : "Noted"}
        </span>
        <span className="text-muted-foreground text-[10px]">RLHF recorded</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] text-muted-foreground mr-1">Rate:</span>
      <Button
        variant="ghost"
        size="icon"
        className="w-7 h-7 rounded-lg text-muted-foreground hover:text-neon-green hover:bg-neon-green/10 transition-all"
        onClick={(e) => { e.stopPropagation(); handleFeedback(1); }}
        disabled={isSubmitting}
      >
        <ThumbsUp className="w-3.5 h-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="w-7 h-7 rounded-lg text-muted-foreground hover:text-neon-pink hover:bg-neon-pink/10 transition-all"
        onClick={(e) => { e.stopPropagation(); handleFeedback(-1); }}
        disabled={isSubmitting}
      >
        <ThumbsDown className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}
