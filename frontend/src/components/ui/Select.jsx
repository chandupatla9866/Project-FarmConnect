import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { clsx } from "clsx";
export const Select = forwardRef(({
  label,
  error,
  className,
  id,
  children,
  ...props
}, ref) => {
  return <div className="w-full">
        {label && <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
          </label>}
        <div className="relative">
          <select ref={ref} id={id} className={clsx("w-full appearance-none rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pr-9 text-sm text-slate-900", "shadow-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20", "dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100", error && "border-red-400", className)} {...props}>
            {children}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
        {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
      </div>;
});
Select.displayName = "Select";