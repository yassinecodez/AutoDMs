export default function LeadsLoading() {
  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border">
        <div className="space-y-2">
          <div className="h-8 w-44 bg-secondary rounded-xl" />
          <div className="h-4 w-72 bg-secondary/70 rounded-lg" />
        </div>
        <div className="h-10 w-28 bg-secondary rounded-xl" />
      </div>

      {/* Metric summary chips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 bg-card border border-border rounded-xl space-y-2">
            <div className="h-3.5 w-24 bg-secondary rounded-md" />
            <div className="h-6 w-16 bg-secondary rounded-lg" />
          </div>
        ))}
      </div>

      {/* Table Container Skeleton */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="h-12 bg-secondary/60 border-b border-border px-4 flex items-center justify-between">
          <div className="h-4 w-28 bg-secondary rounded-md" />
          <div className="h-4 w-20 bg-secondary rounded-md" />
        </div>
        <div className="divide-y divide-border">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary" />
                <div className="space-y-1.5">
                  <div className="h-4 w-32 bg-secondary rounded-md" />
                  <div className="h-3 w-20 bg-secondary/60 rounded-md" />
                </div>
              </div>
              <div className="h-4 w-36 bg-secondary rounded-md" />
              <div className="h-6 w-20 bg-secondary rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
