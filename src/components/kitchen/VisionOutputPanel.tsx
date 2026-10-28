import { BLIPOutput, YOLOOutput } from "@/types/kitchen";
import { Brain, Eye, ScanSearch, MessageSquare, MapPin } from "lucide-react";

interface VisionOutputPanelProps {
  blip: BLIPOutput | null;
  yolo: YOLOOutput | null;
}

export function VisionOutputPanel({ blip, yolo }: VisionOutputPanelProps) {
  return (
    <div className="glass-card animate-fade-in-up">
      <h2 className="text-lg font-display font-bold text-foreground mb-4 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg gradient-cosmic flex items-center justify-center">
          <Brain className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
        AI Model Outputs
      </h2>

      {/* Vision Transformer Captioning Section */}
      {blip && (
        <div className="space-y-2.5 mb-4">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-1">
            <Eye className="w-3 h-3 text-neon-purple" /> Vision Transformer (ViT Caption)
          </p>

          <VisionField
            icon={<MessageSquare className="w-3.5 h-3.5 text-neon-cyan" />}
            label="Scene Caption"
            value={blip.general_caption}
            color="border-neon-cyan/20 bg-neon-cyan/5"
          />

          <VisionField
            icon={<ScanSearch className="w-3.5 h-3.5 text-neon-green" />}
            label="Detected Ingredients"
            value={blip.ingredient_caption}
            color="border-neon-green/20 bg-neon-green/5"
          />

          <VisionField
            icon={<MapPin className="w-3.5 h-3.5 text-neon-orange" />}
            label="Scene Context"
            value={blip.scene_description}
            color="border-neon-orange/20 bg-neon-orange/5"
          />

          {blip.cuisine_suggestion && (
            <VisionField
              icon={<span className="text-sm">🍽️</span>}
              label="Cuisine Suggestion"
              value={blip.cuisine_suggestion}
              color="border-neon-pink/20 bg-neon-pink/5"
            />
          )}
        </div>
      )}

      {/* Hybrid Vision Detection Section */}
      {yolo && (
        <div className="space-y-2.5">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-1">
            <ScanSearch className="w-3 h-3 text-neon-orange" /> Hybrid Vision Ensemble (Zero-Shot Detection)
          </p>

          <div className="grid grid-cols-3 gap-2 mb-2">
            <StatBox label="Food Items" value={yolo.total_food_detected} color="text-neon-green" />
            <StatBox label="Total Objects" value={yolo.total_objects} color="text-neon-cyan" />
            <StatBox label="Unique Foods" value={yolo.unique_foods.length} color="text-neon-purple" />
          </div>

          {yolo.food_items.length > 0 && (
            <div className="space-y-1">
              {yolo.food_items.slice(0, 8).map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 border border-border/20 animate-slide-in-left"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-neon-green" />
                  <span className="text-sm text-foreground font-medium flex-1">{item.label}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {item.category}
                  </span>
                  <span className={`text-xs font-bold ${
                    item.confidence > 0.8 ? "text-neon-green" : item.confidence > 0.5 ? "text-neon-orange" : "text-neon-pink"
                  }`}>
                    {Math.round(item.confidence * 100)}%
                  </span>
                </div>
              ))}
            </div>
          )}

          {yolo.scene_objects.length > 0 && (
            <div className="mt-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Scene Objects</p>
              <div className="flex flex-wrap gap-1">
                {yolo.scene_objects.slice(0, 6).map((obj, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-muted/30 text-muted-foreground border border-border/20">
                    {obj.label} ({Math.round(obj.confidence * 100)}%)
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!blip && !yolo && (
        <p className="text-sm text-muted-foreground italic">No vision models were used (text-only input)</p>
      )}
    </div>
  );
}

function VisionField({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  if (!value) return null;
  return (
    <div className={`p-3 rounded-xl border ${color}`}>
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{label}</span>
      </div>
      <p className="text-sm text-foreground leading-relaxed">{value}</p>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center p-2 rounded-lg bg-muted/20 border border-border/20">
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      <div className="text-[9px] text-muted-foreground uppercase tracking-wider">{label}</div>
    </div>
  );
}
