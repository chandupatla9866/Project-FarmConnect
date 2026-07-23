import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, CloudRain, CreditCard, Brain, Info, PackageCheck, CheckCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonRows } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/ui/Pagination";
import { notificationApi } from "@/lib/api/notificationApi";
import { clsx } from "clsx";
const ICONS = {
  ORDER_UPDATE: PackageCheck,
  PAYMENT: CreditCard,
  AI_ALERT: Brain,
  SYSTEM: Info,
  WEATHER: CloudRain
};
function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
function NotificationRow({
  notification
}) {
  const queryClient = useQueryClient();
  const Icon = ICONS[notification.type];
  const markReadMutation = useMutation({
    mutationFn: () => notificationApi.markRead(notification.id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications"]
      });
    }
  });
  return <button onClick={() => !notification.isRead && markReadMutation.mutate()} className={clsx("flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors", notification.isRead ? "border-slate-200/70 bg-white dark:border-slate-800 dark:bg-slate-900" : "border-brand-200 bg-brand-50/60 hover:bg-brand-50 dark:border-brand-500/30 dark:bg-brand-500/10")}>
      <div className={clsx("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", notification.isRead ? "bg-slate-100 text-slate-400 dark:bg-slate-800" : "bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400")}>
        <Icon className="h-[18px] w-[18px]" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{notification.title}</p>
          <span className="shrink-0 text-xs text-slate-400">{timeAgo(notification.createdAt)}</span>
        </div>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{notification.message}</p>
      </div>
      {!notification.isRead && <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
    </button>;
}
export default function NotificationsPage() {
  const [page, setPage] = useState(0);
  const queryClient = useQueryClient();
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["notifications", "list", page],
    queryFn: () => notificationApi.list({
      page,
      size: 12
    })
  });
  const markAllReadMutation = useMutation({
    mutationFn: notificationApi.markAllRead,
    onSuccess: () => queryClient.invalidateQueries({
      queryKey: ["notifications"]
    })
  });
  return <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notifications</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Order updates, payments, weather alerts and AI insights.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => markAllReadMutation.mutate()} isLoading={markAllReadMutation.isPending}>
          <CheckCheck className="h-4 w-4" /> Mark all as read
        </Button>
      </div>

      {isLoading ? <SkeletonRows rows={6} /> : data && data.content.length > 0 ? <>
          <div className="space-y-2.5">
            {data.content.map(n => <NotificationRow key={n.id} notification={n} />)}
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
        </> : <EmptyState icon={Bell} title="You're all caught up" description="New notifications will appear here." />}
    </div>;
}