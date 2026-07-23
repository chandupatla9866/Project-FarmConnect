import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, ShoppingBasket, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { BuyerProductCard } from "@/components/dashboard/BuyerProductCard";
import { buyerBrowseApi } from "@/lib/api/buyerBrowseApi";
import { categoryApi } from "@/lib/api/categoryApi";
import { favoriteApi } from "@/lib/api/favoriteApi";
import { useCart } from "@/context/CartContext";
import { extractErrorMessage } from "@/lib/apiClient";
export default function BrowseProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const farmerId = searchParams.get("farmerId") ?? undefined;
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [organicOnly, setOrganicOnly] = useState(false);
  const [page, setPage] = useState(0);
  const {
    addItem
  } = useCart();
  const {
    showToast
  } = useToast();
  const queryClient = useQueryClient();
  const {
    data: categories
  } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryApi.list
  });
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["buyer", "products", {
      search,
      categoryId,
      farmerId,
      organicOnly,
      page
    }],
    queryFn: () => buyerBrowseApi.products({
      search: search || undefined,
      categoryId: categoryId || undefined,
      farmerId,
      organic: organicOnly || undefined,
      page,
      size: 12
    })
  });
  const favoriteMutation = useMutation({
    mutationFn: ({
      productId,
      favorited
    }) => favorited ? favoriteApi.remove(productId) : favoriteApi.add(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["buyer", "products"]
      });
      queryClient.invalidateQueries({
        queryKey: ["buyer", "favorites"]
      });
    },
    onError: error => showToast({
      variant: "error",
      title: "Failed",
      description: extractErrorMessage(error)
    })
  });
  const handleAddToCart = product => {
    const result = addItem(product);
    if (!result.ok) {
      showToast({
        variant: "warning",
        title: "Different farm in cart",
        description: result.message
      });
      return;
    }
    showToast({
      variant: "success",
      title: "Added to cart",
      description: product.name
    });
  };
  return <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Browse Products</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Fresh produce, straight from verified local farms.
        </p>
      </div>

      {farmerId && <div className="flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-2.5 text-sm text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
          Showing products from one farmer
          <button onClick={() => setSearchParams({})} className="ml-auto flex items-center gap-1 rounded-full bg-white/70 px-2 py-1 text-xs font-medium dark:bg-slate-800/60">
            <X className="h-3 w-3" /> Clear
          </button>
        </div>}

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <Input placeholder="Search products..." value={search} onChange={e => {
          setSearch(e.target.value);
          setPage(0);
        }} />
        </div>
        <Select value={categoryId} onChange={e => {
        setCategoryId(e.target.value);
        setPage(0);
      }}>
          <option value="">All categories</option>
          {categories?.map(c => <option key={c.id} value={c.id}>
              {c.name}
            </option>)}
        </Select>
      </div>

      <label className="flex w-fit items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
        <input type="checkbox" checked={organicOnly} onChange={e => {
        setOrganicOnly(e.target.checked);
        setPage(0);
      }} className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
        Organic only
      </label>

      {isLoading ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({
        length: 8
      }).map((_, i) => <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />)}
        </div> : data && data.content.length > 0 ? <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {data.content.map(product => <BuyerProductCard key={product.id} product={product} onAddToCart={handleAddToCart} onToggleFavorite={p => favoriteMutation.mutate({
          productId: p.id,
          favorited: p.favorited
        })} />)}
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
        </> : <EmptyState icon={search || categoryId || organicOnly ? Search : ShoppingBasket} title={search || categoryId || organicOnly ? "No products found" : "No products available yet"} description={search || categoryId || organicOnly ? "Try a different search or filter." : "Check back soon as farmers add fresh produce."} />}
    </div>;
}