import { useQuery } from "@tanstack/react-query";
import { Wallet, TrendingUp, Package, CalendarDays } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { deliveryApi } from "@/lib/api/deliveryApi";
export default function EarningsPage() {
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["delivery", "earnings"],
    queryFn: deliveryApi.earnings
  });
  return <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Earnings</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Track your delivery income.</p>
      </div>

      {isLoading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({
        length: 4
      }).map((_, i) => <SkeletonCard key={i} />)}
        </div> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Earnings" value={`₹${(data?.totalEarnings ?? 0).toLocaleString("en-IN")}`} icon={Wallet} />
          <StatCard label="Total Deliveries" value={String(data?.totalDeliveries ?? 0)} icon={Package} />
          <StatCard label="This Week" value={`₹${(data?.thisWeekEarnings ?? 0).toLocaleString("en-IN")}`} icon={TrendingUp} />
          <StatCard label="Deliveries This Week" value={String(data?.thisWeekDeliveries ?? 0)} icon={CalendarDays} />
        </div>}

      <div className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-brand-600 to-brand-800 p-6 text-white shadow-soft-lg">
        <p className="text-sm text-brand-100">Earnings are calculated per completed delivery</p>
        <p className="mt-2 text-2xl font-bold">₹30 base fee + ₹5/km distance</p>
        <p className="mt-1 text-sm text-brand-100">Paid out automatically once a delivery is confirmed with OTP.</p>
      </div>
    </div>;
}