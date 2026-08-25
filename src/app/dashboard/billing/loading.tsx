export default function BillingLoading() {
  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 animate-pulse">
      {/* Header */}
      <div className="space-y-2 pb-6 border-b border-border">
        <div className="h-8 w-44 bg-secondary rounded-xl" />
        <div className="h-4 w-96 bg-secondary/70 rounded-lg" />
      </div>

      {/* Monthly Quota Meter Card Skeleton */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-7 space-y-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <div className="h-5 w-32 bg-secondary rounded-md" />
            <div className="h-3.5 w-64 bg-secondary/60 rounded-md" />
          </div>
          <div className="h-6 w-24 bg-secondary rounded-full" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-4 w-36 bg-secondary rounded-md" />
            <div className="h-4 w-24 bg-secondary rounded-md" />
          </div>
          <div className="h-2 w-full bg-secondary rounded-full" />
        </div>
        <div className="h-3.5 w-52 bg-secondary/50 rounded-md" />
      </div>

      {/* 3-Column Pricing Tiers Skeleton */}
      <div className="space-y-4">
        <div className="h-5 w-40 bg-secondary rounded-md" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-6 sm:p-7 min-h-[420px] flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="h-5 w-28 bg-secondary rounded-md" />
                  <div className="h-3.5 w-48 bg-secondary/60 rounded-md" />
                </div>
                <div className="h-8 w-24 bg-secondary rounded-lg" />
                <div className="space-y-2.5 pt-3">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="h-3.5 w-full bg-secondary/60 rounded-md" />
                  ))}
                </div>
              </div>
              <div className="h-10 w-full bg-secondary rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
