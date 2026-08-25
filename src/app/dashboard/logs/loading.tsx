export default function LogsLoading() {
  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border">
        <div className="space-y-2">
          <div className="h-8 w-36 bg-secondary rounded-xl" />
          <div className="h-4 w-80 bg-secondary/70 rounded-lg" />
        </div>
        <div className="h-10 w-32 bg-secondary rounded-xl" />
      </div>

      {/* Summary chips */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 bg-card border border-border rounded-xl space-y-2">
            <div className="h-3.5 w-20 bg-secondary rounded-md" />
            <div className="h-6 w-12 bg-secondary rounded-lg" />
          </div>
        ))}
      </div>

      {/* Logs stream container skeleton */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm divide-y divide-border">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-9 h-9 rounded-full bg-secondary shrink-0" />
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-28 bg-secondary rounded-md" />
                  <div className="h-4 w-16 bg-secondary/60 rounded-md" />
                </div>
                <div className="h-3 w-56 bg-secondary/60 rounded-md" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-6 w-20 bg-secondary rounded-md" />
              <div className="h-3.5 w-16 bg-secondary/60 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
