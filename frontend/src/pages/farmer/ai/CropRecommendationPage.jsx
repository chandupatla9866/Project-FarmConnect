import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Sprout, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { aiApi } from "@/lib/api/aiApi";
import { extractErrorMessage } from "@/lib/apiClient";
const SOIL_TYPES = ["loamy", "clay", "sandy", "black"];
const SEASONS = ["summer", "winter", "monsoon"];
const WATER_LEVELS = ["low", "medium", "high"];
export default function CropRecommendationPage() {
  const [soilType, setSoilType] = useState("loamy");
  const [region, setRegion] = useState("Pune");
  const [season, setSeason] = useState("summer");
  const [farmSizeAcres, setFarmSizeAcres] = useState("");
  const [waterAvailability, setWaterAvailability] = useState("medium");
  const [result, setResult] = useState(null);
  const {
    showToast
  } = useToast();
  const mutation = useMutation({
    mutationFn: () => aiApi.recommendCrop({
      soilType,
      region,
      season,
      farmSizeAcres: farmSizeAcres ? Number(farmSizeAcres) : undefined,
      waterAvailability
    }),
    onSuccess: setResult,
    onError: error => showToast({
      variant: "error",
      title: "Recommendation failed",
      description: extractErrorMessage(error)
    })
  });
  const handleSubmit = e => {
    e.preventDefault();
    mutation.mutate();
  };
  return <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
          <Sprout className="h-6 w-6 text-brand-600" /> Crop Recommendation
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Find the most profitable crops for your soil, region and season.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-slate-200/70 bg-white p-6 shadow-soft sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-900">
        <Select label="Soil type" value={soilType} onChange={e => setSoilType(e.target.value)}>
          {SOIL_TYPES.map(s => <option key={s} value={s}>
              {s[0].toUpperCase() + s.slice(1)}
            </option>)}
        </Select>
        <Input label="Region" required value={region} onChange={e => setRegion(e.target.value)} />
        <Select label="Season" value={season} onChange={e => setSeason(e.target.value)}>
          {SEASONS.map(s => <option key={s} value={s}>
              {s[0].toUpperCase() + s.slice(1)}
            </option>)}
        </Select>
        <Select label="Water availability" value={waterAvailability} onChange={e => setWaterAvailability(e.target.value)}>
          {WATER_LEVELS.map(w => <option key={w} value={w}>
              {w[0].toUpperCase() + w.slice(1)}
            </option>)}
        </Select>
        <Input label="Farm size (acres, optional)" type="number" step="0.1" value={farmSizeAcres} onChange={e => setFarmSizeAcres(e.target.value)} />
        <div className="flex items-end">
          <Button type="submit" isLoading={mutation.isPending} className="w-full sm:w-auto">
            <Sparkles className="h-4 w-4" /> Get Recommendations
          </Button>
        </div>
      </form>

      {result && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {result.recommendedCrops.map((crop, i) => <div key={crop.cropName} className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-bold text-brand-700 dark:bg-brand-500/15 dark:text-brand-400">
                  #{i + 1} Pick
                </span>
                <span className="text-sm font-bold text-brand-700 dark:text-brand-400">
                  {crop.suitabilityScore.toFixed(0)}% match
                </span>
              </div>
              <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">{crop.cropName}</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{crop.reason}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-sm dark:border-slate-800">
                <div>
                  <p className="text-xs text-slate-400">Expected yield</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">
                    {crop.expectedYieldPerAcre.toLocaleString("en-IN")} /acre
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Market price</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">
                    ₹{crop.expectedMarketPricePerUnit}/unit
                  </p>
                </div>
              </div>
            </div>)}
        </div>}
    </div>;
}