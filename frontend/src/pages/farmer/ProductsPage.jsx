import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Sprout } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { ProductCard } from "@/components/dashboard/ProductCard";
import { productApi } from "@/lib/api/productApi";
import { extractErrorMessage } from "@/lib/apiClient";
const STATUS_TABS = [{
  value: "",
  label: "All"
}, {
  value: "ACTIVE",
  label: "Active"
}, {
  value: "OUT_OF_STOCK",
  label: "Out of Stock"
}, {
  value: "INACTIVE",
  label: "Inactive"
}];
export default function ProductsPage() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const [productToDelete, setProductToDelete] = useState(null);
  const {
    showToast
  } = useToast();
  const queryClient = useQueryClient();
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["products", {
      status,
      page
    }],
    queryFn: () => productApi.list({
      status: status || undefined,
      page,
      size: 8
    })
  });
  const deleteMutation = useMutation({
    mutationFn: id => productApi.remove(id),
    onSuccess: () => {
      showToast({
        variant: "success",
        title: "Product deleted"
      });
      queryClient.invalidateQueries({
        queryKey: ["products"]
      });
      setProductToDelete(null);
    },
    onError: error => showToast({
      variant: "error",
      title: "Failed to delete",
      description: extractErrorMessage(error)
    })
  });
  const statusMutation = useMutation({
    mutationFn: ({
      id,
      next
    }) => productApi.updateStatus(id, next),
    onSuccess: () => {
      showToast({
        variant: "success",
        title: "Product updated"
      });
      queryClient.invalidateQueries({
        queryKey: ["products"]
      });
    },
    onError: error => showToast({
      variant: "error",
      title: "Failed to update",
      description: extractErrorMessage(error)
    })
  });
  return <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Products</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your produce listings, pricing and stock.
          </p>
        </div>
        <Link to="/farmer/products/new">
          <Button>
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </Link>
      </div>

      <Tabs options={STATUS_TABS} value={status} onChange={v => {
      setStatus(v);
      setPage(0);
    }} />

      {isLoading ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({
        length: 8
      }).map((_, i) => <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />)}
        </div> : data && data.content.length > 0 ? <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {data.content.map(product => <ProductCard key={product.id} product={product} onDelete={setProductToDelete} onToggleStatus={p => statusMutation.mutate({
          id: p.id,
          next: p.status === "ACTIVE" ? "OUT_OF_STOCK" : "ACTIVE"
        })} />)}
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
        </> : <EmptyState icon={Sprout} title="No products yet" description="Add your first product to start receiving orders from buyers." action={<Link to="/farmer/products/new">
              <Button>
                <Plus className="h-4 w-4" /> Add Product
              </Button>
            </Link>} />}

      <Modal open={!!productToDelete} onClose={() => setProductToDelete(null)} title="Delete product?">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Are you sure you want to delete <strong>{productToDelete?.name}</strong>? This cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setProductToDelete(null)}>
            Cancel
          </Button>
          <Button variant="danger" isLoading={deleteMutation.isPending} onClick={() => productToDelete && deleteMutation.mutate(productToDelete.id)}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>;
}