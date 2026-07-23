import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, Bike, Clock } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonRows } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { adminApi } from "@/lib/api/adminApi";
import { extractErrorMessage } from "@/lib/apiClient";
export default function DeliveryPartnersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const {
    showToast
  } = useToast();
  const queryClient = useQueryClient();
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["admin", "delivery-partners", {
      search,
      page
    }],
    queryFn: () => adminApi.deliveryPartners({
      search: search || undefined,
      page,
      size: 10
    })
  });
  const approveMutation = useMutation({
    mutationFn: ({
      id,
      approved
    }) => adminApi.setDeliveryPartnerApproved(id, approved),
    onSuccess: () => {
      showToast({
        variant: "success",
        title: "Delivery partner updated"
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "delivery-partners"]
      });
    },
    onError: error => showToast({
      variant: "error",
      title: "Failed",
      description: extractErrorMessage(error)
    })
  });
  const enabledMutation = useMutation({
    mutationFn: ({
      id,
      enabled
    }) => adminApi.setDeliveryPartnerEnabled(id, enabled),
    onSuccess: () => {
      showToast({
        variant: "success",
        title: "Delivery partner updated"
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "delivery-partners"]
      });
    },
    onError: error => showToast({
      variant: "error",
      title: "Failed",
      description: extractErrorMessage(error)
    })
  });
  return <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manage Delivery Partners</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Approve applicants before they can claim pickups, and manage account access.
        </p>
      </div>

      <Input placeholder="Search by name or email..." value={search} onChange={e => {
      setSearch(e.target.value);
      setPage(0);
    }} />

      {isLoading ? <SkeletonRows rows={6} /> : data && data.content.length > 0 ? <>
          <div className="space-y-3">
            {data.content.map(partner => <div key={partner.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                    <Bike className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900 dark:text-white">{partner.fullName}</p>
                      {partner.approved ? <Badge variant="brand">Approved</Badge> : <Badge variant="warning">Pending</Badge>}
                      {!partner.enabled && <Badge variant="danger">Disabled</Badge>}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {partner.email} &bull; {partner.phone ?? "No phone"} &bull; {partner.deliveriesCompleted} completed
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant={partner.approved ? "outline" : "primary"} isLoading={approveMutation.isPending} onClick={() => approveMutation.mutate({
              id: partner.id,
              approved: !partner.approved
            })}>
                    {partner.approved ? <>
                        <Clock className="h-3.5 w-3.5" /> Unapprove
                      </> : <>
                        <BadgeCheck className="h-3.5 w-3.5" /> Approve
                      </>}
                  </Button>
                  <Button size="sm" variant={partner.enabled ? "outline" : "danger"} isLoading={enabledMutation.isPending} onClick={() => enabledMutation.mutate({
              id: partner.id,
              enabled: !partner.enabled
            })}>
                    {partner.enabled ? "Disable" : "Enable"}
                  </Button>
                </div>
              </div>)}
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
        </> : <EmptyState icon={Bike} title="No delivery partners found" description="Try a different search." />}
    </div>;
}
