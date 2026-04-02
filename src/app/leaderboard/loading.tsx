export default function Loading() {
  return (
    <main className="bg-bg-page text-text-primary">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-10 py-10 md:px-20">
        <section className="flex w-full flex-col gap-4">
          <div className="h-8 w-56 animate-pulse bg-bg-surface" />
          <div className="h-4 w-72 animate-pulse bg-bg-surface" />

          <div className="flex items-center gap-2">
            <div className="h-3 w-32 animate-pulse bg-bg-surface" />
            <div className="h-3 w-3 animate-pulse bg-bg-surface" />
            <div className="h-3 w-24 animate-pulse bg-bg-surface" />
          </div>
        </section>

        <section className="flex w-full flex-col">
          <div className="border border-border-primary">
            <div className="flex h-10 items-center border-b border-border-primary bg-bg-surface px-5">
              <div className="h-3 w-full animate-pulse bg-bg-page" />
            </div>

            {[
              "leaderboard-skeleton-row-1",
              "leaderboard-skeleton-row-2",
              "leaderboard-skeleton-row-3",
              "leaderboard-skeleton-row-4",
              "leaderboard-skeleton-row-5",
              "leaderboard-skeleton-row-6",
            ].map((rowId) => (
              <div
                className="flex h-[58px] items-center border-b border-border-primary px-5 last:border-b-0"
                key={rowId}
              >
                <div className="h-3 w-full animate-pulse bg-bg-surface" />
              </div>
            ))}
          </div>
        </section>

        <div className="h-4 w-48 animate-pulse bg-bg-surface" />
      </div>
    </main>
  );
}
