import { Skeleton } from "@/components/ui/skeleton";


export default function InterviewPageSkeleton() {
  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back button */}
        <Skeleton className="w-36 h-8 rounded-md" />

        {/* Header */}
        <div className="space-y-2">
          <Skeleton className="w-40 h-5" />
          <Skeleton className="w-80 h-8" />
          <Skeleton className="w-64 h-5" />
        </div>

        {/* Meta badges */}
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="w-20 h-6 rounded-full" />
          ))}
        </div>

        {/* Questions card */}
        <div className="border border-border/60 rounded-xl p-6 space-y-4">
          <Skeleton className="w-40 h-5" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-6 h-6 rounded-full shrink-0" />
              <Skeleton className="w-full h-12" />
            </div>
          ))}
        </div>

        {/* Voice panel */}
        <div className="border border-border/60 rounded-xl p-6 space-y-4">
          <Skeleton className="w-36 h-5" />
          <div className="flex gap-2">
            <Skeleton className="w-32 h-10 rounded-md" />
            <Skeleton className="w-40 h-10 rounded-md" />
          </div>
          <Skeleton className="w-full h-28 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
