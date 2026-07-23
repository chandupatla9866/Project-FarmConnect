import { ChevronLeft, ChevronRight } from "lucide-react";
import { clsx } from "clsx";
export function Pagination({
  page,
  totalPages,
  onPageChange
}) {
  if (totalPages <= 1) return null;
  return <div className="flex items-center justify-center gap-2 pt-2">
      <button onClick={() => onPageChange(page - 1)} disabled={page === 0} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800">
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="text-sm text-slate-500 dark:text-slate-400">
        Page <span className="font-medium text-slate-900 dark:text-white">{page + 1}</span> of {totalPages}
      </span>
      <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages - 1} className={clsx("flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800")}>
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>;
}