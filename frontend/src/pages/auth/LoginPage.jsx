import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Leaf, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, PasswordInput } from "@/components/ui/Input";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { extractErrorMessage } from "@/lib/apiClient";
import { resolveDashboardPath } from "@/utils/roles";
export default function LoginPage() {
  const [email, setEmail] = useState("farmer1@farmconnect.ai");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    login
  } = useAuth();
  const {
    showToast
  } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    if (searchParams.get("oauth_error")) {
      showToast({
        variant: "error",
        title: "Google sign-in failed",
        description: "We couldn't complete that Google sign-in. Please try again or use email/password."
      });
      setSearchParams(prev => {
        prev.delete("oauth_error");
        return prev;
      }, {
        replace: true
      });
    }
  }, []);
  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const user = await login({
        email,
        password
      });
      navigate(resolveDashboardPath(user.roles));
    } catch (error) {
      showToast({
        variant: "error",
        title: "Login failed",
        description: extractErrorMessage(error)
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleGoogleLogin = () => {
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

        <h1 className="text-center text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h1>
        <p className="mt-1 text-center text-sm text-slate-500 dark:text-slate-400">
          Log in to manage your farm, orders and AI insights.
        </p>

        <button onClick={handleGoogleLogin} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
          <GoogleIcon />
          Continue with Google
        </button>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          <span className="text-xs uppercase text-slate-400">or</span>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
          <PasswordInput label="Password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Log in <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        <p className="mt-6 rounded-xl bg-slate-50 p-3 text-center text-xs text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
          Demo farmer login: <strong>farmer1@farmconnect.ai</strong> / <strong>Farmer@123</strong>
        </p>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>;
}