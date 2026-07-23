import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Navigation, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { deliveryApi } from "@/lib/api/deliveryApi";
import { extractErrorMessage } from "@/lib/apiClient";
export default function DeliveryDetailPage() {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const {
    showToast
  } = useToast();
  const queryClient = useQueryClient();
  const [otp, setOtp] = useState("");
  const {
    data: delivery,
    isLoading
  } = useQuery({
    queryKey: ["delivery", id],
    queryFn: () => deliveryApi.get(id),
    enabled: !!id
  });
  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: ["delivery"]
    });
  };
  const claimMutation = useMutation({
    mutationFn: () => deliveryApi.claim(id),
    onSuccess: () => {
      showToast({
        variant: "success",
        title: "Pickup claimed!"
      });
      invalidate();
    },
    onError: error => showToast({
      variant: "error",
      title: "Failed",
      description: extractErrorMessage(error)
    })
  });
  const pickedUpMutation = useMutation({
    mutationFn: () => deliveryApi.markPickedUp(id),
    onSuccess: () => {
      showToast({
        variant: "success",
        title: "Marked as picked up"
      });
      invalidate();
    },
    onError: error => showToast({
      variant: "error",
      title: "Failed",
      description: extractErrorMessage(error)
    })
  });
  const completeMutation = useMutation({
    mutationFn: () => deliveryApi.complete(id, otp),
    onSuccess: () => {
      showToast({
        variant: "success",
        title: "Delivery completed!",
        description: "Payment marked as received."
      });
      invalidate();
    },
    onError: error => showToast({
      variant: "error",
      title: "Invalid OTP",
      description: extractErrorMessage(error)
    })
  });
  const handleOtpSubmit = e => {
    e.preventDefault();
    completeMutation.mutate();
  };
  if (isLoading) {
    return <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>;
  }
  if (!delivery) return null;
  return <div className="mx-auto max-w-2xl space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">{delivery.orderNumber}</h1>
              <StatusBadge status={delivery.status} />
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {delivery.farmName} &rarr; {delivery.buyerBusinessName}
            </p>
          </div>
          <p className="text-2xl font-extrabold text-brand-700 dark:text-brand-400">
            ₹{delivery.deliveryFee?.toFixed(2) ?? "—"}
          </p>
        </div>

        <div className="mt-5 grid gap-4 border-y border-slate-100 py-5 sm:grid-cols-2 dark:border-slate-800">
          <div className="flex items-start gap-2.5">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
            <div>
              <p className="text-xs text-slate-400">Pickup from</p>
              <p className="text-sm text-slate-700 dark:text-slate-200">{delivery.pickupAddress ?? "Not specified"}</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Navigation className="mt-0.5 h-4 w-4 shrink-0 text-sunrise-500" />
            <div>
              <p className="text-xs text-slate-400">Deliver to</p>
              <p className="text-sm text-slate-700 dark:text-slate-200">{delivery.dropAddress ?? "Not specified"}</p>
            </div>
          </div>
        </div>

        {delivery.estimatedDistanceKm != null && <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Estimated distance: <strong>{delivery.estimatedDistanceKm} km</strong>
          </p>}

        <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
          {!delivery.claimed && <Button className="w-full" isLoading={claimMutation.isPending} onClick={() => claimMutation.mutate()}>
              Claim this pickup
            </Button>}

          {delivery.claimed && delivery.status === "ASSIGNED" && <Button className="w-full" isLoading={pickedUpMutation.isPending} onClick={() => pickedUpMutation.mutate()}>
              Mark as Picked Up
            </Button>}

          {delivery.claimed && (delivery.status === "PICKED_UP" || delivery.status === "IN_TRANSIT") && <form onSubmit={handleOtpSubmit} className="space-y-3">
              <div className="flex items-center gap-2 rounded-xl bg-brand-50 p-3 text-sm text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                Ask the buyer for their delivery OTP to confirm drop-off.
              </div>
              <Input label="Delivery OTP" required maxLength={4} value={otp} onChange={e => setOtp(e.target.value)} placeholder="4-digit code" />
              <Button type="submit" className="w-full" isLoading={completeMutation.isPending}>
                Confirm Delivery
              </Button>
            </form>}

          {delivery.status === "DELIVERED" && <div className="rounded-xl bg-emerald-50 p-4 text-center text-sm font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
              Delivery completed successfully!
            </div>}
        </div>
      </div>
    </div>;
}