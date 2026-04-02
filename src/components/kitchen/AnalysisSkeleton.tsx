export function AnalysisSkeleton() {
  return (
    <div className="space-y-5 animate-fade-in-up">
      <div className="glass-card">
        <div className="shimmer-loading h-5 w-36 rounded-lg mb-3" />
        <div className="shimmer-loading h-4 w-full rounded-lg mb-2" />
        <div className="shimmer-loading h-4 w-3/4 rounded-lg" />
      </div>
      <div className="glass-card">
        <div className="shimmer-loading h-5 w-44 rounded-lg mb-4" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="shimmer-loading h-9 rounded-full" style={{ width: `${60 + Math.random() * 40}px` }} />
          ))}
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card">
            <div className="shimmer-loading h-6 w-44 rounded-lg mb-3" />
            <div className="shimmer-loading h-3 w-full rounded-full mb-4" />
            <div className="flex gap-2 mb-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="shimmer-loading h-7 w-16 rounded-full" />
              ))}
            </div>
            <div className="shimmer-loading h-16 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
