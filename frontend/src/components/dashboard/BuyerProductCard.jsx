import { Link } from "react-router-dom";
import { Leaf, Heart, Plus, MapPin } from "lucide-react";
import { clsx } from "clsx";
export function BuyerProductCard({
  product,
  onAddToCart,
  onToggleFavorite
}) {
  const outOfStock = product.status !== "ACTIVE" || product.quantityAvailable <= 0;
  return <div className="group overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-soft transition-shadow hover:shadow-soft-lg dark:border-slate-800 dark:bg-slate-900">
      <Link to={`/buyer/products/${product.id}`} className="relative block aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" /> : <div className="flex h-full w-full items-center justify-center">
            <Leaf className="h-8 w-8 text-slate-300 dark:text-slate-600" />
          </div>}

        <div className="absolute left-2.5 top-2.5 flex gap-1.5">
          {product.organic && <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-brand-700 shadow-sm">
              Organic
            </span>}
          {outOfStock && <span className="rounded-full bg-slate-900/80 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
              Out of stock
            </span>}
        </div>

        <button onClick={e => {
        e.preventDefault();
        onToggleFavorite(product);
      }} className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm hover:bg-white">
          <Heart className={clsx("h-4 w-4", product.favorited ? "fill-red-500 text-red-500" : "text-slate-500")} />
        </button>
      </Link>

      <div className="p-4">
        <p className="flex items-center gap-1 text-xs font-medium text-slate-400">
          <MapPin className="h-3 w-3" /> {product.farmName}
          {product.farmerVerified && <span className="text-brand-600">&bull; Verified</span>}
        </p>
        <Link to={`/buyer/products/${product.id}`}>
          <h3 className="mt-0.5 truncate font-semibold text-slate-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-400">{product.name}</h3>
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-lg font-bold text-brand-700 dark:text-brand-400">
            ₹{product.pricePerUnit.toFixed(2)}
            <span className="text-xs font-normal text-slate-400"> /{product.unit.toLowerCase()}</span>
          </p>
          <button onClick={() => onAddToCart(product)} disabled={outOfStock} className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white shadow-soft transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40">
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>;
}