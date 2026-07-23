import { Link } from "react-router-dom";
import { MapPin, ArrowRight, ChevronRight } from "lucide-react";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
export function DeliveryCard({
  delivery,
  onClaim,
  isClaiming
}) {
  return <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-soft transition-shadow hover:shadow-soft-lg sm:p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-slate-900 dark:text-white">{delivery.orderNumber}</p>
            <StatusBadge status={delivery.status} />
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{delivery.farmName}</span>
            <ArrowRight className="h-3 w-3 shrink-0" />
            <span className="truncate">{delivery.buyerBusinessName}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <div className="text-right">
            <p className="font-bold text-brand-700 dark:text-brand-400">₹{delivery.deliveryFee?.toFixed(2) ?? "—"}</p>
            {delivery.estimatedDistanceKm != null && <p className="text-xs text-slate-400">{delivery.estimatedDistanceKm} km</p>}
          </div>
          {onClaim ? <Button size="sm" onClick={() => onClaim(delivery.id)} isLoading={isClaiming}>
              Claim
            </Button> : <Link to={`/delivery/${delivery.id}`} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
              <ChevronRight className="h-4 w-4" />
            </Link>}
        </div>
      </div>
    </div>;
}