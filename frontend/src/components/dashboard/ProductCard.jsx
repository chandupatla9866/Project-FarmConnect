import { Link } from "react-router-dom";
import { Leaf, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { StatusBadge } from "@/components/ui/Badge";
export function ProductCard({
  product,
  onDelete,
  onToggleStatus
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);
  return <div className="group overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-soft transition-shadow hover:shadow-soft-lg dark:border-slate-800 dark:bg-slate-900">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" /> : <div className="flex h-full w-full items-center justify-center">
            <Leaf className="h-8 w-8 text-slate-300 dark:text-slate-600" />
          </div>}
        <div className="absolute left-2.5 top-2.5 flex gap-1.5">
          <StatusBadge status={product.status} />
          {product.organic && <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-brand-700 shadow-sm">Organic</span>}
        </div>

        <div className="absolute right-2.5 top-2.5" ref={menuRef}>
          <button onClick={() => setMenuOpen(v => !v)} className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-sm hover:bg-white">
            <MoreVertical className="h-4 w-4" />
          </button>
          {menuOpen && <div className="absolute right-0 top-full z-10 mt-1 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-soft-lg dark:border-slate-700 dark:bg-slate-900">
              <Link to={`/farmer/products/${product.id}/edit`} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Link>
              <button onClick={() => {
            setMenuOpen(false);
            onToggleStatus(product);
          }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                <Leaf className="h-3.5 w-3.5" />
                {product.status === "ACTIVE" ? "Mark out of stock" : "Mark active"}
              </button>
              <button onClick={() => {
            setMenuOpen(false);
            onDelete(product);
          }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10">
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </div>}
        </div>
      </div>

      <div className="p-4">
        <p className="text-xs font-medium text-slate-400">{product.category.name}</p>
        <h3 className="mt-0.5 truncate font-semibold text-slate-900 dark:text-white">{product.name}</h3>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-lg font-bold text-brand-700 dark:text-brand-400">
            ₹{product.pricePerUnit.toFixed(2)}
            <span className="text-xs font-normal text-slate-400"> /{product.unit.toLowerCase()}</span>
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {product.quantityAvailable} {product.unit.toLowerCase()} left
          </p>
        </div>
      </div>
    </div>;
}