import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Leaf, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { farmerApi } from "@/lib/api/farmerApi";
import { buyerApi } from "@/lib/api/buyerApi";
import { extractErrorMessage } from "@/lib/apiClient";
import { resolveDashboardPath } from "@/utils/roles";
export default function CompleteProfilePage() {
  const {
    user
  } = useAuth();
  const {
    showToast
  } = useToast();
  const navigate = useNavigate();
  const isFarmer = user?.roles.includes("ROLE_FARMER");
  const [farmName, setFarmName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const goToDashboard = () => navigate(resolveDashboardPath(user?.roles ?? []));
  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isFarmer) {
        await farmerApi.updateProfile({
          farmName: farmName || undefined,
          farmAddress: address,
          farmCity: city,
          farmState: state,
          farmPincode: pincode
        });
      } else {
        await buyerApi.updateProfile({
          deliveryAddress: address,
          city,
          state,
          pincode
        });
      }
      showToast({
        variant: "success",
        title: "Profile completed"
      });
      goToDashboard();
    } catch (error) {
      showToast({
        variant: "error",
        title: "Couldn't save profile",
        description: extractErrorMessage(error)
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-sunrise-50 px-4 py-12 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950">
      <div className="w-full max-w-md rounded-3xl border border-slate-200/70 bg-white/90 p-8 shadow-glass backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white shadow-soft">
          <MapPin className="h-6 w-6" />
        </div>
        <h1 className="text-center text-2xl font-bold text-slate-900 dark:text-white">
          {isFarmer ? "Where's your farm?" : "Where should we deliver?"}
        </h1>
        <p className="mt-1.5 text-center text-sm text-slate-500 dark:text-slate-400">
          {isFarmer ? "Helps buyers find you nearby and unlocks weather alerts right away." : "Helps you discover farms near you and speeds up checkout."}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {isFarmer && <Input label="Farm name" value={farmName} onChange={e => setFarmName(e.target.value)} placeholder="Patil Organic Farms" />}
          <Input label={isFarmer ? "Farm address" : "Delivery address"} value={address} onChange={e => setAddress(e.target.value)} placeholder={isFarmer ? "Village Wagholi, Pune-Nagar Road" : "Flat 4B, Green Meadows, FC Road"} />
          <div className="grid grid-cols-3 gap-3">
            <Input label="City" value={city} onChange={e => setCity(e.target.value)} placeholder="Pune" />
            <Input label="State" value={state} onChange={e => setState(e.target.value)} placeholder="Maharashtra" />
            <Input label="Pincode" value={pincode} onChange={e => setPincode(e.target.value)} placeholder="412207" />
          </div>

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            <Leaf className="h-4 w-4" /> Save &amp; continue
          </Button>
          <button type="button" onClick={goToDashboard} className="w-full text-center text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">
            Skip for now
          </button>
        </form>
      </div>
    </div>;
}