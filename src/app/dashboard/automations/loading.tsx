export default function AutomationsLoading() {
  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border">
        <div className="space-y-2">
          <div className="h-8 w-40 bg-secondary rounded-xl" />
          <div className="h-4 w-80 bg-secondary/70 rounded-lg" />
        </div>
        <div className="h-10 w-36 bg-secondary rounded-xl" />
      </div>

      {/* Tabs & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="h-10 w-64 bg-secondary rounded-xl" />
        <div className="flex gap-2">
          <div className="h-10 w-56 bg-secondary rounded-xl" />
          <div className="h-10 w-32 bg-secondary rounded-xl" />
        </div>
      </div>

      {/* Table Container Skeleton */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="h-12 bg-secondary/60 border-b border-border px-4 flex items-center justify-between">
          <div className="h-4 w-24 bg-secondary rounded-md" />
          <div className="h-4 w-32 bg-secondary rounded-md" />
        </div>
        <div className="divide-y divide-border">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-5 bg-secondary rounded-full shrink-0" />
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="h-4 w-48 bg-secondary rounded-md" />
                  <div className="h-3 w-64 bg-secondary/60 rounded-md" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-6 w-20 bg-secondary rounded-md" />
                <div className="h-8 w-8 bg-secondary rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
