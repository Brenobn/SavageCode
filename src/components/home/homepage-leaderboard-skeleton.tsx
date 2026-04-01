export function HomepageLeaderboardSkeleton() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 pb-16">
      <div className="flex items-center justify-between">
        <div className="h-8 w-52 animate-pulse bg-bg-surface" />
        <div className="h-4 w-24 animate-pulse bg-bg-surface" />
      </div>

      <div className="h-4 w-72 animate-pulse bg-bg-surface" />

      <div className="border border-border-primary">
        <div className="flex h-10 items-center border-b border-border-primary bg-bg-surface px-5">
          <div className="h-3 w-full animate-pulse bg-bg-page" />
        </div>

        {["skeleton-row-1", "skeleton-row-2", "skeleton-row-3"].map((rowId) => (
          <div
            className="flex h-[58px] items-center border-b border-border-primary px-5"
            key={rowId}
          >
            <div className="h-3 w-full animate-pulse bg-bg-surface" />
          </div>
        ))}
      </div>

      <div className="mx-auto h-4 w-64 animate-pulse bg-bg-surface" />
    </section>
  );
}
