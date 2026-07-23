import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { BuyerProductCard } from "@/components/dashboard/BuyerProductCard";
import { favoriteApi } from "@/lib/api/favoriteApi";
import { useCart } from "@/context/CartContext";
import { extractErrorMessage } from "@/lib/apiClient";
export default function FavoritesPage() {
  const [page, setPage] = useState(0);
  const {
    addItem
  } = useCart();
  const {
    showToast
  } = useToast();
  const queryClient = useQueryClient();
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["buyer", "favorites", page],
    queryFn: () => favoriteApi.list({
      page,
      size: 12
    })
  });
  const removeMutation = useMutation({
    mutationFn: productId => favoriteApi.remove(productId),
    onSuccess: () => queryClient.invalidateQueries({
      queryKey: ["buyer", "favorites"]
    }),
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
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Favorites</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Products you've saved for later.</p>
      </div>

      {isLoading ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({
        length: 4
      }).map((_, i) => <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />)}
        </div> : data && data.content.length > 0 ? <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {data.content.map(product => <BuyerProductCard key={product.id} product={product} onAddToCart={handleAddToCart} onToggleFavorite={p => removeMutation.mutate(p.id)} />)}
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
        </> : <EmptyState icon={Heart} title="No favorites yet" description="Tap the heart icon on any product to save it here." />}
    </div>;
}