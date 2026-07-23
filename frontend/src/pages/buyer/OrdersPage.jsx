import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, ClipboardList, Package } from "lucide-react";
import { Tabs } from "@/components/ui/Tabs";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonRows } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/Badge";
import { buyerOrderApi } from "@/lib/api/buyerOrderApi";
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
  value: "READY_FOR_PICKUP",
  label: "Ready"
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
    queryKey: ["buyer", "orders", {
      status,
      page
    }],
    queryFn: () => buyerOrderApi.list({
      status: status || undefined,
      page,
      size: 8
    })
  });
  return <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Orders</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Track and review your orders.</p>
      </div>

      <Tabs options={TABS} value={status} onChange={v => {
      setStatus(v);
      setPage(0);
    }} />

      {isLoading ? <SkeletonRows rows={5} /> : data && data.content.length > 0 ? <>
          <div className="space-y-3">
            {data.content.map(order => <Link key={order.id} to={`/buyer/orders/${order.id}`} className="flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-soft transition-shadow hover:shadow-soft-lg sm:p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                  <Package className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900 dark:text-white">{order.orderNumber}</p>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{order.farmName}</p>
                </div>
                <p className="font-bold text-slate-900 dark:text-white">₹{order.totalAmount.toFixed(2)}</p>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </Link>)}
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
        </> : <EmptyState icon={ClipboardList} title="No orders yet" description="Your placed orders will show up here." />}
    </div>;
}