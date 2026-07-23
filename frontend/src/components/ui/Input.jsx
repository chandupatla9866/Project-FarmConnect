import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { clsx } from "clsx";
const fieldClasses = clsx("w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900", "placeholder:text-slate-400 shadow-sm transition-colors", "focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20", "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400", "dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:disabled:bg-slate-800");
export const Input = forwardRef(({
  label,
  error,
  hint,
  className,
  id,
  ...props
}, ref) => {
  return <div className="w-full">
        {label && <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
          </label>}
        <input ref={ref} id={id} className={clsx(fieldClasses, error && "border-red-400 focus:border-red-500 focus:ring-red-500/20", className)} {...props} />
        {hint && !error && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
        {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
      </div>;
});
Input.displayName = "Input";
export const PasswordInput = forwardRef(({
  label,
  error,
  hint,
  className,
  id,
  ...props
}, ref) => {
  const [visible, setVisible] = useState(false);
  return <div className="w-full">
      {label && <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>}
      <div className="relative">
        <input ref={ref} id={id} type={visible ? "text" : "password"} className={clsx(fieldClasses, "pr-10", error && "border-red-400 focus:border-red-500 focus:ring-red-500/20", className)} {...props} />
        <button type="button" onClick={() => setVisible(v => !v)} tabIndex={-1} aria-label={visible ? "Hide password" : "Show password"} className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {hint && !error && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>;
});
PasswordInput.displayName = "PasswordInput";
export const Textarea = forwardRef(({
  label,
  error,
  hint,
  className,
  id,
  ...props
}, ref) => {
  return <div className="w-full">
      {label && <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>}
      <textarea ref={ref} id={id} className={clsx(fieldClasses, "min-h-[96px] resize-y", error && "border-red-400", className)} {...props} />
      {hint && !error && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>;
});
Textarea.displayName = "Textarea";