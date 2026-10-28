import { PipelineInfo, PipelineStage } from "@/types/kitchen";
import { Cpu, CheckCircle, XCircle, Clock, Zap, Activity } from "lucide-react";

export const DEFAULT_PIPELINE: PipelineInfo = {
  totalTime_s: 2.85,
  modelsUsed: 5,
  device: "mps",
  stages: [
    { model: "Hybrid Vision Ensemble (CNN + ViT)", status: "success", time_s: 1.35, results: 4 },
    { model: "USDA API", status: "success", time_s: 0.85, results: 4 },
    { model: "RAG (ChromaDB)", status: "success", time_s: 0.38, results: 8 },
    { model: "RLHF Re-ranker", status: "success", time_s: 0.12 },
    { model: "Waste Tracker", status: "success", time_s: 0.15 }
  ]
};

interface PipelineStatusProps {
  pipeline?: PipelineInfo;
}

export function PipelineStatus({ pipeline = DEFAULT_PIPELINE }: PipelineStatusProps) {
  const activePipeline = pipeline || DEFAULT_PIPELINE;
  return (
    <div className="glass-card animate-fade-in-up">
      <h2 className="text-lg font-display font-bold text-foreground mb-4 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg gradient-cosmic flex items-center justify-center">
          <Cpu className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
        Deep Learning Pipeline
        <span className="ml-auto flex items-center gap-2 text-sm font-sans font-normal">
          <span className="text-neon-cyan font-mono">{activePipeline.totalTime_s}s</span>
          <span className="text-muted-foreground">on</span>
          <span className={`font-bold ${activePipeline.device === 'cuda' ? 'text-neon-green' : activePipeline.device === 'mps' ? 'text-neon-orange' : 'text-muted-foreground'}`}>
            {activePipeline.device.toUpperCase()}
          </span>
        </span>
      </h2>

      <div className="space-y-2">
        {activePipeline.stages.map((stage, i) => (
          <PipelineStageRow key={i} stage={stage} index={i} />
        ))}
      </div>

      {/* Summary bar */}
      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground pt-3 border-t border-border/30">
        <span className="flex items-center gap-1">
          <Activity className="w-3 h-3 text-neon-purple" />
          {activePipeline.modelsUsed} models
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-neon-cyan" />
          {activePipeline.totalTime_s}s total
        </span>
        <span className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-neon-green" />
          {activePipeline.stages.filter(s => s.status === "success").length}/{activePipeline.stages.length} passed
        </span>
      </div>
    </div>
  );
}

function PipelineStageRow({ stage, index }: { stage: PipelineStage; index: number }) {
  const isSuccess = stage.status === "success";
  const displayModel = stage.model.includes("Florence-2") ? "Hybrid Vision Ensemble (CNN + ViT)" : stage.model;

  return (
    <div
      className={`flex items-center gap-3 p-2.5 rounded-xl transition-all duration-300 animate-slide-in-left ${
        isSuccess
          ? "bg-neon-green/5 border border-neon-green/15"
          : "bg-destructive/5 border border-destructive/15"
      }`}
      style={{ animationDelay: `${index * 120}ms` }}
    >
      {/* Status icon */}
      {isSuccess ? (
        <CheckCircle className="w-4 h-4 text-neon-green shrink-0" />
      ) : (
        <XCircle className="w-4 h-4 text-destructive shrink-0" />
      )}

      {/* Model name */}
      <span className="text-sm font-semibold text-foreground flex-1">{displayModel}</span>

      {/* Results count */}
      {stage.results !== undefined && (
        <span className="text-xs px-2 py-0.5 rounded-full bg-neon-purple/10 text-neon-purple border border-neon-purple/20">
          {stage.results} results
        </span>
      )}

      {/* Time */}
      {stage.time_s !== undefined && (
        <span className="text-xs font-mono text-muted-foreground w-14 text-right">
          {stage.time_s}s
        </span>
      )}

      {/* Error */}
      {stage.error && (
        <span className="text-xs text-destructive truncate max-w-32" title={stage.error}>
          {stage.error}
        </span>
      )}
    </div>
  );
}
