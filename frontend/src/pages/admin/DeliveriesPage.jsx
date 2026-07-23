import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Truck } from "lucide-react";
import { Tabs } from "@/components/ui/Tabs";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonRows } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/Badge";
import { adminApi } from "@/lib/api/adminApi";
const TABS = [{
  value: "",
  label: "All"
}, {
  value: "ASSIGNED",
  label: "Assigned"
}, {
  value: "PICKED_UP",
  label: "Picked Up"
}, {
  value: "DELIVERED",
  label: "Delivered"
}];
export default function DeliveriesPage() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["admin", "deliveries", {
      status,
      page
    }],
    queryFn: () => adminApi.deliveries({
      status: status || undefined,
      page,
      size: 10
    })
  });
  return <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manage Deliveries</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Track pickups and deliveries in progress.</p>
      </div>

      <Tabs options={TABS} value={status} onChange={v => {
      setStatus(v);
      setPage(0);
    }} />

      {isLoading ? <SkeletonRows rows={6} /> : data && data.content.length > 0 ? <>
          <div className="space-y-3">
            {data.content.map(delivery => <div key={delivery.id} className="flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sunrise-50 text-sunrise-600 dark:bg-sunrise-500/10 dark:text-sunrise-400">
                  <Truck className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900 dark:text-white">{delivery.orderNumber}</p>
                    <StatusBadge status={delivery.status} />
                  </div>
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                    {delivery.farmName} &rarr; {delivery.buyerBusinessName}
                    {delivery.partnerName ? ` • ${delivery.partnerName}` : " • Unclaimed"}
                  </p>
                </div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {delivery.deliveryFee != null ? `₹${delivery.deliveryFee.toFixed(2)}` : "—"}
                </p>
              </div>)}
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
        </> : <EmptyState icon={Truck} title="No deliveries found" description="Deliveries appear once farmers mark orders ready for pickup." />}
    </div>;
}