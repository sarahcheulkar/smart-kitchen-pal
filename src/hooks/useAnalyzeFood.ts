import { useState, useCallback } from "react";
import { AnalysisResult } from "@/types/kitchen";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useAnalyzeFood() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const analyze = useCallback(async (imageBase64?: string, voiceIngredients?: string) => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-food", {
        body: { imageBase64, voiceIngredients },
      });

      if (error) {
        throw new Error(error.message || "Analysis failed");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setResult(data as AnalysisResult);
      toast({ title: "Analysis complete!", description: `Found ${data.ingredients?.length || 0} ingredients and ${data.recipes?.length || 0} recipes.` });
    } catch (err: any) {
      console.error("Analysis error:", err);
      toast({ title: "Analysis failed", description: err.message, variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  }, [toast]);

  return { isAnalyzing, result, analyze, setResult };
}
