import { clsx } from "clsx";
export function Tabs({
  options,
  value,
  onChange
}) {
  return <div className="scrollbar-thin flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1 dark:bg-slate-800/60">
      {options.map(option => {
      const active = option.value === value;
      return <button key={option.value} onClick={() => onChange(option.value)} className={clsx("relative whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition-colors", active ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200")}>
            {option.label}
            {option.count != null && <span className={clsx("ml-1.5 rounded-full px-1.5 py-0.5 text-xs", active ? "bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400" : "bg-slate-200 text-slate-500 dark:bg-slate-700")}>
                {option.count}
              </span>}
          </button>;
    })}
    </div>;
}