export default function SettingsLoading() {
  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-pulse">
      {/* Header */}
      <div className="space-y-2 pb-6 border-b border-border">
        <div className="h-8 w-32 bg-secondary rounded-xl" />
        <div className="h-4 w-72 bg-secondary/70 rounded-lg" />
      </div>

      {/* Settings Card Skeletons */}
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 space-y-4">
              <div className="h-5 w-40 bg-secondary rounded-md" />
              <div className="h-4 w-64 bg-secondary/60 rounded-md" />
              <div className="h-10 w-full max-w-md bg-secondary/40 rounded-xl" />
            </div>
            <div className="bg-card-footer border-t border-border p-4 flex items-center justify-between">
              <div className="h-3.5 w-48 bg-secondary/60 rounded-md" />
              <div className="h-8 w-20 bg-secondary rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
