import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { clsx } from "clsx";
export function StatCard({
  label,
  value,
  icon: Icon,
  delta,
  iconClassName
}) {
  return <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <div className={clsx("flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400", iconClassName)}>
          <Icon className="h-[18px] w-[18px]" />
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      {delta && <div className="mt-2 flex items-center gap-1 text-xs font-medium">
          {delta.positive ? <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> : <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />}
          <span className={delta.positive ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}>
            {delta.value}
          </span>
          <span className="text-slate-400">vs last period</span>
        </div>}
    </div>;
}