import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, LocateFixed, Loader2, MapPin, UtensilsCrossed, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LocationMap } from "@/components/ui/LocationMap";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { buyerApi } from "@/lib/api/buyerApi";
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
    queryKey: ["buyer", "profile"],
    queryFn: buyerApi.getProfile
  });
  const [form, setForm] = useState({});
  const [detecting, setDetecting] = useState(false);
  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.fullName,
        phone: profile.phone ?? "",
        businessName: profile.businessName,
        deliveryAddress: profile.deliveryAddress ?? "",
        city: profile.city ?? "",
        state: profile.state ?? "",
        pincode: profile.pincode ?? "",
        gstNumber: profile.gstNumber ?? ""
      });
    }
  }, [profile]);
  const detectLocation = () => {
    if (!navigator.geolocation) {
      showToast({
        variant: "error",
        title: "Not supported",
        description: "Your browser doesn't support location detection."
      });
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(async position => {
      const {
        latitude,
        longitude
      } = position.coords;
      setForm(f => ({
        ...f,
        latitude,
        longitude
      }));
      if (window.google?.maps?.Geocoder) {
        try {
          const geocoder = new window.google.maps.Geocoder();
          const {
            results
          } = await geocoder.geocode({
            location: {
              lat: latitude,
              lng: longitude
            }
          });
          const result = results?.[0];
          if (result) {
            const component = type => result.address_components.find(c => c.types.includes(type))?.long_name ?? "";
            setForm(f => ({
              ...f,
              deliveryAddress: result.formatted_address,
              city: component("locality") || component("administrative_area_level_2"),
              state: component("administrative_area_level_1"),
              pincode: component("postal_code")
            }));
          }
        } catch {
          // Reverse geocoding failed - coordinates are still captured, address fields just stay as typed.
        }
      }
      setDetecting(false);
      showToast({
        variant: "success",
        title: "Location detected"
      });
    }, error => {
      setDetecting(false);
      showToast({
        variant: "error",
        title: "Couldn't detect location",
        description: error.code === error.PERMISSION_DENIED ? "Location access was denied. Enable it in your browser settings and try again." : "Please try again or enter your address manually."
      });
    }, {
      enableHighAccuracy: true,
      timeout: 10000
    });
  };
  const mutation = useMutation({
    mutationFn: () => buyerApi.updateProfile(form),
    onSuccess: () => {
      showToast({
        variant: "success",
        title: "Profile updated"
      });
      queryClient.invalidateQueries({
        queryKey: ["buyer", "profile"]
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
  const TypeIcon = profile.buyerType === "RESTAURANT" ? UtensilsCrossed : Building2;
  return <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-2xl font-bold text-brand-700 dark:bg-brand-500/15 dark:text-brand-400">
          {profile.fullName.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{profile.businessName}</h1>
            <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <TypeIcon className="h-3 w-3" /> {profile.buyerType === "RESTAURANT" ? "Restaurant" : "Apartment Community"}
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{profile.email}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
            <User className="h-4 w-4" /> Contact Details
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Contact name" value={form.fullName ?? ""} onChange={e => setForm({
            ...form,
            fullName: e.target.value
          })} />
            <Input label="Phone" value={form.phone ?? ""} onChange={e => setForm({
            ...form,
            phone: e.target.value
          })} />
            <Input label={profile.buyerType === "RESTAURANT" ? "Restaurant name" : "Community name"} className="sm:col-span-2" value={form.businessName ?? ""} onChange={e => setForm({
            ...form,
            businessName: e.target.value
          })} />
            {profile.buyerType === "RESTAURANT" && <Input label="GST number (optional)" value={form.gstNumber ?? ""} onChange={e => setForm({
            ...form,
            gstNumber: e.target.value
          })} />}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
              <MapPin className="h-4 w-4" /> Delivery Location
            </h2>
            <Button type="button" variant="outline" size="sm" onClick={detectLocation} disabled={detecting}>
              {detecting ? <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Detecting...
                </> : <>
                  <LocateFixed className="h-3.5 w-3.5" /> Detect my location
                </>}
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Delivery address" className="sm:col-span-2" value={form.deliveryAddress ?? ""} onChange={e => setForm({
            ...form,
            deliveryAddress: e.target.value
          })} />
            <Input label="City" value={form.city ?? ""} onChange={e => setForm({
            ...form,
            city: e.target.value
          })} />
            <Input label="State" value={form.state ?? ""} onChange={e => setForm({
            ...form,
            state: e.target.value
          })} />
            <Input label="Pincode" value={form.pincode ?? ""} onChange={e => setForm({
            ...form,
            pincode: e.target.value
          })} />
          </div>

          <div className="mt-4">
            <p className="mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">Delivery location</p>
            <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
              {form.latitude != null ? "Detected just now - save to apply it." : "Auto-detected from your address above (used to find nearby farmers). Update the address and save to relocate the pin, or use “Detect my location” for a precise GPS fix."}
            </p>
            <LocationMap markers={form.latitude != null && form.longitude != null ? [{
            lat: Number(form.latitude),
            lng: Number(form.longitude),
            label: "You"
          }] : profile.latitude != null && profile.longitude != null ? [{
            lat: Number(profile.latitude),
            lng: Number(profile.longitude),
            label: "You"
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