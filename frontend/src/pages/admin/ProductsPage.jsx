import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShoppingBasket } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonRows } from "@/components/ui/Skeleton";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { adminApi } from "@/lib/api/adminApi";
import { extractErrorMessage } from "@/lib/apiClient";
export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const {
    showToast
  } = useToast();
  const queryClient = useQueryClient();
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["admin", "products", {
      search,
      status,
      page
    }],
    queryFn: () => adminApi.products({
      search: search || undefined,
      status: status || undefined,
      page,
      size: 10
    })
  });
  const statusMutation = useMutation({
    mutationFn: ({
      id,
      next
    }) => adminApi.setProductStatus(id, next),
    onSuccess: () => {
      showToast({
        variant: "success",
        title: "Product updated"
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "products"]
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
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manage Products</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">All product listings across every farm.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <Input placeholder="Search products..." value={search} onChange={e => {
          setSearch(e.target.value);
          setPage(0);
        }} />
        </div>
        <Select value={status} onChange={e => {
        setStatus(e.target.value);
        setPage(0);
      }}>
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="OUT_OF_STOCK">Out of Stock</option>
          <option value="INACTIVE">Inactive</option>
        </Select>
      </div>

      {isLoading ? <SkeletonRows rows={6} /> : data && data.content.length > 0 ? <>
          <div className="space-y-3">
            {data.content.map(product => <div key={product.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                    <ShoppingBasket className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900 dark:text-white">{product.name}</p>
                      <StatusBadge status={product.status} />
                      {product.organic && <Badge variant="brand">Organic</Badge>}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {product.farmName} &bull; {product.categoryName} &bull; ₹{product.pricePerUnit.toFixed(2)}
                    </p>
                  </div>
                </div>
                <Select value={product.status} onChange={e => statusMutation.mutate({
            id: product.id,
            next: e.target.value
          })} className="w-40">
                  <option value="ACTIVE">Active</option>
                  <option value="OUT_OF_STOCK">Out of Stock</option>
                  <option value="INACTIVE">Inactive</option>
                </Select>
              </div>)}
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
        </> : <EmptyState icon={ShoppingBasket} title="No products found" description="Try a different search or filter." />}
    </div>;
}