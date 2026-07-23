import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { aiApi } from "@/lib/api/aiApi";
import { categoryApi } from "@/lib/api/categoryApi";
import { extractErrorMessage } from "@/lib/apiClient";
const SEASONS = ["summer", "winter", "monsoon"];
const TREND_META = {
  increasing: {
    icon: TrendingUp,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-500/10"
  },
  stable: {
    icon: Minus,
    color: "text-slate-500 dark:text-slate-400",
    bg: "bg-slate-100 dark:bg-slate-800"
  },
  decreasing: {
    icon: TrendingDown,
    color: "text-red-500",
    bg: "bg-red-50 dark:bg-red-500/10"
  }
};
export default function DemandPredictionPage() {
  const [productCategory, setProductCategory] = useState("");
  const [region, setRegion] = useState("Pune");
  const [season, setSeason] = useState("summer");
  const [result, setResult] = useState(null);
  const {
    showToast
  } = useToast();
  const {
    data: categories
  } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryApi.list
  });
  const mutation = useMutation({
    mutationFn: () => aiApi.predictDemand({
      productCategory,
      region,
      season
    }),
    onSuccess: setResult,
    onError: error => showToast({
      variant: "error",
      title: "Prediction failed",
      description: extractErrorMessage(error)
    })
  });
  const handleSubmit = e => {
    e.preventDefault();
    mutation.mutate();
  };
  const trend = result ? TREND_META[result.trend] : null;
  const TrendIcon = trend?.icon;
  return <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
          <TrendingUp className="h-6 w-6 text-brand-600" /> Demand Prediction
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Forecast next week&apos;s demand for a product category based on order history and seasonality.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-slate-200/70 bg-white p-6 shadow-soft sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-900">
        <Select label="Product category" required value={productCategory} onChange={e => setProductCategory(e.target.value)}>
          <option value="" disabled>
            Select category
          </option>
          {categories?.map(c => <option key={c.id} value={c.name}>
              {c.name}
            </option>)}
        </Select>
        <Input label="Region" required value={region} onChange={e => setRegion(e.target.value)} />
        <Select label="Season" value={season} onChange={e => setSeason(e.target.value)}>
          {SEASONS.map(s => <option key={s} value={s}>
              {s[0].toUpperCase() + s.slice(1)}
            </option>)}
        </Select>
        <div className="flex items-end sm:col-span-2">
          <Button type="submit" isLoading={mutation.isPending} className="w-full sm:w-auto">
            <Sparkles className="h-4 w-4" /> Predict Demand
          </Button>
        </div>
      </form>

      {result && trend && TrendIcon && <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Predicted demand next week</p>
              <p className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white">
                {result.predictedDemandNextWeek.toLocaleString("en-IN")}{" "}
                <span className="text-base font-medium text-slate-400">{result.unit}</span>
              </p>
            </div>
            <div className={`flex items-center gap-2 rounded-full px-4 py-2 ${trend.bg}`}>
              <TrendIcon className={`h-4 w-4 ${trend.color}`} />
              <span className={`text-sm font-semibold capitalize ${trend.color}`}>{result.trend}</span>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full rounded-full bg-brand-500" style={{
            width: `${Math.min(100, result.confidenceScore)}%`
          }} />
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {result.confidenceScore.toFixed(0)}% confidence
            </span>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{result.explanation}</p>
        </div>}
    </div>;
}