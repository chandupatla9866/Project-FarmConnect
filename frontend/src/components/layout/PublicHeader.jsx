import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { resolveDashboardPath } from "@/utils/roles";
const NAV_LINKS = [{
  label: "Features",
  href: "/#features"
}, {
  label: "How It Works",
  href: "/#how-it-works"
}, {
  label: "AI Features",
  href: "/#ai-features"
}, {
  label: "FAQs",
  href: "/#faqs"
}, {
  label: "Contact",
  href: "/#contact"
}];
export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const {
    isAuthenticated,
    user
  } = useAuth();
  const navigate = useNavigate();
  const dashboardPath = resolveDashboardPath(user?.roles ?? []);
  return <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-md dark:border-slate-800/70 dark:bg-slate-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-soft">
            <Leaf className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold text-slate-900 dark:text-white">FarmConnect</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map(link => <a key={link.label} href={link.href} className="text-sm font-medium text-slate-600 transition-colors hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400">
              {link.label}
            </a>)}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {isAuthenticated ? <Button size="sm" onClick={() => navigate(dashboardPath)}>
              Go to Dashboard
            </Button> : <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
                Log in
              </Button>
              <Button size="sm" onClick={() => navigate("/register")}>
                Get Started
              </Button>
            </>}
        </div>

        <button onClick={() => setOpen(v => !v)} className="p-2 md:hidden">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && <div className="border-t border-slate-200 bg-white px-6 py-4 md:hidden dark:border-slate-800 dark:bg-slate-950">
          <nav className="flex flex-col gap-4">
            {NAV_LINKS.map(link => <a key={link.label} href={link.href} onClick={() => setOpen(false)} className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {link.label}
              </a>)}
            <div className="flex items-center gap-3 pt-2">
              <ThemeToggle />
              {isAuthenticated ? <Button size="sm" className="flex-1" onClick={() => navigate(dashboardPath)}>
                  Dashboard
                </Button> : <>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate("/login")}>
                    Log in
                  </Button>
                  <Button size="sm" className="flex-1" onClick={() => navigate("/register")}>
                    Get Started
                  </Button>
                </>}
            </div>
          </nav>
        </div>}
    </header>;
}