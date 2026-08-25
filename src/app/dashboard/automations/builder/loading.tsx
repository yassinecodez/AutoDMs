export default function BuilderLoading() {
  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 animate-pulse">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-secondary" />
          <div className="space-y-1.5">
            <div className="h-6 w-48 bg-secondary rounded-lg" />
            <div className="h-3.5 w-64 bg-secondary/60 rounded-md" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-24 bg-secondary rounded-xl" />
          <div className="h-10 w-36 bg-secondary rounded-xl" />
        </div>
      </div>

      {/* Stepper Timeline Skeleton */}
      <div className="h-14 bg-card border border-border rounded-2xl p-3 flex items-center justify-between" />

      {/* Form cards skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <div className="h-5 w-36 bg-secondary rounded-md" />
            <div className="h-10 w-full bg-secondary/50 rounded-xl" />
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <div className="h-5 w-40 bg-secondary rounded-md" />
            <div className="h-28 w-full bg-secondary/50 rounded-xl" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 h-[400px]" />
      </div>
    </div>
  );
}
