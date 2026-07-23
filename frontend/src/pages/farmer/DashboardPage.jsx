import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { IndianRupee, ShoppingBag, Clock, Sprout, ArrowRight, ShieldAlert } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { RevenueTrendChart } from "@/components/dashboard/RevenueTrendChart";
import { TopProductsChart } from "@/components/dashboard/TopProductsChart";
import { OrderCard } from "@/components/dashboard/OrderCard";
import { Button } from "@/components/ui/Button";
import { Skeleton, SkeletonCard, SkeletonRows } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { analyticsApi } from "@/lib/api/analyticsApi";
import { orderApi } from "@/lib/api/orderApi";
import { farmerApi } from "@/lib/api/farmerApi";
import { useAuth } from "@/context/AuthContext";
export default function DashboardPage() {
  const {
    user
  } = useAuth();
  const {
    data: profile
  } = useQuery({
    queryKey: ["farmer", "profile"],
    queryFn: farmerApi.getProfile
  });
  const {
    data: summary,
    isLoading: summaryLoading
  } = useQuery({
    queryKey: ["analytics", "summary"],
    queryFn: analyticsApi.summary
  });
  const {
    data: trend,
    isLoading: trendLoading
  } = useQuery({
    queryKey: ["analytics", "revenue-trend", "weekly"],
    queryFn: () => analyticsApi.revenueTrend("weekly")
  });
  const {
    data: topProducts,
    isLoading: topLoading
  } = useQuery({
    queryKey: ["analytics", "top-products"],
    queryFn: () => analyticsApi.topProducts(5)
  });
  const {
    data: recentOrders,
    isLoading: ordersLoading
  } = useQuery({
    queryKey: ["orders", "recent"],
    queryFn: () => orderApi.list({
      page: 0,
      size: 3
    })
  });
  return <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Welcome back, {user?.fullName?.split(" ")[0]} 👋
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Here&apos;s what&apos;s happening on your farm today.
        </p>
      </div>

      {profile && !profile.verified && <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Your account is pending verification</p>
            <p className="mt-0.5 text-sm text-amber-700 dark:text-amber-400/90">
              Buyers can&apos;t see your products yet. Once an admin verifies your farm, your listings become visible on the marketplace automatically — no action needed from you.
            </p>
          </div>
        </div>}

      {summaryLoading ?<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({
        length: 4
      }).map((_, i) => <SkeletonCard key={i} />)}
        </div> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Revenue" value={`₹${(summary?.totalRevenue ?? 0).toLocaleString("en-IN")}`} icon={IndianRupee} />
          <StatCard label="Delivered Orders" value={String(summary?.totalOrders ?? 0)} icon={ShoppingBag} />
          <StatCard label="Pending Orders" value={String(summary?.pendingOrders ?? 0)} icon={Clock} />
          <StatCard label="Active Products" value={String(summary?.activeProducts ?? 0)} icon={Sprout} />
        </div>}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Revenue Trend" subtitle="Last 7 days">
            {trendLoading ? <Skeleton className="h-64 w-full" /> : trend && trend.length > 0 ? <RevenueTrendChart data={trend} /> : <EmptyState title="No revenue yet" description="Delivered orders will appear here." />}
          </ChartCard>
        </div>

        <ChartCard title="Top Products" subtitle="By revenue">
          {topLoading ? <Skeleton className="h-64 w-full" /> : topProducts && topProducts.length > 0 ? <TopProductsChart data={topProducts} /> : <EmptyState title="No sales yet" description="Your best-selling products will show up here." />}
        </ChartCard>
      </div>

      <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Recent Orders</h3>
          <Link to="/farmer/orders">
            <Button variant="ghost" size="sm">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
        {ordersLoading ? <SkeletonRows rows={3} /> : recentOrders && recentOrders.content.length > 0 ? <div className="space-y-3">
            {recentOrders.content.map(order => <OrderCard key={order.id} order={order} />)}
          </div> : <EmptyState title="No orders yet" description="New orders from buyers will show up here." />}
      </div>
    </div>;
}