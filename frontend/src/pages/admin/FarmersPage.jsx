import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, ShieldAlert, Sprout, MapPin, Phone, Mail, Ruler, CalendarClock, Leaf, Package, User } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonRows } from "@/components/ui/Skeleton";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { adminApi } from "@/lib/api/adminApi";
import { extractErrorMessage } from "@/lib/apiClient";
export default function FarmersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [detailId, setDetailId] = useState(null);
  const {
    showToast
  } = useToast();
  const queryClient = useQueryClient();
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["admin", "farmers", {
      search,
      page
    }],
    queryFn: () => adminApi.farmers({
      search: search || undefined,
      page,
      size: 10
    })
  });
  const verifyMutation = useMutation({
    mutationFn: ({
      id,
      verified
    }) => adminApi.setFarmerVerified(id, verified),
    onSuccess: () => {
      showToast({
        variant: "success",
        title: "Farmer updated"
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "farmers"]
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
    }) => adminApi.setFarmerEnabled(id, enabled),
    onSuccess: () => {
      showToast({
        variant: "success",
        title: "Farmer updated"
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "farmers"]
      });
    },
    onError: error => showToast({
      variant: "error",
      title: "Failed",
      description: extractErrorMessage(error)
    })
  });
  const {
    data: detail,
    isLoading: detailLoading
  } = useQuery({
    queryKey: ["admin", "farmer-detail", detailId],
    queryFn: () => adminApi.farmerDetail(detailId),
    enabled: !!detailId
  });
  return <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manage Farmers</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Verify farms and manage account access.</p>
      </div>

      <Input placeholder="Search by farm name or city..." value={search} onChange={e => {
      setSearch(e.target.value);
      setPage(0);
    }} />

      {isLoading ? <SkeletonRows rows={6} /> : data && data.content.length > 0 ? <>
          <div className="space-y-3">
            {data.content.map(farmer => <div key={farmer.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
                <button type="button" onClick={() => setDetailId(farmer.id)} className="flex items-center gap-3 text-left">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                    <Sprout className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900 hover:underline dark:text-white">{farmer.farmName}</p>
                      {farmer.verified && <Badge variant="brand">Verified</Badge>}
                      {!farmer.enabled && <Badge variant="danger">Disabled</Badge>}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {farmer.fullName} &bull; {farmer.farmCity ?? "No city"} &bull; {farmer.productCount} active products
                    </p>
                  </div>
                </button>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setDetailId(farmer.id)}>
                    Review
                  </Button>
                  <Button size="sm" variant={farmer.verified ? "outline" : "primary"} isLoading={verifyMutation.isPending} onClick={() => verifyMutation.mutate({
              id: farmer.id,
              verified: !farmer.verified
            })}>
                    {farmer.verified ? <>
                        <ShieldAlert className="h-3.5 w-3.5" /> Unverify
                      </> : <>
                        <BadgeCheck className="h-3.5 w-3.5" /> Verify
                      </>}
                  </Button>
                  <Button size="sm" variant={farmer.enabled ? "outline" : "danger"} isLoading={enabledMutation.isPending} onClick={() => enabledMutation.mutate({
              id: farmer.id,
              enabled: !farmer.enabled
            })}>
                    {farmer.enabled ? "Disable" : "Enable"}
                  </Button>
                </div>
              </div>)}
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
        </> : <EmptyState icon={Sprout} title="No farmers found" description="Try a different search." />}

      <Modal open={!!detailId} onClose={() => setDetailId(null)} title="Farm details" maxWidth="max-w-2xl">
        {detailLoading || !detail ? <SkeletonRows rows={4} /> : <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{detail.farmName}</h3>
                  {detail.verified ? <Badge variant="brand">Verified</Badge> : <Badge variant="warning">Pending</Badge>}
                  {!detail.enabled && <Badge variant="danger">Disabled</Badge>}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Registered {new Date(detail.createdAt).toLocaleDateString("en-IN", {
                dateStyle: "medium"
              })}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant={detail.verified ? "outline" : "primary"} isLoading={verifyMutation.isPending} onClick={() => verifyMutation.mutate({
              id: detail.id,
              verified: !detail.verified
            }, {
              onSuccess: () => queryClient.invalidateQueries({
                queryKey: ["admin", "farmer-detail", detail.id]
              })
            })}>
                  {detail.verified ? <>
                      <ShieldAlert className="h-3.5 w-3.5" /> Unverify
                    </> : <>
                      <BadgeCheck className="h-3.5 w-3.5" /> Verify
                    </>}
                </Button>
                <Button size="sm" variant={detail.enabled ? "outline" : "danger"} isLoading={enabledMutation.isPending} onClick={() => enabledMutation.mutate({
              id: detail.id,
              enabled: !detail.enabled
            }, {
              onSuccess: () => queryClient.invalidateQueries({
                queryKey: ["admin", "farmer-detail", detail.id]
              })
            })}>
                  {detail.enabled ? "Disable" : "Enable"}
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-2 text-sm">
                <User className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <span>{detail.fullName}</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <span>{detail.email}</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <span>{detail.phone ?? "Not provided"}</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <span>
                  {[detail.farmAddress, detail.farmCity, detail.farmState, detail.farmPincode].filter(Boolean).join(", ") || "No address on file"}
                </span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Ruler className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <span>{detail.farmSizeAcres != null ? `${detail.farmSizeAcres} acres` : "Farm size not provided"}</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <span>{detail.farmingExperienceYears != null ? `${detail.farmingExperienceYears} years farming` : "Experience not provided"}</span>
              </div>
              <div className="flex items-start gap-2 text-sm sm:col-span-2">
                <Leaf className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <span>{detail.primaryCropTypes || "No primary crops listed"}</span>
              </div>
            </div>

            {detail.bio && <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Bio</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">{detail.bio}</p>
              </div>}

            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <Package className="h-3.5 w-3.5" /> Listed products ({detail.products.length})
              </p>
              {detail.products.length === 0 ? <p className="text-sm text-slate-500 dark:text-slate-400">No products listed yet.</p> : <div className="space-y-2">
                  {detail.products.map(product => <div key={product.id} className="flex items-center justify-between rounded-xl border border-slate-200/70 px-3 py-2 text-sm dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-10 w-10 shrink-0 rounded-lg object-cover" /> : <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-300 dark:bg-slate-800 dark:text-slate-600">
                            <Leaf className="h-4 w-4" />
                          </div>}
                        <div>
                          <span className="font-medium text-slate-900 dark:text-white">{product.name}</span>
                          <span className="ml-2 text-xs text-slate-400">{product.categoryName}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 dark:text-slate-400">
                          ₹{product.pricePerUnit} &bull; {product.quantityAvailable} avail.
                        </span>
                        <StatusBadge status={product.status} />
                      </div>
                    </div>)}
                </div>}
            </div>
          </div>}
      </Modal>
    </div>;
}