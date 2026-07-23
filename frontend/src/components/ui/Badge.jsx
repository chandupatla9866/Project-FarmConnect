import { clsx } from "clsx";
const variantClasses = {
  neutral: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  danger: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  info: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400",
  brand: "bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400"
};
export function Badge({
  variant = "neutral",
  className,
  ...props
}) {
  return <span className={clsx("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold", variantClasses[variant], className)} {...props} />;
}
const ORDER_STATUS_VARIANT = {
  PENDING: "warning",
  ACCEPTED: "info",
  REJECTED: "danger",
  READY_FOR_PICKUP: "brand",
  OUT_FOR_DELIVERY: "info",
  DELIVERED: "success",
  CANCELLED: "danger",
  ACTIVE: "success",
  OUT_OF_STOCK: "warning",
  INACTIVE: "neutral"
};
export function StatusBadge({
  status
}) {
  return <Badge variant={ORDER_STATUS_VARIANT[status] ?? "neutral"}>
      {status.replaceAll("_", " ")}
    </Badge>;
}