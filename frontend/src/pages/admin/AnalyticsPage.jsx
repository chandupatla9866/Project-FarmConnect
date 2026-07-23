import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { IndianRupee, ShoppingBasket, ClipboardList, Sprout } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { RevenueTrendChart } from "@/components/dashboard/RevenueTrendChart";
import { Tabs } from "@/components/ui/Tabs";
import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { adminApi } from "@/lib/api/adminApi";
export default function AnalyticsPage() {
  const [range, setRange] = useState("weekly");
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
    queryKey: ["admin", "analytics", "revenue-trend", range],
    queryFn: () => adminApi.revenueTrend(range)
  });
  const {
    data: topFarmers,
    isLoading: topLoading
  } = useQuery({
    queryKey: ["admin", "analytics", "top-farmers", 8],
    queryFn: () => adminApi.topFarmers(8)
  });
  return <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Platform Analytics</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Revenue, demand and farmer performance across FarmConnect.</p>
      </div>

      {summaryLoading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({
        length: 4
      }).map((_, i) => <SkeletonCard key={i} />)}
        </div> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Revenue" value={`₹${(summary?.totalRevenue ?? 0).toLocaleString("en-IN")}`} icon={IndianRupee} />
          <StatCard label="Total Orders" value={String(summary?.totalOrders ?? 0)} icon={ClipboardList} />
          <StatCard label="Active Products" value={String(summary?.activeProducts ?? 0)} icon={ShoppingBasket} />
          <StatCard label="Verified Farmers" value={String(summary?.verifiedFarmers ?? 0)} icon={Sprout} />
        </div>}

      <ChartCard title="Platform Revenue Trend" subtitle={range === "weekly" ? "Last 7 days" : "Last 5 months"} action={<Tabs options={[{
      value: "weekly",
      label: "Weekly"
    }, {
      value: "monthly",
      label: "Monthly"
    }]} value={range} onChange={v => setRange(v)} />}>
        {trendLoading ? <Skeleton className="h-64 w-full" /> : trend && trend.length > 0 ? <RevenueTrendChart data={trend} /> : <EmptyState title="No revenue yet" description="Delivered orders will appear here." />}
      </ChartCard>

      <ChartCard title="Top Farmers" subtitle="Ranked by total revenue from delivered orders">
        {topLoading ? <Skeleton className="h-72 w-full" /> : topFarmers && topFarmers.length > 0 ? <div className="space-y-2">
            {topFarmers.map((farmer, i) => <div key={farmer.farmerId} className="flex items-center justify-between rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-500/15 dark:text-brand-400">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{farmer.farmName}</p>
                    <p className="text-xs text-slate-400">{farmer.totalOrders} delivered orders</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-brand-700 dark:text-brand-400">₹{farmer.totalRevenue.toLocaleString("en-IN")}</p>
              </div>)}
          </div> : <EmptyState title="No sales yet" description="Top farmers will show up here." />}
      </ChartCard>
    </div>;
}