export function AnalysisSkeleton() {
  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="kitchen-card">
        <div className="shimmer-loading h-5 w-32 rounded mb-3" />
        <div className="shimmer-loading h-4 w-full rounded mb-2" />
        <div className="shimmer-loading h-4 w-3/4 rounded" />
      </div>
      <div className="kitchen-card">
        <div className="shimmer-loading h-5 w-40 rounded mb-3" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="shimmer-loading h-8 w-20 rounded-full" />
          ))}
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="kitchen-card">
            <div className="shimmer-loading h-6 w-40 rounded mb-3" />
            <div className="shimmer-loading h-4 w-full rounded mb-2" />
            <div className="shimmer-loading h-4 w-2/3 rounded mb-3" />
            <div className="shimmer-loading h-20 w-full rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
