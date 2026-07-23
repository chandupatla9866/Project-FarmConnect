import { clsx } from "clsx";
export function Card({
  className,
  ...props
}) {
  return <div className={clsx("rounded-2xl border border-slate-200/70 bg-white shadow-soft", "dark:border-slate-800 dark:bg-slate-900", className)} {...props} />;
}
export function CardHeader({
  className,
  ...props
}) {
  return <div className={clsx("px-5 pt-5", className)} {...props} />;
}
export function CardTitle({
  className,
  ...props
}) {
  return <h3 className={clsx("text-base font-semibold text-slate-900 dark:text-white", className)} {...props} />;
}
export function CardContent({
  className,
  ...props
}) {
  return <div className={clsx("p-5", className)} {...props} />;
}