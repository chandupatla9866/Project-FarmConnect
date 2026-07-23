import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { History } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonRows } from "@/components/ui/Skeleton";
import { DeliveryCard } from "@/components/dashboard/DeliveryCard";
import { deliveryApi } from "@/lib/api/deliveryApi";
export default function HistoryPage() {
  const [page, setPage] = useState(0);
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["delivery", "history", page],
    queryFn: () => deliveryApi.history({
      page,
      size: 8
    })
  });
  return <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Delivery History</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Your completed deliveries.</p>
      </div>

      {isLoading ? <SkeletonRows rows={5} /> : data && data.content.length > 0 ? <>
          <div className="space-y-3">
            {data.content.map(delivery => <DeliveryCard key={delivery.id} delivery={delivery} />)}
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
        </> : <EmptyState icon={History} title="No deliveries yet" description="Completed deliveries will show up here." />}
    </div>;
}