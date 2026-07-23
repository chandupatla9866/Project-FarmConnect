import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PackageSearch, ShieldAlert } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonRows } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { DeliveryCard } from "@/components/dashboard/DeliveryCard";
import { deliveryApi } from "@/lib/api/deliveryApi";
import { extractErrorMessage } from "@/lib/apiClient";
import { useAuth } from "@/context/AuthContext";
export default function AvailablePickupsPage() {
  const [page, setPage] = useState(0);
  const {
    user
  } = useAuth();
  const {
    showToast
  } = useToast();
  const queryClient = useQueryClient();
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["delivery", "available", page],
    queryFn: () => deliveryApi.available({
      page,
      size: 8
    })
  });
  const claimMutation = useMutation({
    mutationFn: id => deliveryApi.claim(id),
    onSuccess: () => {
      showToast({
        variant: "success",
        title: "Pickup claimed!",
        description: "Check My Deliveries to get started."
      });
      queryClient.invalidateQueries({
        queryKey: ["delivery"]
      });
    },
    onError: error => showToast({
      variant: "error",
      title: "Failed to claim",
      description: extractErrorMessage(error)
    })
  });
  return <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Available Pickups</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Orders ready for pickup from farmers, waiting to be claimed.
        </p>
      </div>

      {user && !user.approved && <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-sm text-amber-700 dark:text-amber-400/90">
            Your account is pending admin approval, so claiming is disabled for now. You can still see what&apos;s
            available.
          </p>
        </div>}

      {isLoading ? <SkeletonRows rows={5} /> : data && data.content.length > 0 ? <>
          <div className="space-y-3">
            {data.content.map(delivery => <DeliveryCard key={delivery.id} delivery={delivery} onClaim={user?.approved ? id => claimMutation.mutate(id) : undefined} isClaiming={claimMutation.isPending} />)}
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
        </> : <EmptyState icon={PackageSearch} title="No pickups available" description="Check back soon for new pickup requests." />}
    </div>;
}