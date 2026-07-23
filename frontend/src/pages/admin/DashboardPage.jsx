import { useQuery } from "@tanstack/react-query";
import { Sprout, Building2, ShoppingBasket, IndianRupee } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { RevenueTrendChart } from "@/components/dashboard/RevenueTrendChart";
import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { adminApi } from "@/lib/api/adminApi";
import { useAuth } from "@/context/AuthContext";
export default function DashboardPage() {
  const {
    user
  } = useAuth();
  const {
    data: summary,
    isLoading: summaryLoading
  } = useQuery({
    queryKey: ["admin", "analytics", "summary"],
    queryFn: adminApi.analyticsSummary
  });
  const {
    data: trend,
    isLoading: trendLoading
  } = useQuery({
    queryKey: ["admin", "analytics", "revenue-trend"],
    queryFn: () => adminApi.revenueTrend("weekly")
  });
  const {
    data: topFarmers,
    isLoading: topLoading
  } = useQuery({
    queryKey: ["admin", "analytics", "top-farmers"],
    queryFn: () => adminApi.topFarmers(5)
  });
  return <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Platform Overview, {user?.fullName?.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Monitor farmers, buyers, orders and revenue across FarmConnect.
        </p>
      </div>

      {summaryLoading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({
        length: 4
      }).map((_, i) => <SkeletonCard key={i} />)}
        </div> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Farmers" value={`${summary?.totalFarmers ?? 0}`} icon={Sprout} delta={{
        value: `${summary?.verifiedFarmers ?? 0} verified`,
        positive: true
      }} />
          <StatCard label="Buyers" value={String(summary?.totalBuyers ?? 0)} icon={Building2} />
          <StatCard label="Products Listed" value={String(summary?.totalProducts ?? 0)} icon={ShoppingBasket} delta={{
        value: `${summary?.activeProducts ?? 0} active`,
        positive: true
      }} />
          <StatCard label="Platform Revenue" value={`₹${(summary?.totalRevenue ?? 0).toLocaleString("en-IN")}`} icon={IndianRupee} />
        </div>}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Platform Revenue Trend" subtitle="Last 7 days, delivered orders">
            {trendLoading ? <Skeleton className="h-64 w-full" /> : trend && trend.length > 0 ? <RevenueTrendChart data={trend} /> : <EmptyState title="No revenue yet" description="Delivered orders will appear here." />}
          </ChartCard>
        </div>

        <ChartCard title="Top Farmers" subtitle="By total revenue">
          {topLoading ? <Skeleton className="h-64 w-full" /> : topFarmers && topFarmers.length > 0 ? <div className="space-y-3">
              {topFarmers.map((farmer, i) => <div key={farmer.farmerId} className="flex items-center justify-between rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-500/15 dark:text-brand-400">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{farmer.farmName}</p>
                      <p className="text-xs text-slate-400">{farmer.totalOrders} orders</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-brand-700 dark:text-brand-400">
                    ₹{farmer.totalRevenue.toLocaleString("en-IN")}
                  </p>
                </div>)}
            </div> : <EmptyState title="No sales yet" description="Top farmers will show up here." />}
        </ChartCard>
      </div>

      {summary && <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
            <strong>{summary.pendingOrders}</strong> orders awaiting farmer action
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
            <strong>{summary.deliveredOrders}</strong> orders delivered successfully
          </div>
        </div>}
    </div>;
}