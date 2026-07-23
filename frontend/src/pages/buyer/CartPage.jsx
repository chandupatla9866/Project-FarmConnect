import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useCart } from "@/context/CartContext";
export default function CartPage() {
  const {
    items,
    farmName,
    updateQuantity,
    removeItem,
    clearCart,
    totalAmount
  } = useCart();
  const navigate = useNavigate();
  if (items.length === 0) {
    return <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Your Cart</h1>
        <EmptyState icon={ShoppingCart} title="Your cart is empty" description="Browse products and add some fresh produce to get started." action={<Link to="/buyer/browse">
              <Button>Browse Products</Button>
            </Link>} />
      </div>;
  }
  return <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Your Cart</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Ordering from {farmName}</p>
        </div>
        <button onClick={clearCart} className="text-sm font-medium text-red-500 hover:text-red-600">
          Clear cart
        </button>
      </div>

      <div className="space-y-3">
        {items.map(item => <div key={item.productId} className="flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="h-16 w-16 shrink-0 rounded-xl object-cover" /> : <div className="h-16 w-16 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-800" />}
            <div className="flex-1">
              <p className="font-semibold text-slate-900 dark:text-white">{item.name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                ₹{item.pricePerUnit.toFixed(2)} / {item.unit.toLowerCase()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-8 text-center text-sm font-semibold text-slate-900 dark:text-white">
                {item.quantity}
              </span>
              <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} disabled={item.quantity >= item.quantityAvailable} className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="w-20 text-right font-semibold text-slate-900 dark:text-white">
              ₹{(item.pricePerUnit * item.quantity).toFixed(2)}
            </p>
            <button onClick={() => removeItem(item.productId)} className="text-slate-400 hover:text-red-500">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>)}
      </div>

      <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between text-lg font-bold text-slate-900 dark:text-white">
          <span>Total</span>
          <span>₹{totalAmount.toFixed(2)}</span>
        </div>
        <Button className="mt-4 w-full" size="lg" onClick={() => navigate("/buyer/checkout")}>
          Proceed to Checkout <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>;
}