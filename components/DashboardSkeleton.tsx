import { Skeleton } from "@/components/ui/skeleton";


export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav skeleton */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="w-24 h-5" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="w-32 h-4 hidden sm:block" />
          <Skeleton className="w-24 h-9 rounded-md" />
        </div>
      </header>

      <main className="px-6 py-12 max-w-5xl mx-auto space-y-10">
        {/* Welcome skeleton */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="space-y-2">
            <Skeleton className="w-64 h-8" />
            <Skeleton className="w-48 h-5" />
          </div>
          <Skeleton className="w-36 h-10 rounded-md" />
        </div>

        {/* Section title */}
        <div>
          <Skeleton className="w-40 h-6 mb-4" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="border border-border/60 rounded-xl p-5 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-8 h-8 rounded-lg" />
                    <Skeleton className="w-28 h-4" />
                  </div>
                  <Skeleton className="w-20 h-6 rounded-full" />
                </div>
                <div className="flex gap-1.5">
                  <Skeleton className="w-16 h-5 rounded-full" />
                  <Skeleton className="w-14 h-5 rounded-full" />
                  <Skeleton className="w-24 h-5 rounded-full" />
                </div>
                <Skeleton className="w-24 h-3" />
                <Skeleton className="w-full h-9 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
