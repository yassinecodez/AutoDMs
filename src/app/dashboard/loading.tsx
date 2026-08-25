export default function DashboardLoading() {
  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-secondary rounded-xl" />
          <div className="h-4 w-72 bg-secondary/70 rounded-lg" />
        </div>
        <div className="h-10 w-36 bg-secondary rounded-xl" />
      </div>

      {/* 4-Column Stat Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 bg-card border border-border rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-20 bg-secondary rounded-md" />
              <div className="w-8 h-8 rounded-lg bg-secondary" />
            </div>
            <div className="space-y-1.5">
              <div className="h-7 w-16 bg-secondary rounded-lg" />
              <div className="h-3 w-28 bg-secondary/60 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Visual Starter Cards Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-28 bg-secondary rounded-md" />
          <div className="h-4 w-24 bg-secondary/60 rounded-md" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-6 min-h-[280px] flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-secondary" />
                  <div className="w-16 h-5 rounded-full bg-secondary" />
                </div>
                <div className="space-y-2">
                  <div className="h-5 w-44 bg-secondary rounded-lg" />
                  <div className="h-3.5 w-full bg-secondary/60 rounded-md" />
                  <div className="h-3.5 w-3/4 bg-secondary/60 rounded-md" />
                </div>
                <div className="h-12 w-full bg-secondary/40 rounded-xl border border-border/50" />
              </div>
              <div className="h-10 w-full bg-secondary rounded-xl" />
            </div>
          ))}
        </div>
      </div>

      {/* 2-Column Operations Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4 min-h-[320px]">
          <div className="flex items-center justify-between">
            <div className="h-5 w-32 bg-secondary rounded-md" />
            <div className="h-4 w-20 bg-secondary/60 rounded-md" />
          </div>
          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-secondary/40 border border-border/50 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4 min-h-[320px]">
          <div className="flex items-center justify-between">
            <div className="h-5 w-36 bg-secondary rounded-md" />
            <div className="h-4 w-20 bg-secondary/60 rounded-md" />
          </div>
          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-secondary/40 border border-border/50 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
