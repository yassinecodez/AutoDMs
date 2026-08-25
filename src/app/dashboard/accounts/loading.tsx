export default function AccountsLoading() {
  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border">
        <div className="space-y-2">
          <div className="h-8 w-52 bg-secondary rounded-xl" />
          <div className="h-4 w-80 bg-secondary/70 rounded-lg" />
        </div>
        <div className="h-10 w-36 bg-secondary rounded-xl" />
      </div>

      {/* Connect Card Skeleton */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="h-5 w-44 bg-secondary rounded-md" />
        <div className="h-4 w-72 bg-secondary/60 rounded-md" />
        <div className="flex gap-3 pt-2">
          <div className="h-10 w-64 bg-secondary rounded-xl" />
          <div className="h-10 w-28 bg-secondary rounded-xl" />
        </div>
      </div>

      {/* Connected Accounts List Skeleton */}
      <div className="space-y-4 pt-2">
        <div className="h-5 w-48 bg-secondary rounded-md" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-secondary" />
                <div className="space-y-1.5">
                  <div className="h-4 w-32 bg-secondary rounded-md" />
                  <div className="h-3.5 w-20 bg-secondary/60 rounded-md" />
                </div>
              </div>
              <div className="h-8 w-20 bg-secondary rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
