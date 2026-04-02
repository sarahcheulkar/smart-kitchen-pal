import { useCallback, useRef, useState } from "react";
import { Upload, Image as ImageIcon, Loader2 } from "lucide-react";
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
    <div className="kitchen-card">
      <h2 className="text-xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
        <ImageIcon className="w-5 h-5 text-primary" />
        Upload Food Image
      </h2>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} />

      {previewUrl ? (
        <div className="relative rounded-lg overflow-hidden">
          <img src={previewUrl} alt="Uploaded food" className="w-full h-64 object-cover rounded-lg" />
          {isAnalyzing && (
            <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm flex items-center justify-center rounded-lg">
              <div className="text-center">
                <Loader2 className="w-10 h-10 text-primary-foreground animate-spin mx-auto mb-2" />
                <p className="text-primary-foreground font-medium">Analyzing your food…</p>
              </div>
            </div>
          )}
          <Button variant="outline" size="sm" className="absolute top-3 right-3 bg-card/80 backdrop-blur-sm" onClick={() => fileRef.current?.click()}>
            Change Image
          </Button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all ${dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-medium">Drop your food image here</p>
          <p className="text-muted-foreground text-sm mt-1">or click to browse</p>
        </div>
      )}
    </div>
  );
}
