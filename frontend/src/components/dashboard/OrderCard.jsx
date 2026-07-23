import { Link } from "react-router-dom";
import { Building2, UtensilsCrossed, Package, ChevronRight } from "lucide-react";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
export function OrderCard({
  order,
  onAccept,
  onReject,
  onMarkReady,
  isMutating
}) {
  const BuyerIcon = order.buyerType === "RESTAURANT" ? UtensilsCrossed : Building2;
  return <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-soft transition-shadow hover:shadow-soft-lg sm:p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
            <BuyerIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-slate-900 dark:text-white">{order.orderNumber}</p>
              <StatusBadge status={order.status} />
            </div>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{order.buyerBusinessName}</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <div className="text-right">
            <p className="font-bold text-slate-900 dark:text-white">₹{order.totalAmount.toFixed(2)}</p>
            <p className="flex items-center justify-end gap-1 text-xs text-slate-400">
              <Package className="h-3 w-3" /> {order.itemCount} item{order.itemCount !== 1 ? "s" : ""}
            </p>
          </div>
          <Link to={`/farmer/orders/${order.id}`} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {(onAccept || onReject || onMarkReady) && <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
          {order.status === "PENDING" && onAccept && onReject && <>
              <Button size="sm" onClick={() => onAccept(order.id)} isLoading={isMutating}>
                Accept
              </Button>
              <Button size="sm" variant="outline" onClick={() => onReject(order.id)} disabled={isMutating}>
                Reject
              </Button>
            </>}
          {order.status === "ACCEPTED" && onMarkReady && <Button size="sm" onClick={() => onMarkReady(order.id)} isLoading={isMutating}>
              Mark ready for pickup
            </Button>}
        </div>}
    </div>;
}