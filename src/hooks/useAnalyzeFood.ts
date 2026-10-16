import { useState, useCallback } from "react";
import { AnalysisResult, FeedbackResult } from "@/types/kitchen";
import { useToast } from "@/hooks/use-toast";

const API_BASE = "http://localhost:8000";

export function useAnalyzeFood() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const analyze = useCallback(async (imageBase64?: string, voiceIngredients?: string) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch(`${API_BASE}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, voiceIngredients }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || `Server error: ${response.status}`);
      }

      const data: AnalysisResult = await response.json();
      setResult(data);

      const modelCount = data.pipeline?.modelsUsed || 0;
      const timeStr = data.pipeline?.totalTime_s
        ? ` in ${data.pipeline.totalTime_s}s`
        : "";

      toast({
        title: "Analysis complete!",
        description: `${modelCount} DL models processed${timeStr}. Found ${data.ingredients?.length || 0} ingredients and ${data.recipes?.length || 0} recipes.`,
      });
    } catch (err: any) {
      console.error("Analysis error:", err);
      toast({
        title: "Analysis failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [toast]);

  const sendFeedback = useCallback(async (
    recipeName: string,
    rating: number,
    cuisine: string = "",
    ingredients: string[] = [],
  ): Promise<FeedbackResult | null> => {
    try {
      const response = await fetch(`${API_BASE}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeName, rating, cuisine, ingredients }),
      });

      if (!response.ok) throw new Error("Feedback failed");
      const data: FeedbackResult = await response.json();

      toast({
        title: rating > 0 ? "👍 Thanks!" : "👎 Noted!",
        description: `Your feedback on "${recipeName}" helps our AI learn your preferences.`,
      });

      return data;
    } catch (err: any) {
      console.error("Feedback error:", err);
      return null;
    }
  }, [toast]);

  return { isAnalyzing, result, analyze, setResult, sendFeedback };
}
