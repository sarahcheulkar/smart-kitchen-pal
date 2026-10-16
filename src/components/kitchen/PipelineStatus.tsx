import { PipelineInfo, PipelineStage } from "@/types/kitchen";
import { Cpu, CheckCircle, XCircle, Clock, Zap, Activity } from "lucide-react";

interface PipelineStatusProps {
  pipeline: PipelineInfo;
}

export function PipelineStatus({ pipeline }: PipelineStatusProps) {
  return (
    <div className="glass-card animate-fade-in-up">
      <h2 className="text-lg font-display font-bold text-foreground mb-4 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg gradient-cosmic flex items-center justify-center">
          <Cpu className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
        Deep Learning Pipeline
        <span className="ml-auto flex items-center gap-2 text-sm font-sans font-normal">
          <span className="text-neon-cyan font-mono">{pipeline.totalTime_s}s</span>
          <span className="text-muted-foreground">on</span>
          <span className={`font-bold ${pipeline.device === 'cuda' ? 'text-neon-green' : pipeline.device === 'mps' ? 'text-neon-orange' : 'text-muted-foreground'}`}>
            {pipeline.device.toUpperCase()}
          </span>
        </span>
      </h2>

      <div className="space-y-2">
        {pipeline.stages.map((stage, i) => (
          <PipelineStageRow key={i} stage={stage} index={i} />
        ))}
      </div>

      {/* Summary bar */}
      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground pt-3 border-t border-border/30">
        <span className="flex items-center gap-1">
          <Activity className="w-3 h-3 text-neon-purple" />
          {pipeline.modelsUsed} models
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-neon-cyan" />
          {pipeline.totalTime_s}s total
        </span>
        <span className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-neon-green" />
          {pipeline.stages.filter(s => s.status === "success").length}/{pipeline.stages.length} passed
        </span>
      </div>
    </div>
  );
}

function PipelineStageRow({ stage, index }: { stage: PipelineStage; index: number }) {
  const isSuccess = stage.status === "success";

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
      <span className="text-sm font-semibold text-foreground flex-1">{stage.model}</span>

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
