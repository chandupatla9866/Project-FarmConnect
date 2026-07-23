import { clsx } from "clsx";
export function Skeleton({
  className
}) {
  return <div className={clsx("animate-pulse rounded-lg bg-slate-200/80 dark:bg-slate-800", className)} />;
}
export function SkeletonCard() {
  return <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <Skeleton className="mb-3 h-4 w-1/3" />
      <Skeleton className="mb-2 h-8 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
    </div>;
}
export function SkeletonRows({
  rows = 4
}) {
  return <div className="space-y-3">
      {Array.from({
      length: rows
    }).map((_, i) => <div key={i} className="flex items-center gap-4 rounded-xl border border-slate-200/70 p-4 dark:border-slate-800">
          <Skeleton className="h-12 w-12 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>)}
    </div>;
}