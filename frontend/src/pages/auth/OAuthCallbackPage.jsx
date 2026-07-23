import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Loader2, AlertTriangle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { resolveDashboardPath } from "@/utils/roles";
export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    loginWithToken
  } = useAuth();
  const [error, setError] = useState(null);
  const hasRun = useRef(false);
  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    const token = searchParams.get("token");
    if (!token) {
      setError("Missing authentication token from the OAuth redirect.");
      return;
    }
    loginWithToken(token).then(user => navigate(resolveDashboardPath(user.roles), {
      replace: true
    })).catch(() => setError("We couldn't complete Google sign-in. Please try again."));
  }, [searchParams, loginWithToken, navigate]);
  if (error) {
    return <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-6 text-center dark:bg-slate-950">
        <AlertTriangle className="h-8 w-8 text-red-500" />
        <p className="max-w-sm text-sm text-slate-600 dark:text-slate-300">{error}</p>
        <Link to="/login">
          <Button variant="outline">Back to login</Button>
        </Link>
      </div>;
  }
  return <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-slate-950">
      <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
      <p className="text-sm text-slate-500 dark:text-slate-400">Completing sign-in...</p>
    </div>;
}