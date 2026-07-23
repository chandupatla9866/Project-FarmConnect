import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { clsx } from "clsx";
const variantClasses = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-soft hover:shadow-soft-lg focus-visible:ring-brand-500",
  secondary: "bg-slate-900 text-white hover:bg-slate-800 shadow-soft dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 focus-visible:ring-slate-500",
  outline: "border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 focus-visible:ring-slate-400",
  ghost: "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 focus-visible:ring-slate-400",
  danger: "bg-red-600 text-white hover:bg-red-700 shadow-soft focus-visible:ring-red-500"
};
const sizeClasses = {
  sm: "text-sm px-3 py-1.5 gap-1.5",
  md: "text-sm px-4 py-2.5 gap-2",
  lg: "text-base px-6 py-3 gap-2"
};
export const Button = forwardRef(({
  variant = "primary",
  size = "md",
  isLoading,
  className,
  disabled,
  children,
  ...props
}, ref) => {
  return <button ref={ref} disabled={disabled || isLoading} className={clsx("inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-150", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950", "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none active:scale-[0.98]", variantClasses[variant], sizeClasses[size], className)} {...props}>
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>;
});
Button.displayName = "Button";