import { ChefHat, Sparkles } from "lucide-react";

export function Header() {
  return (
    <header className="gradient-hero py-8 px-6">
      <div className="max-w-6xl mx-auto flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center">
          <ChefHat className="w-8 h-8 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-primary-foreground flex items-center gap-2">
            Smart AI Kitchen Assistant
            <Sparkles className="w-6 h-6" />
          </h1>
          <p className="text-primary-foreground/80 text-sm mt-1">
            Upload a food image or speak your ingredients — get instant recipes, nutrition, and more
          </p>
        </div>
      </div>
    </header>
  );
}
