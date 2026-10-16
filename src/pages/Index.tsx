import { useState, useCallback } from "react";
import { Header } from "@/components/kitchen/Header";
import { FloatingParticles } from "@/components/kitchen/FloatingParticles";
import { ImageUpload } from "@/components/kitchen/ImageUpload";
import { VoiceInput } from "@/components/kitchen/VoiceInput";
import { CaptionDisplay } from "@/components/kitchen/CaptionDisplay";
import { IngredientsList } from "@/components/kitchen/IngredientsList";
import { RecipeSection } from "@/components/kitchen/RecipeSection";
import { NutritionPanel } from "@/components/kitchen/NutritionPanel";
import { ShoppingList } from "@/components/kitchen/ShoppingList";
import { FavoritesSection } from "@/components/kitchen/FavoritesSection";
import { AnalysisSkeleton } from "@/components/kitchen/AnalysisSkeleton";

// ── New Deep Learning Components ──
import { PipelineStatus } from "@/components/kitchen/PipelineStatus";
import { VisionOutputPanel } from "@/components/kitchen/VisionOutputPanel";
import { WasteTrackerPanel } from "@/components/kitchen/WasteTrackerPanel";
import { DetectionOverlay } from "@/components/kitchen/DetectionOverlay";

import { useAnalyzeFood } from "@/hooks/useAnalyzeFood";
import { useFavorites } from "@/hooks/useFavorites";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { Sparkles, ChefHat, Utensils, Salad } from "lucide-react";

const Index = () => {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [shoppingList, setShoppingList] = useState<string[]>([]);

  const { isAnalyzing, result, analyze, sendFeedback } = useAnalyzeFood();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { isListening, transcript, setTranscript, startListening, stopListening } = useVoiceInput();

  const handleImageSelected = useCallback((base64: string, preview: string) => {
    setImageBase64(base64);
    setPreviewUrl(preview);
  }, []);

  const handleAnalyze = useCallback(() => {
    analyze(imageBase64 || undefined, transcript || undefined);
  }, [analyze, imageBase64, transcript]);

  const handleVoiceSubmit = useCallback(() => {
    analyze(imageBase64 || undefined, transcript);
  }, [analyze, imageBase64, transcript]);

  const addToShoppingList = useCallback((items: string[]) => {
    setShoppingList(prev => [...new Set([...prev, ...items])]);
  }, []);

  const removeFromShoppingList = useCallback((item: string) => {
    setShoppingList(prev => prev.filter(i => i !== item));
  }, []);

  return (
    <div className="min-h-screen bg-background relative">
      <FloatingParticles count={15} />
      <Header />

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-8 space-y-8">
        
        {/* Input Section */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-5">
            <ImageUpload
              onImageSelected={handleImageSelected}
              isAnalyzing={isAnalyzing}
              previewUrl={previewUrl}
            />
            {(imageBase64 || transcript) && !isAnalyzing && (
              <button onClick={handleAnalyze} className="btn-glow w-full h-14 text-base font-bold flex items-center justify-center gap-2 rounded-2xl">
                <Sparkles className="w-5 h-5" />
                Analyze & Get Recipes
              </button>
            )}
          </div>

          <div className="space-y-5">
            <VoiceInput
              isListening={isListening}
              transcript={transcript}
              onTranscriptChange={setTranscript}
              onStart={startListening}
              onStop={stopListening}
              onSubmit={handleVoiceSubmit}
              disabled={isAnalyzing}
            />
            <ShoppingList
              items={shoppingList}
              onRemove={removeFromShoppingList}
              onClear={() => setShoppingList([])}
            />
          </div>
        </div>

        {/* Loading */}
        {isAnalyzing && <AnalysisSkeleton />}

        {/* ════════════════════════════════════════════ */}
        {/* RESULTS — Deep Learning Pipeline Output     */}
        {/* ════════════════════════════════════════════ */}
        {result && !isAnalyzing && (
          <div className="space-y-8">

            {/* ── Pipeline Telemetry ── */}
            {result.pipeline && (
              <PipelineStatus pipeline={result.pipeline} />
            )}

            {/* ── Image with Florence-2 Bounding Boxes + Caption ── */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                {previewUrl && result.ingredients ? (
                  <DetectionOverlay
                    previewUrl={previewUrl}
                    ingredients={result.ingredients}
                  />
                ) : (
                  <CaptionDisplay caption={result.caption} />
                )}
                {previewUrl && <CaptionDisplay caption={result.caption} />}
              </div>
              <IngredientsList ingredients={result.ingredients} />
            </div>

            {/* ── Florence-2 Model Outputs ── */}
            {result.vision && (result.vision.blip || result.vision.yolo) && (
              <VisionOutputPanel
                blip={result.vision.blip}
                yolo={result.vision.yolo}
              />
            )}

            {/* ── Nutrition (USDA-backed) ── */}
            <NutritionPanel data={result.nutritionPerIngredient} />

            {/* ── Recipes (RAG-retrieved, RLHF-ranked) ── */}
            <RecipeSection
              recipes={result.recipes}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
              onAddToShoppingList={addToShoppingList}
              onFeedback={sendFeedback}
            />

            {/* ── Environmental Impact (Waste Tracker) ── */}
            {result.wasteImpact && (
              <WasteTrackerPanel impact={result.wasteImpact} />
            )}
          </div>
        )}

        {/* Favorites */}
        <FavoritesSection favorites={favorites} onToggleFavorite={toggleFavorite} />

        {/* Empty state */}
        {!result && !isAnalyzing && (
          <div className="text-center py-20 animate-fade-in-up">
            <div className="relative inline-block mb-6">
              <div className="w-24 h-24 rounded-3xl gradient-cosmic flex items-center justify-center shadow-[0_0_40px_hsl(var(--neon-purple)/0.3)]">
                <ChefHat className="w-12 h-12 text-primary-foreground" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-xl bg-neon-cyan/20 backdrop-blur-sm flex items-center justify-center border border-neon-cyan/30 animate-bounce">
                <Utensils className="w-4 h-4 text-neon-cyan" />
              </div>
              <div className="absolute -bottom-1 -left-3 w-7 h-7 rounded-lg bg-neon-pink/20 backdrop-blur-sm flex items-center justify-center border border-neon-pink/30 animate-pulse">
                <Salad className="w-3.5 h-3.5 text-neon-pink" />
              </div>
            </div>

            <h2 className="text-3xl font-display font-bold mb-3">
              <span className="text-gradient">Ready to Cook Something Amazing?</span>
            </h2>

            <p className="text-muted-foreground max-w-lg mx-auto text-base leading-relaxed mb-6">
              Upload a photo of your ingredients or speak what you have — our deep learning pipeline will detect ingredients, suggest recipes, and provide real nutritional insights.
            </p>

            {/* DL Pipeline info */}
            <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
              {[
                { label: "Florence-2", desc: "Vision & Detection" },
                { label: "Whisper", desc: "Audio" },
                { label: "BGE RAG", desc: "Recipes" },
                { label: "USDA", desc: "Nutrition" },
                { label: "RLHF", desc: "Learning" },
                { label: "FLUX", desc: "Image Gen" },
              ].map(({ label, desc }) => (
                <span key={label} className="px-3 py-1.5 rounded-full bg-muted/30 border border-border/30 text-xs">
                  <span className="font-bold text-foreground">{label}</span>
                  <span className="text-muted-foreground ml-1">{desc}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;