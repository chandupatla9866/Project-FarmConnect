import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, UtensilsCrossed } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonRows } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { adminApi } from "@/lib/api/adminApi";
import { extractErrorMessage } from "@/lib/apiClient";
export default function BuyersPage() {
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
    queryKey: ["admin", "buyers", {
      search,
      page
    }],
    queryFn: () => adminApi.buyers({
      search: search || undefined,
      page,
      size: 10
    })
  });
  const enabledMutation = useMutation({
    mutationFn: ({
      id,
      enabled
    }) => adminApi.setBuyerEnabled(id, enabled),
    onSuccess: () => {
      showToast({
        variant: "success",
        title: "Buyer updated"
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "buyers"]
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
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manage Buyers</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Apartment communities and restaurants on the platform.</p>
      </div>

      <Input placeholder="Search by business name or city..." value={search} onChange={e => {
      setSearch(e.target.value);
      setPage(0);
    }} />

      {isLoading ? <SkeletonRows rows={6} /> : data && data.content.length > 0 ? <>
          <div className="space-y-3">
            {data.content.map(buyer => {
          const TypeIcon = buyer.buyerType === "RESTAURANT" ? UtensilsCrossed : Building2;
          return <div key={buyer.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sunrise-50 text-sunrise-600 dark:bg-sunrise-500/10 dark:text-sunrise-400">
                      <TypeIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900 dark:text-white">{buyer.businessName}</p>
                        <Badge variant="neutral">{buyer.buyerType === "RESTAURANT" ? "Restaurant" : "Apartment"}</Badge>
                        {!buyer.enabled && <Badge variant="danger">Disabled</Badge>}
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {buyer.fullName} &bull; {buyer.city ?? "No city"}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant={buyer.enabled ? "outline" : "danger"} isLoading={enabledMutation.isPending} onClick={() => enabledMutation.mutate({
              id: buyer.id,
              enabled: !buyer.enabled
            })}>
                    {buyer.enabled ? "Disable" : "Enable"}
                  </Button>
                </div>;
        })}
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
        </> : <EmptyState icon={Building2} title="No buyers found" description="Try a different search." />}
    </div>;
}