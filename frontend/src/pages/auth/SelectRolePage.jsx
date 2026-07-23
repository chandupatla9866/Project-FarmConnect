import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Leaf, Sprout, Building2, Bike, ArrowRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { authApi } from "@/lib/api/authApi";
import { extractErrorMessage } from "@/lib/apiClient";
import { resolveDashboardPath } from "@/utils/roles";
export default function SelectRolePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [isSubmitting, setIsSubmitting] = useState(null);
  const {
    applyAuthResponse,
    user
  } = useAuth();
  const {
    showToast
  } = useToast();
  const navigate = useNavigate();
  const handleContinue = async role => {
    if (!token) return;
    setIsSubmitting(role);
    try {
      const payload = role === "FARMER" ? {
        role: "FARMER"
      } : role === "DELIVERY" ? {
        role: "DELIVERY"
      } : {
        role: "BUYER",
        buyerType: "APARTMENT_COMMUNITY",
        businessName: user?.fullName
      };
      const res = await authApi.selectRole(token, payload);
      applyAuthResponse(res);
      if (role === "DELIVERY") {
        showToast({
          variant: "success",
          title: "Application submitted",
          description: "An admin will review your account before you can start claiming pickups."
        });
        navigate(resolveDashboardPath(res?.user?.roles ?? ["ROLE_DELIVERY"]));
      } else {
        showToast({
          variant: "success",
          title: "Welcome to FarmConnect!"
        });
        navigate("/onboarding/complete-profile");
      }
    } catch (error) {
      showToast({
        variant: "error",
        title: "Setup failed",
        description: extractErrorMessage(error)
      });
    } finally {
      setIsSubmitting(null);
    }
  };
  if (!token) {
    return <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-6 text-center dark:bg-slate-950">
        <AlertTriangle className="h-8 w-8 text-red-500" />
        <p className="max-w-sm text-sm text-slate-600 dark:text-slate-300">
          This link is missing an onboarding token. Please sign in with Google again.
        </p>
        <Link to="/login">
          <Button variant="outline">Back to login</Button>
        </Link>
      </div>;
  }
  return <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-sunrise-50 px-4 py-12 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950">
      <div className="w-full max-w-md rounded-3xl border border-slate-200/70 bg-white/90 p-8 text-center shadow-glass backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white shadow-soft">
          <Leaf className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">One last step</h1>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
          Tell us how you&apos;ll use FarmConnect so we can set up your dashboard.
        </p>

        <button onClick={() => handleContinue("FARMER")} disabled={isSubmitting !== null} className="mt-6 flex w-full items-center gap-4 rounded-2xl border-2 border-brand-500 bg-brand-50 p-4 text-left transition-transform hover:scale-[1.01] disabled:opacity-60 dark:bg-brand-500/10">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Sprout className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-900 dark:text-white">I&apos;m a Farmer</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Sell produce directly to buyers</p>
          </div>
          {isSubmitting === "FARMER" ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" /> : <ArrowRight className="h-5 w-5 text-brand-600 dark:text-brand-400" />}
        </button>

        <button onClick={() => handleContinue("BUYER")} disabled={isSubmitting !== null} className="mt-3 flex w-full items-center gap-4 rounded-2xl border-2 border-sunrise-400 bg-sunrise-50/60 p-4 text-left transition-transform hover:scale-[1.01] disabled:opacity-60 dark:bg-sunrise-500/10">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sunrise-500 text-white">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-900 dark:text-white">I&apos;m a Buyer</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Order fresh produce for my community or restaurant</p>
          </div>
          {isSubmitting === "BUYER" ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-sunrise-500 border-t-transparent" /> : <ArrowRight className="h-5 w-5 text-sunrise-500" />}
        </button>

        <button onClick={() => handleContinue("DELIVERY")} disabled={isSubmitting !== null} className="mt-3 flex w-full items-center gap-4 rounded-2xl border-2 border-slate-300 bg-slate-50 p-4 text-left transition-transform hover:scale-[1.01] disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800/60">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-700 text-white">
            <Bike className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-900 dark:text-white">I&apos;m a Delivery Partner</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Claim pickups and earn per delivery (admin approval required)</p>
          </div>
          {isSubmitting === "DELIVERY" ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-transparent" /> : <ArrowRight className="h-5 w-5 text-slate-600 dark:text-slate-300" />}
        </button>
      </div>
    </div>;
}