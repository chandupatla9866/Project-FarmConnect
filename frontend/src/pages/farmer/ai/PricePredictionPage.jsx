import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { IndianRupee, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { aiApi } from "@/lib/api/aiApi";
import { categoryApi } from "@/lib/api/categoryApi";
import { extractErrorMessage } from "@/lib/apiClient";
const SEASONS = ["summer", "winter", "monsoon"];
export default function PricePredictionPage() {
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [region, setRegion] = useState("Pune");
  const [quantity, setQuantity] = useState("10");
  const [qualityGrade, setQualityGrade] = useState("regular");
  const [currentSeason, setCurrentSeason] = useState("summer");
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
    mutationFn: () => aiApi.predictPrice({
      productName,
      category,
      region,
      quantity: Number(quantity),
      qualityGrade,
      currentSeason
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
  return <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
          <IndianRupee className="h-6 w-6 text-brand-600" /> Price Prediction
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Get a fair market price estimate for your produce before you list it.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-slate-200/70 bg-white p-6 shadow-soft sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-900">
        <Input label="Product name" required value={productName} onChange={e => setProductName(e.target.value)} placeholder="Tomato" />
        <Select label="Category" required value={category} onChange={e => setCategory(e.target.value)}>
          <option value="" disabled>
            Select category
          </option>
          {categories?.map(c => <option key={c.id} value={c.name}>
              {c.name}
            </option>)}
        </Select>
        <Input label="Region" required value={region} onChange={e => setRegion(e.target.value)} />
        <Input label="Quantity (units)" type="number" min="1" required value={quantity} onChange={e => setQuantity(e.target.value)} />
        <Select label="Quality grade" value={qualityGrade} onChange={e => setQualityGrade(e.target.value)}>
          <option value="regular">Regular</option>
          <option value="organic">Organic</option>
        </Select>
        <Select label="Season" value={currentSeason} onChange={e => setCurrentSeason(e.target.value)}>
          {SEASONS.map(s => <option key={s} value={s}>
              {s[0].toUpperCase() + s.slice(1)}
            </option>)}
        </Select>
        <div className="flex items-end sm:col-span-2">
          <Button type="submit" isLoading={mutation.isPending} className="w-full sm:w-auto">
            <Sparkles className="h-4 w-4" /> Predict Price
          </Button>
        </div>
      </form>

      {result && <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Predicted price per unit</p>
          <p className="mt-1 text-4xl font-extrabold text-brand-700 dark:text-brand-400">
            ₹{result.predictedPricePerUnit.toFixed(2)}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Suggested range: ₹{result.priceRangeMin.toFixed(2)} – ₹{result.priceRangeMax.toFixed(2)}
          </p>

          <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className="h-full rounded-full bg-gradient-to-r from-brand-300 to-brand-600" style={{
          width: `${Math.min(100, result.confidenceScore)}%`
        }} />
          </div>
          <p className="mt-1.5 text-xs text-slate-400">{result.confidenceScore.toFixed(0)}% confidence</p>

          <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
            {result.marketFactorsConsidered.map(factor => <span key={factor} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {factor}
              </span>)}
          </div>
        </div>}
    </div>;
}