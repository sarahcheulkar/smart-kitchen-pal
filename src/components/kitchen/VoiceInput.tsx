import { Mic, MicOff, Send } from "lucide-react";
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
    <div className="kitchen-card">
      <h2 className="text-xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
        <Mic className="w-5 h-5 text-primary" />
        Voice Input
      </h2>
      <p className="text-muted-foreground text-sm mb-3">
        Speak or type your available ingredients
      </p>
      <div className="flex gap-2">
        <Button
          variant={isListening ? "destructive" : "outline"}
          size="icon"
          onClick={isListening ? onStop : onStart}
          className="shrink-0"
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </Button>
        <Input
          value={transcript}
          onChange={(e) => onTranscriptChange(e.target.value)}
          placeholder='e.g. "I have eggs, bread, and cheese"'
          className="flex-1"
        />
        <Button onClick={onSubmit} disabled={disabled || !transcript.trim()} className="shrink-0 gradient-warm text-primary-foreground border-0">
          <Send className="w-4 h-4" />
        </Button>
      </div>
      {isListening && (
        <div className="flex items-center gap-2 mt-3">
          <div className="pulse-dot" />
          <span className="text-sm text-muted-foreground">Listening...</span>
        </div>
      )}
    </div>
  );
}
