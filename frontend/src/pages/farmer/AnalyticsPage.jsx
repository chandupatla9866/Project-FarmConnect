import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { IndianRupee, ShoppingBag, TrendingUp, Sprout } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { RevenueTrendChart } from "@/components/dashboard/RevenueTrendChart";
import { TopProductsChart } from "@/components/dashboard/TopProductsChart";
import { Tabs } from "@/components/ui/Tabs";
import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { analyticsApi } from "@/lib/api/analyticsApi";
export default function AnalyticsPage() {
  const [range, setRange] = useState("weekly");
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
    queryKey: ["analytics", "revenue-trend", range],
    queryFn: () => analyticsApi.revenueTrend(range)
  });
  const {
    data: topProducts,
    isLoading: topLoading
  } = useQuery({
    queryKey: ["analytics", "top-products", 8],
    queryFn: () => analyticsApi.topProducts(8)
  });
  return <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sales Analytics</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Track your farm&apos;s performance and demand trends over time.
        </p>
      </div>

      {summaryLoading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({
        length: 4
      }).map((_, i) => <SkeletonCard key={i} />)}
        </div> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Revenue" value={`₹${(summary?.totalRevenue ?? 0).toLocaleString("en-IN")}`} icon={IndianRupee} />
          <StatCard label="Delivered Orders" value={String(summary?.totalOrders ?? 0)} icon={ShoppingBag} />
          <StatCard label="Avg. Order Value" value={`₹${(summary?.averageOrderValue ?? 0).toLocaleString("en-IN")}`} icon={TrendingUp} />
          <StatCard label="Active Products" value={String(summary?.activeProducts ?? 0)} icon={Sprout} />
        </div>}

      <ChartCard title="Revenue Trend" subtitle={range === "weekly" ? "Last 7 days" : "Last 5 months"} action={<Tabs options={[{
      value: "weekly",
      label: "Weekly"
    }, {
      value: "monthly",
      label: "Monthly"
    }]} value={range} onChange={v => setRange(v)} />}>
        {trendLoading ? <Skeleton className="h-64 w-full" /> : trend && trend.length > 0 ? <RevenueTrendChart data={trend} /> : <EmptyState title="No revenue yet" description="Delivered orders will appear here." />}
      </ChartCard>

      <ChartCard title="Top Products" subtitle="Ranked by total revenue from delivered orders">
        {topLoading ? <Skeleton className="h-72 w-full" /> : topProducts && topProducts.length > 0 ? <TopProductsChart data={topProducts} /> : <EmptyState title="No sales yet" description="Your best-selling products will show up here." />}
      </ChartCard>
    </div>;
}