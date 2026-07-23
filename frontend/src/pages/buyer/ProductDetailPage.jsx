import { useParams, useNavigate, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Heart, Leaf, MapPin, ShieldCheck, Calendar, Package, Plus, Minus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { useCart } from "@/context/CartContext";
import { buyerBrowseApi } from "@/lib/api/buyerBrowseApi";
import { favoriteApi } from "@/lib/api/favoriteApi";
import { extractErrorMessage } from "@/lib/apiClient";
import { clsx } from "clsx";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading } = useQuery({
    queryKey: ["buyer", "products", id],
    queryFn: () => buyerBrowseApi.product(id),
    enabled: !!id
  });

  const favoriteMutation = useMutation({
    mutationFn: () => (product.favorited ? favoriteApi.remove(product.id) : favoriteApi.add(product.id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buyer", "products", id] });
      queryClient.invalidateQueries({ queryKey: ["buyer", "products"] });
      queryClient.invalidateQueries({ queryKey: ["buyer", "favorites"] });
    },
    onError: (error) => showToast({ variant: "error", title: "Failed", description: extractErrorMessage(error) })
  });

  if (isLoading || !product) {
    return <div className="mx-auto max-w-4xl space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="grid gap-6 sm:grid-cols-2">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="space-y-3">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>;
  }

  const outOfStock = product.status !== "ACTIVE" || product.quantityAvailable <= 0;
  const maxQuantity = Math.max(1, Math.floor(product.quantityAvailable));

  const handleAddToCart = () => {
    const result = addItem(product, quantity);
    if (!result.ok) {
      showToast({ variant: "warning", title: "Different farm in cart", description: result.message });
      return;
    }
    showToast({ variant: "success", title: "Added to cart", description: `${quantity} ${product.unit.toLowerCase()} of ${product.name}` });
  };

  return <div className="mx-auto max-w-4xl space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="grid gap-8 sm:grid-cols-2">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
          {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center">
              <Leaf className="h-16 w-16 text-slate-300 dark:text-slate-600" />
            </div>}
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {product.organic && <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-brand-700 shadow-sm">Organic</span>}
            {outOfStock && <span className="rounded-full bg-slate-900/80 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">Out of stock</span>}
          </div>
          <button onClick={() => favoriteMutation.mutate()} disabled={favoriteMutation.isPending} className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm hover:bg-white">
            <Heart className={clsx("h-4.5 w-4.5", product.favorited ? "fill-red-500 text-red-500" : "text-slate-500")} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <Link to={`/buyer/browse?farmerId=${product.farmerId}`} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600 dark:text-slate-400">
              <MapPin className="h-3.5 w-3.5" /> {product.farmName}, {product.farmCity}
              {product.farmerVerified && <span className="flex items-center gap-0.5 text-brand-600 dark:text-brand-400">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verified
                </span>}
            </Link>
            <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{product.name}</h1>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{product.category.name}</p>
          </div>

          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-brand-700 dark:text-brand-400">₹{product.pricePerUnit.toFixed(2)}</p>
            <span className="text-sm text-slate-400">/ {product.unit.toLowerCase()}</span>
          </div>

          {product.description && <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{product.description}</p>}

          <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Package className="h-4 w-4" /> {product.quantityAvailable} {product.unit.toLowerCase()} available
            </span>
            {product.harvestDate && <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" /> Harvested {new Date(product.harvestDate).toLocaleDateString("en-IN", { dateStyle: "medium" })}
              </span>}
            <StatusBadge status={product.status} />
          </div>

          <div className="flex items-center gap-4 border-t border-slate-100 pt-4 dark:border-slate-800">
            {!outOfStock && <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="flex h-10 w-10 items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center text-sm font-semibold text-slate-900 dark:text-white">{quantity}</span>
                <button onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))} className="flex h-10 w-10 items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white">
                  <Plus className="h-4 w-4" />
                </button>
              </div>}
            <Button onClick={handleAddToCart} disabled={outOfStock} className="flex-1">
              {outOfStock ? "Out of stock" : "Add to cart"}
            </Button>
          </div>
        </div>
      </div>
    </div>;
}
