import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ClipboardList, Heart, ShoppingBasket, Sprout } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard, SkeletonRows } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/Badge";
import { buyerOrderApi } from "@/lib/api/buyerOrderApi";
import { favoriteApi } from "@/lib/api/favoriteApi";
import { useAuth } from "@/context/AuthContext";
export default function DashboardPage() {
  const {
    user
  } = useAuth();
  const {
    data: orders,
    isLoading: ordersLoading
  } = useQuery({
    queryKey: ["buyer", "orders", "recent"],
    queryFn: () => buyerOrderApi.list({
      page: 0,
      size: 5
    })
  });
  const {
    data: favorites,
    isLoading: favLoading
  } = useQuery({
    queryKey: ["buyer", "favorites", "count"],
    queryFn: () => favoriteApi.list({
      page: 0,
      size: 1
    })
  });
  const pendingCount = orders?.content.filter(o => o.status === "PENDING" || o.status === "ACCEPTED").length ?? 0;
  return <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Welcome back, {user?.fullName?.split(" ")[0]} 👋
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Order fresh produce directly from local farms.
        </p>
      </div>

      {ordersLoading || favLoading ? <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({
        length: 3
      }).map((_, i) => <SkeletonCard key={i} />)}
        </div> : <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total Orders" value={String(orders?.totalElements ?? 0)} icon={ClipboardList} />
          <StatCard label="Active Orders" value={String(pendingCount)} icon={ShoppingBasket} />
          <StatCard label="Favorites" value={String(favorites?.totalElements ?? 0)} icon={Heart} />
        </div>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Link to="/buyer/browse" className="flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-soft transition-shadow hover:shadow-soft-lg dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white shadow-soft">
            <ShoppingBasket className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">Browse Products</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Find fresh produce from local farms</p>
          </div>
        </Link>
        <Link to="/buyer/farmers" className="flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-soft transition-shadow hover:shadow-soft-lg dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sunrise-500 text-white shadow-soft">
            <Sprout className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">Nearby Farmers</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Discover farms near you</p>
          </div>
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Recent Orders</h3>
          <Link to="/buyer/orders">
            <Button variant="ghost" size="sm">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
        {ordersLoading ? <SkeletonRows rows={3} /> : orders && orders.content.length > 0 ? <div className="space-y-3">
            {orders.content.map(order => <Link key={order.id} to={`/buyer/orders/${order.id}`} className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{order.orderNumber}</p>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{order.farmName}</p>
                </div>
                <p className="font-semibold text-slate-900 dark:text-white">₹{order.totalAmount.toFixed(2)}</p>
              </Link>)}
          </div> : <EmptyState title="No orders yet" description="Browse products to place your first order." />}
      </div>
    </div>;
}