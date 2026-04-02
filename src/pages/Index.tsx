import { useState, useCallback } from "react";
import { Header } from "@/components/kitchen/Header";
import { ImageUpload } from "@/components/kitchen/ImageUpload";
import { VoiceInput } from "@/components/kitchen/VoiceInput";
import { CaptionDisplay } from "@/components/kitchen/CaptionDisplay";
import { IngredientsList } from "@/components/kitchen/IngredientsList";
import { RecipeSection } from "@/components/kitchen/RecipeSection";
import { NutritionPanel } from "@/components/kitchen/NutritionPanel";
import { ShoppingList } from "@/components/kitchen/ShoppingList";
import { FavoritesSection } from "@/components/kitchen/FavoritesSection";
import { ExpiryTracker } from "@/components/kitchen/ExpiryTracker";
import { AnalysisSkeleton } from "@/components/kitchen/AnalysisSkeleton";
import { useAnalyzeFood } from "@/hooks/useAnalyzeFood";
import { useFavorites } from "@/hooks/useFavorites";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

const Index = () => {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [shoppingList, setShoppingList] = useState<string[]>([]);

  const { isAnalyzing, result, analyze } = useAnalyzeFood();
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
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Input Section */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <ImageUpload
              onImageSelected={handleImageSelected}
              isAnalyzing={isAnalyzing}
              previewUrl={previewUrl}
            />
            {(imageBase64 || transcript) && !isAnalyzing && (
              <Button onClick={handleAnalyze} className="w-full gradient-warm text-primary-foreground border-0 h-12 text-base font-semibold" size="lg">
                <Sparkles className="w-5 h-5 mr-2" />
                Analyze & Get Recipes
              </Button>
            )}
          </div>
          <div className="space-y-4">
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

        {/* Loading State */}
        {isAnalyzing && <AnalysisSkeleton />}

        {/* Results */}
        {result && !isAnalyzing && (
          <div className="space-y-8 animate-fade-in-up">
            {/* Caption & Ingredients */}
            <div className="grid lg:grid-cols-2 gap-6">
              <CaptionDisplay caption={result.caption} />
              <IngredientsList ingredients={result.ingredients} />
            </div>

            {/* Nutrition & Expiry */}
            <div className="grid lg:grid-cols-2 gap-6">
              <NutritionPanel data={result.nutritionPerIngredient} />
              <ExpiryTracker ingredients={result.ingredients.map(i => i.name)} />
            </div>

            {/* Recipes */}
            <RecipeSection
              recipes={result.recipes}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
              onAddToShoppingList={addToShoppingList}
            />
          </div>
        )}

        {/* Favorites */}
        <FavoritesSection favorites={favorites} onToggleFavorite={toggleFavorite} />

        {/* Empty State */}
        {!result && !isAnalyzing && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full gradient-warm mx-auto mb-4 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">Ready to Cook Something Amazing?</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Upload a photo of your ingredients or tell us what you have — our AI will suggest delicious recipes tailored just for you.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
