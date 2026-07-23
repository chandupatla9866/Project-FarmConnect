import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, PackageSearch, Truck, Wallet, TrendingUp, ShieldAlert } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard, SkeletonRows } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/Badge";
import { deliveryApi } from "@/lib/api/deliveryApi";
import { useAuth } from "@/context/AuthContext";
export default function DashboardPage() {
  const {
    user
  } = useAuth();
  const {
    data: available,
    isLoading: availableLoading
  } = useQuery({
    queryKey: ["delivery", "available", "count"],
    queryFn: () => deliveryApi.available({
      page: 0,
      size: 5
    })
  });
  const {
    data: active,
    isLoading: activeLoading
  } = useQuery({
    queryKey: ["delivery", "mine", "active"],
    queryFn: () => deliveryApi.mine({
      page: 0,
      size: 5
    })
  });
  const {
    data: earnings,
    isLoading: earningsLoading
  } = useQuery({
    queryKey: ["delivery", "earnings"],
    queryFn: deliveryApi.earnings
  });
  return <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Welcome back, {user?.fullName?.split(" ")[0]} 🚚
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Here&apos;s your delivery activity today.
        </p>
      </div>

      {user && !user.approved && <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Your application is pending review</p>
            <p className="mt-0.5 text-sm text-amber-700 dark:text-amber-400/90">
              An admin needs to approve your delivery partner account before you can claim pickups. This usually
              doesn&apos;t take long — check back soon.
            </p>
          </div>
        </div>}

      {availableLoading || activeLoading || earningsLoading ?<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({
        length: 4
      }).map((_, i) => <SkeletonCard key={i} />)}
        </div> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Available Pickups" value={String(available?.totalElements ?? 0)} icon={PackageSearch} />
          <StatCard label="Active Deliveries" value={String(active?.totalElements ?? 0)} icon={Truck} />
          <StatCard label="Total Earnings" value={`₹${(earnings?.totalEarnings ?? 0).toLocaleString("en-IN")}`} icon={Wallet} />
          <StatCard label="This Week" value={`₹${(earnings?.thisWeekEarnings ?? 0).toLocaleString("en-IN")}`} icon={TrendingUp} />
        </div>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Link to="/delivery/available" className="flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-soft transition-shadow hover:shadow-soft-lg dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white shadow-soft">
            <PackageSearch className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">Available Pickups</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Claim a new pickup request</p>
          </div>
        </Link>
        <Link to="/delivery/active" className="flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-soft transition-shadow hover:shadow-soft-lg dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sunrise-500 text-white shadow-soft">
            <Truck className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">My Deliveries</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Track your active pickups</p>
          </div>
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Active Deliveries</h3>
          <Link to="/delivery/active">
            <Button variant="ghost" size="sm">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
        {activeLoading ? <SkeletonRows rows={3} /> : active && active.content.length > 0 ? <div className="space-y-3">
            {active.content.map(delivery => <Link key={delivery.id} to={`/delivery/${delivery.id}`} className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{delivery.orderNumber}</p>
                    <StatusBadge status={delivery.status} />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {delivery.farmName} &rarr; {delivery.buyerBusinessName}
                  </p>
                </div>
                <p className="font-semibold text-slate-900 dark:text-white">₹{delivery.deliveryFee?.toFixed(2) ?? "—"}</p>
              </Link>)}
          </div> : <EmptyState title="No active deliveries" description="Claim an available pickup to get started." />}
      </div>
    </div>;
}