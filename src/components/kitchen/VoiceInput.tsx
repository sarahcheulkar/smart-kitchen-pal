import { Mic, MicOff, Send, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface VoiceInputProps {
  isListening: boolean;
  transcript: string;
  onTranscriptChange: (v: string) => void;
  onStart: () => void;
  onStop: () => void;
  onSubmit: () => void;
  disabled: boolean;
}

export function VoiceInput({ isListening, transcript, onTranscriptChange, onStart, onStop, onSubmit, disabled }: VoiceInputProps) {
  return (
    <div className="glass-card animated-border">
      <h2 className="text-xl font-display font-bold text-foreground mb-2 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg gradient-secondary flex items-center justify-center">
          <Mic className="w-4 h-4 text-secondary-foreground" />
        </div>
        Voice Input
      </h2>
      <p className="text-muted-foreground text-sm mb-4">
        Speak or type your available ingredients
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={isListening ? onStop : onStart}
          className={`shrink-0 w-11 h-11 rounded-xl transition-all duration-300 ${
            isListening
              ? "bg-destructive border-destructive text-destructive-foreground shadow-[0_0_20px_hsl(var(--destructive)/0.4)] scale-110"
              : "border-neon-cyan/30 hover:border-neon-cyan/60 hover:bg-neon-cyan/10"
          }`}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-neon-cyan" />}
        </Button>
        <Input
          value={transcript}
          onChange={(e) => onTranscriptChange(e.target.value)}
          placeholder='e.g. "I have eggs, bread, and cheese"'
          className="flex-1 h-11 rounded-xl bg-muted/30 border-border/50 focus:border-primary/50"
        />
        <button
          onClick={onSubmit}
          disabled={disabled || !transcript.trim()}
          className="btn-glow shrink-0 w-11 h-11 flex items-center justify-center rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
      {isListening && (
        <div className="flex items-center gap-3 mt-4 p-3 rounded-xl bg-destructive/5 border border-destructive/20">
          <div className="pulse-dot" />
          <span className="text-sm text-foreground font-medium">Listening…</span>
          <Waves className="w-4 h-4 text-muted-foreground animate-pulse ml-auto" />
        </div>
      )}
    </div>
  );
}
