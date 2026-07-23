import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClipboardList } from "lucide-react";
import { Tabs } from "@/components/ui/Tabs";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonRows } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { OrderCard } from "@/components/dashboard/OrderCard";
import { orderApi } from "@/lib/api/orderApi";
import { extractErrorMessage } from "@/lib/apiClient";
const TABS = [{
  value: "",
  label: "Active"
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
  value: "HISTORY",
  label: "History"
}];
export default function OrdersPage() {
  const [tab, setTab] = useState("");
  const [page, setPage] = useState(0);
  const {
    showToast
  } = useToast();
  const queryClient = useQueryClient();
  const isHistory = tab === "HISTORY";
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["orders", {
      tab,
      page
    }],
    queryFn: () => isHistory ? orderApi.history({
      page,
      size: 8
    }) : orderApi.list({
      status: tab || undefined,
      page,
      size: 8
    })
  });
  const invalidate = () => queryClient.invalidateQueries({
    queryKey: ["orders"]
  });
  const acceptMutation = useMutation({
    mutationFn: orderApi.accept,
    onSuccess: () => {
      showToast({
        variant: "success",
        title: "Order accepted"
      });
      invalidate();
    },
    onError: error => showToast({
      variant: "error",
      title: "Failed",
      description: extractErrorMessage(error)
    })
  });
  const rejectMutation = useMutation({
    mutationFn: orderApi.reject,
    onSuccess: () => {
      showToast({
        variant: "info",
        title: "Order rejected"
      });
      invalidate();
    },
    onError: error => showToast({
      variant: "error",
      title: "Failed",
      description: extractErrorMessage(error)
    })
  });
  const readyMutation = useMutation({
    mutationFn: orderApi.markReadyForPickup,
    onSuccess: () => {
      showToast({
        variant: "success",
        title: "Marked ready for pickup"
      });
      invalidate();
    },
    onError: error => showToast({
      variant: "error",
      title: "Failed",
      description: extractErrorMessage(error)
    })
  });
  const isMutating = acceptMutation.isPending || rejectMutation.isPending || readyMutation.isPending;
  return <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Orders</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Review, accept and fulfil incoming orders from buyers.
        </p>
      </div>

      <Tabs options={TABS} value={tab} onChange={v => {
      setTab(v);
      setPage(0);
    }} />

      {isLoading ? <SkeletonRows rows={5} /> : data && data.content.length > 0 ? <>
          <div className="space-y-3">
            {data.content.map(order => <OrderCard key={order.id} order={order} isMutating={isMutating} onAccept={!isHistory ? id => acceptMutation.mutate(id) : undefined} onReject={!isHistory ? id => rejectMutation.mutate(id) : undefined} onMarkReady={!isHistory ? id => readyMutation.mutate(id) : undefined} />)}
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
        </> : <EmptyState icon={ClipboardList} title="No orders here" description={isHistory ? "Completed orders will show up here." : "New orders from buyers will appear here."} />}
    </div>;
}