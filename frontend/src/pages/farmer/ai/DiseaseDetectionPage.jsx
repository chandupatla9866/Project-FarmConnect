import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ScanEye, ImagePlus, Sparkles, ShieldAlert, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { aiApi } from "@/lib/api/aiApi";
import { extractErrorMessage } from "@/lib/apiClient";
import { clsx } from "clsx";
const SEVERITY_META = {
  none: {
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-500/10"
  },
  low: {
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-50 dark:bg-sky-500/10"
  },
  medium: {
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-500/10"
  },
  high: {
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-500/10"
  }
};
export default function DiseaseDetectionPage() {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [result, setResult] = useState(null);
  const {
    showToast
  } = useToast();
  const mutation = useMutation({
    mutationFn: () => aiApi.detectDisease(imageFile),
    onSuccess: setResult,
    onError: error => showToast({
      variant: "error",
      title: "Detection failed",
      description: extractErrorMessage(error)
    })
  });
  const handleImageChange = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setResult(null);
  };
  const severity = result ? SEVERITY_META[result.severity] : null;
  return <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
          <ScanEye className="h-6 w-6 text-brand-600" /> Disease Detection
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Upload a photo of an affected plant leaf to get an instant diagnosis.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <label className="flex aspect-video w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800">
          {imagePreview ? <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" /> : <div className="flex flex-col items-center gap-2 text-slate-400">
              <ImagePlus className="h-8 w-8" />
              <span className="text-sm">Click to upload a crop photo</span>
              <span className="text-xs">JPEG, PNG or WEBP</span>
            </div>}
          <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageChange} />
        </label>

        <Button className="mt-5 w-full" disabled={!imageFile} isLoading={mutation.isPending} onClick={() => mutation.mutate()}>
          <Sparkles className="h-4 w-4" /> Analyze Photo
        </Button>
      </div>

      {result && severity && <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Detected condition</p>
              <p className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">{result.detectedCondition}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Likely crop: {result.affectedCropTypeGuess}
              </p>
            </div>
            <div className={clsx("flex items-center gap-1.5 rounded-full px-3.5 py-1.5", severity.bg)}>
              {result.severity === "none" ? <ShieldCheck className={clsx("h-4 w-4", severity.color)} /> : <ShieldAlert className={clsx("h-4 w-4", severity.color)} />}
              <span className={clsx("text-xs font-bold capitalize", severity.color)}>{result.severity} severity</span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full rounded-full bg-brand-500" style={{
            width: `${result.confidenceScore}%`
          }} />
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {result.confidenceScore.toFixed(0)}% confidence
            </span>
          </div>

          <div className="mt-5 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
            <p className="text-xs font-semibold uppercase text-slate-400">Recommended action</p>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{result.recommendedAction}</p>
          </div>
        </div>}
    </div>;
}