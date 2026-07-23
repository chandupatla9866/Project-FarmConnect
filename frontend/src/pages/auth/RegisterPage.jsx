import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Leaf, ArrowRight, Sprout, Building2, UtensilsCrossed, Check, Bike } from "lucide-react";
import { clsx } from "clsx";
import { Button } from "@/components/ui/Button";
import { Input, PasswordInput } from "@/components/ui/Input";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { extractErrorMessage } from "@/lib/apiClient";
import { resolveDashboardPath } from "@/utils/roles";
export default function RegisterPage() {
  const [role, setRole] = useState("FARMER");
  const [buyerType, setBuyerType] = useState("APARTMENT_COMMUNITY");
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register
  } = useAuth();
  const {
    showToast
  } = useToast();
  const navigate = useNavigate();
  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await register({
        fullName,
        email,
        password,
        phone,
        role,
        ...(role === "BUYER" ? {
          buyerType,
          businessName: businessName || fullName
        } : {})
      });
      if (role === "DELIVERY") {
        showToast({
          variant: "success",
          title: "Application submitted",
          description: "An admin will review your account before you can start claiming pickups."
        });
        navigate(resolveDashboardPath(res?.roles ?? ["ROLE_DELIVERY"]));
      } else {
        showToast({
          variant: "success",
          title: "Account created",
          description: "Welcome to FarmConnect!"
        });
        navigate("/onboarding/complete-profile");
      }
    } catch (error) {
      showToast({
        variant: "error",
        title: "Registration failed",
        description: extractErrorMessage(error)
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleGoogleSignup = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_BASE_URL}/oauth2/authorization/google`;
  };
  return <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-sunrise-50 px-4 py-12 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950">
      <motion.div initial={{
      opacity: 0,
      y: 16
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.4
    }} className="w-full max-w-md rounded-3xl border border-slate-200/70 bg-white/90 p-8 shadow-glass backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-soft">
            <Leaf className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-white">FarmConnect</span>
        </Link>

        <h1 className="text-center text-2xl font-bold text-slate-900 dark:text-white">Create your account</h1>
        <p className="mt-1 text-center text-sm text-slate-500 dark:text-slate-400">
          Sell direct as a farmer, order as a buyer, or apply to deliver.
        </p>

        <div className="mt-6 grid grid-cols-3 gap-2.5">
          <button type="button" onClick={() => setRole("FARMER")} className={clsx("flex flex-col items-center gap-1.5 rounded-xl border-2 px-2 py-3 transition-colors", role === "FARMER" ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10" : "border-slate-200 dark:border-slate-700")}>
            <Sprout className={clsx("h-5 w-5", role === "FARMER" ? "text-brand-600 dark:text-brand-400" : "text-slate-400")} />
            <span className={clsx("text-sm font-semibold", role === "FARMER" ? "text-brand-700 dark:text-brand-400" : "text-slate-500")}>
              Farmer
            </span>
            {role === "FARMER" && <Check className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />}
          </button>
          <button type="button" onClick={() => setRole("BUYER")} className={clsx("flex flex-col items-center gap-1.5 rounded-xl border-2 px-2 py-3 transition-colors", role === "BUYER" ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10" : "border-slate-200 dark:border-slate-700")}>
            <Building2 className={clsx("h-5 w-5", role === "BUYER" ? "text-brand-600 dark:text-brand-400" : "text-slate-400")} />
            <span className={clsx("text-sm font-semibold", role === "BUYER" ? "text-brand-700 dark:text-brand-400" : "text-slate-500")}>
              Buyer
            </span>
            {role === "BUYER" && <Check className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />}
          </button>
          <button type="button" onClick={() => setRole("DELIVERY")} className={clsx("flex flex-col items-center gap-1.5 rounded-xl border-2 px-2 py-3 transition-colors", role === "DELIVERY" ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10" : "border-slate-200 dark:border-slate-700")}>
            <Bike className={clsx("h-5 w-5", role === "DELIVERY" ? "text-brand-600 dark:text-brand-400" : "text-slate-400")} />
            <span className={clsx("text-sm font-semibold", role === "DELIVERY" ? "text-brand-700 dark:text-brand-400" : "text-slate-500")}>
              Delivery
            </span>
            {role === "DELIVERY" && <Check className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />}
          </button>
        </div>

        {role === "DELIVERY" && <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
            Delivery accounts need admin approval before you can start claiming pickups.
          </p>}

        {role === "BUYER" && <div className="mt-3 grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setBuyerType("APARTMENT_COMMUNITY")} className={clsx("flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-colors", buyerType === "APARTMENT_COMMUNITY" ? "border-brand-400 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400" : "border-slate-200 text-slate-500 dark:border-slate-700")}>
              <Building2 className="h-3.5 w-3.5" /> Apartment Community
            </button>
            <button type="button" onClick={() => setBuyerType("RESTAURANT")} className={clsx("flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-colors", buyerType === "RESTAURANT" ? "border-brand-400 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400" : "border-slate-200 text-slate-500 dark:border-slate-700")}>
              <UtensilsCrossed className="h-3.5 w-3.5" /> Restaurant
            </button>
          </div>}

        <button onClick={handleGoogleSignup} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
          <GoogleIcon />
          Continue with Google
        </button>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          <span className="text-xs uppercase text-slate-400">or</span>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label={role === "BUYER" ? "Contact name" : "Full name"} required value={fullName} onChange={e => setFullName(e.target.value)} placeholder={role === "BUYER" ? "Priya Sharma" : "Ramesh Patil"} />
          {role === "BUYER" && <Input label={buyerType === "RESTAURANT" ? "Restaurant name" : "Community name"} value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder={buyerType === "RESTAURANT" ? "Spice Route Restaurant" : "Green Meadows Apartments"} />}
          <Input label="Email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
          <Input label="Phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="98765 00000" />
          <PasswordInput label="Password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" />
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Create account <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>;
}