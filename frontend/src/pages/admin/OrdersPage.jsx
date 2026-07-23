import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList, Package } from "lucide-react";
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
  value: "PENDING",
  label: "Pending"
}, {
  value: "ACCEPTED",
  label: "Accepted"
}, {
  value: "OUT_FOR_DELIVERY",
  label: "Out for Delivery"
}, {
  value: "DELIVERED",
  label: "Delivered"
}, {
  value: "REJECTED",
  label: "Rejected"
}];
export default function OrdersPage() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["admin", "orders", {
      status,
      page
    }],
    queryFn: () => adminApi.orders({
      status: status || undefined,
      page,
      size: 10
    })
  });
  return <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manage Orders</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">All orders placed across the platform.</p>
      </div>

      <Tabs options={TABS} value={status} onChange={v => {
      setStatus(v);
      setPage(0);
    }} />

      {isLoading ? <SkeletonRows rows={6} /> : data && data.content.length > 0 ? <>
          <div className="space-y-3">
            {data.content.map(order => <div key={order.id} className="flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                  <Package className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900 dark:text-white">{order.orderNumber}</p>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                    {order.farmName} &rarr; {order.buyerBusinessName} &bull; {order.itemCount} item(s)
                  </p>
                </div>
                <p className="font-bold text-slate-900 dark:text-white">₹{order.totalAmount.toFixed(2)}</p>
              </div>)}
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
        </> : <EmptyState icon={ClipboardList} title="No orders found" description="Orders will show up here as buyers place them." />}
    </div>;
}