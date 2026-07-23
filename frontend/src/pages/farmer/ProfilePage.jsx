import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, Clock, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { LocationMap } from "@/components/ui/LocationMap";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { farmerApi } from "@/lib/api/farmerApi";
import { extractErrorMessage } from "@/lib/apiClient";
export default function ProfilePage() {
  const {
    showToast
  } = useToast();
  const queryClient = useQueryClient();
  const {
    data: profile,
    isLoading
  } = useQuery({
    queryKey: ["farmer", "profile"],
    queryFn: farmerApi.getProfile
  });
  const [form, setForm] = useState({});
  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.fullName,
        phone: profile.phone ?? "",
        farmName: profile.farmName,
        farmAddress: profile.farmAddress ?? "",
        farmCity: profile.farmCity ?? "",
        farmState: profile.farmState ?? "",
        farmPincode: profile.farmPincode ?? "",
        farmSizeAcres: profile.farmSizeAcres ?? undefined,
        farmingExperienceYears: profile.farmingExperienceYears ?? undefined,
        primaryCropTypes: profile.primaryCropTypes ?? "",
        bio: profile.bio ?? "",
        farmLatitude: profile.farmLatitude ?? undefined,
        farmLongitude: profile.farmLongitude ?? undefined
      });
    }
  }, [profile]);
  const mutation = useMutation({
    mutationFn: () => farmerApi.updateProfile(form),
    onSuccess: () => {
      showToast({
        variant: "success",
        title: "Profile updated"
      });
      queryClient.invalidateQueries({
        queryKey: ["farmer", "profile"]
      });
    },
    onError: error => showToast({
      variant: "error",
      title: "Update failed",
      description: extractErrorMessage(error)
    })
  });
  const handleSubmit = e => {
    e.preventDefault();
    mutation.mutate();
  };
  if (isLoading || !profile) {
    return <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>;
  }
  return <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-2xl font-bold text-brand-700 dark:bg-brand-500/15 dark:text-brand-400">
          {profile.fullName.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{profile.fullName}</h1>
            {profile.verified ? <span className="flex items-center gap-1 rounded-full bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-400">
                <BadgeCheck className="h-3.5 w-3.5" /> Verified
              </span> : <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
                <Clock className="h-3.5 w-3.5" /> Pending verification
              </span>}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{profile.email}</p>
          {!profile.verified && <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
              Your products stay hidden from buyers until an admin verifies your account.
            </p>}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
            <User className="h-4 w-4" /> Personal Details
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Full name" value={form.fullName ?? ""} onChange={e => setForm({
            ...form,
            fullName: e.target.value
          })} />
            <Input label="Phone" value={form.phone ?? ""} onChange={e => setForm({
            ...form,
            phone: e.target.value
          })} />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
            <MapPin className="h-4 w-4" /> Farm Details
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Farm name" value={form.farmName ?? ""} onChange={e => setForm({
            ...form,
            farmName: e.target.value
          })} />
            <Input label="Primary crop types" placeholder="Tomato, Brinjal, Okra" value={form.primaryCropTypes ?? ""} onChange={e => setForm({
            ...form,
            primaryCropTypes: e.target.value
          })} />
            <Input label="Farm address" className="sm:col-span-2" value={form.farmAddress ?? ""} onChange={e => setForm({
            ...form,
            farmAddress: e.target.value
          })} />
            <Input label="City" value={form.farmCity ?? ""} onChange={e => setForm({
            ...form,
            farmCity: e.target.value
          })} />
            <Input label="State" value={form.farmState ?? ""} onChange={e => setForm({
            ...form,
            farmState: e.target.value
          })} />
            <Input label="Pincode" value={form.farmPincode ?? ""} onChange={e => setForm({
            ...form,
            farmPincode: e.target.value
          })} />
            <Input label="Farm size (acres)" type="number" step="0.1" value={form.farmSizeAcres ?? ""} onChange={e => setForm({
            ...form,
            farmSizeAcres: e.target.value ? Number(e.target.value) : undefined
          })} />
            <Input label="Farming experience (years)" type="number" value={form.farmingExperienceYears ?? ""} onChange={e => setForm({
            ...form,
            farmingExperienceYears: e.target.value ? Number(e.target.value) : undefined
          })} />
          </div>
          <div className="mt-4">
            <Textarea label="Bio" placeholder="Tell buyers about your farm..." value={form.bio ?? ""} onChange={e => setForm({
            ...form,
            bio: e.target.value
          })} />
          </div>

          <div className="mt-4">
            <p className="mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">Farm location</p>
            <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
              Auto-detected from your address above (used for weather alerts &amp; delivery matching). Update the
              address and save to relocate the pin.
            </p>
            <LocationMap markers={profile.farmLatitude != null && profile.farmLongitude != null ? [{
            lat: Number(profile.farmLatitude),
            lng: Number(profile.farmLongitude),
            label: "Farm"
          }] : []} />
          </div>
        </section>

        <div className="flex justify-end">
          <Button type="submit" isLoading={mutation.isPending}>
            Save changes
          </Button>
        </div>
      </form>
    </div>;
}