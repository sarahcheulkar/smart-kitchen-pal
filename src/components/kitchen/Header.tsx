import { ChefHat, Sparkles, Zap } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 gradient-cosmic opacity-90" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(var(--neon-cyan)/0.3),_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(var(--neon-pink)/0.2),_transparent_50%)]" />

      <div className="relative z-10 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-primary-foreground/15 backdrop-blur-md flex items-center justify-center border border-primary-foreground/20">
                <ChefHat className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-neon-green flex items-center justify-center">
                <Zap className="w-2.5 h-2.5 text-primary-foreground" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary-foreground flex items-center gap-2 font-display tracking-tight">
                Smart AI Kitchen
                <Sparkles className="w-6 h-6 animate-pulse" />
              </h1>
              <p className="text-primary-foreground/70 text-sm mt-0.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                AI-powered ingredient detection & recipe engine
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Bottom wave */}
      <div className="relative z-10">
        <svg viewBox="0 0 1440 60" fill="none" className="w-full" preserveAspectRatio="none">
          <path d="M0,40 C360,80 720,0 1080,40 C1260,55 1380,30 1440,40 L1440,60 L0,60 Z" fill="hsl(var(--background))" />
        </svg>
      </div>
    </header>
  );
}
