import { useCallback, useRef, useState } from "react";
import { Upload, Image as ImageIcon, Loader2, Camera, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  onImageSelected: (base64: string, previewUrl: string) => void;
  isAnalyzing: boolean;
  previewUrl: string | null;
}

export function ImageUpload({ onImageSelected, isAnalyzing, previewUrl }: ImageUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      onImageSelected(base64, result);
    };
    reader.readAsDataURL(file);
  }, [onImageSelected]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  return (
    <div className="glass-card animated-border">
      <h2 className="text-xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
          <Camera className="w-4 h-4 text-primary-foreground" />
        </div>
        Upload Food Image
      </h2>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} />

      {previewUrl ? (
        <div className="relative rounded-xl overflow-hidden group">
          <img src={previewUrl} alt="Uploaded food" className="w-full h-72 object-cover rounded-xl transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent rounded-xl" />
          {isAnalyzing && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-md flex items-center justify-center rounded-xl">
              <div className="text-center">
                <div className="relative">
                  <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-3" />
                  <Sparkles className="w-5 h-5 text-neon-cyan absolute top-0 right-1/3 animate-pulse" />
                </div>
                <p className="text-foreground font-semibold text-lg">Analyzing your food…</p>
                <p className="text-muted-foreground text-sm mt-1">Detecting ingredients with AI vision</p>
              </div>
            </div>
          )}
          <Button variant="outline" size="sm" className="absolute top-3 right-3 bg-card/70 backdrop-blur-md border-border/50 hover:bg-card" onClick={() => fileRef.current?.click()}>
            <ImageIcon className="w-3.5 h-3.5 mr-1" /> Change
          </Button>
        </div>
      ) : (
        <div
          className={`relative border-2 border-dashed rounded-xl p-14 text-center cursor-pointer transition-all duration-300 group ${
            dragOver
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-border/50 hover:border-primary/40 hover:bg-primary/5"
          }`}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <div className="w-16 h-16 rounded-2xl gradient-primary mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Upload className="w-8 h-8 text-primary-foreground" />
          </div>
          <p className="text-foreground font-semibold text-lg">Drop your food image here</p>
          <p className="text-muted-foreground text-sm mt-1">PNG, JPG up to 10MB</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="h-px w-8 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <span className="h-px w-8 bg-border" />
          </div>
          <Button variant="outline" className="mt-3 border-primary/30 text-primary hover:bg-primary/10">
            <Camera className="w-4 h-4 mr-2" /> Browse Files
          </Button>
        </div>
      )}
    </div>
  );
}
