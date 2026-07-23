import { useQuery } from "@tanstack/react-query";
import { CloudRain, Droplets, Thermometer, TriangleAlert, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { aiApi } from "@/lib/api/aiApi";
import { extractErrorMessage } from "@/lib/apiClient";
const SEVERITY_COLOR = {
  high: "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400",
  medium: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400",
  low: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-400"
};
export default function WeatherAlertsPage() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ["ai", "weather"],
    queryFn: () => aiApi.weatherAlerts(),
    retry: false
  });
  return <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
            <CloudRain className="h-6 w-6 text-brand-600" /> Weather Alerts
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Stay ahead of rain, heat waves, storms and humidity spikes.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} isLoading={isFetching}>
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {isLoading ? <Skeleton className="h-80 w-full rounded-2xl" /> : isError ? <EmptyState icon={TriangleAlert} title="Couldn't load weather" description={extractErrorMessage(error) || "Set your farm's latitude/longitude in your profile first."} /> : data ? <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-brand-500 to-brand-700 p-6 text-white shadow-soft-lg">
            <p className="text-sm text-brand-100">{data.region}</p>
            <div className="mt-3 flex items-end gap-4">
              <p className="text-5xl font-extrabold">{data.tempCelsius.toFixed(0)}°C</p>
              <p className="pb-1.5 text-lg font-medium">{data.currentCondition}</p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-brand-100">
              <Droplets className="h-4 w-4" /> {data.humidityPercent.toFixed(0)}% humidity
            </div>
            <p className="mt-4 text-sm text-brand-50">{data.forecastSummary}</p>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Active alerts</h2>
            {data.alerts.length === 0 ? <EmptyState icon={Thermometer} title="No active alerts" description="Conditions look normal for your farm right now." /> : <div className="space-y-3">
                {data.alerts.map((alert, i) => <div key={i} className={`flex items-start gap-3 rounded-2xl border p-4 ${SEVERITY_COLOR[alert.severity] ?? SEVERITY_COLOR.low}`}>
                    <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold capitalize">{alert.type.replaceAll("_", " ").toLowerCase()}</p>
                        <span className="rounded-full bg-white/60 px-2 py-0.5 text-[10px] font-bold uppercase dark:bg-black/20">
                          {alert.severity}
                        </span>
                      </div>
                      <p className="mt-1 text-sm">{alert.message}</p>
                      <p className="mt-1 text-xs opacity-70">Valid until {alert.validUntil}</p>
                    </div>
                  </div>)}
              </div>}
          </div>
        </div> : null}
    </div>;
}