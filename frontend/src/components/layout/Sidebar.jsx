import { NavLink } from "react-router-dom";
import { LayoutDashboard, Sprout, ClipboardList, BarChart3, Bell, UserCircle, Brain, X, Leaf } from "lucide-react";
import { clsx } from "clsx";
const NAV_ITEMS = [{
  to: "/farmer/dashboard",
  label: "Dashboard",
  icon: LayoutDashboard,
  end: true
}, {
  to: "/farmer/products",
  label: "Products",
  icon: Sprout
}, {
  to: "/farmer/orders",
  label: "Orders",
  icon: ClipboardList
}, {
  to: "/farmer/analytics",
  label: "Analytics",
  icon: BarChart3
}];
const AI_ITEMS = [{
  to: "/farmer/ai/demand",
  label: "Demand Prediction"
}, {
  to: "/farmer/ai/crop-recommendation",
  label: "Crop Recommendation"
}, {
  to: "/farmer/ai/price-prediction",
  label: "Price Prediction"
}, {
  to: "/farmer/ai/disease-detection",
  label: "Disease Detection"
}, {
  to: "/farmer/ai/weather",
  label: "Weather Alerts"
}];
const BOTTOM_ITEMS = [{
  to: "/farmer/notifications",
  label: "Notifications",
  icon: Bell
}, {
  to: "/farmer/profile",
  label: "Profile",
  icon: UserCircle
}];
const linkClasses = active => clsx("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors", active ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800");
export function Sidebar({
  mobileOpen,
  onCloseMobile
}) {
  const content = <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 py-5">
        <NavLink to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-soft">
            <Leaf className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold text-slate-900 dark:text-white">FarmConnect</span>
        </NavLink>
        <button onClick={onCloseMobile} className="rounded-lg p-1 text-slate-400 lg:hidden">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto px-3">
        {NAV_ITEMS.map(item => <NavLink key={item.to} to={item.to} end={item.end} className={({
        isActive
      }) => linkClasses(isActive)}>
            <item.icon className="h-[18px] w-[18px]" />
            {item.label}
          </NavLink>)}

        <div className="pt-4">
          <p className="flex items-center gap-2 px-3 pb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <Brain className="h-3.5 w-3.5" /> AI Features
          </p>
          {AI_ITEMS.map(item => <NavLink key={item.to} to={item.to} className={({
          isActive
        }) => linkClasses(isActive)}>
              <span className="ml-[26px] text-sm">{item.label}</span>
            </NavLink>)}
        </div>

        <div className="pt-4">
          {BOTTOM_ITEMS.map(item => <NavLink key={item.to} to={item.to} className={({
          isActive
        }) => linkClasses(isActive)}>
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
            </NavLink>)}
        </div>
      </nav>

      <div className="border-t border-slate-100 p-4 dark:border-slate-800">
        <p className="text-xs text-slate-400">FarmConnect &copy; {new Date().getFullYear()}</p>
      </div>
    </div>;
  return <>
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:flex dark:border-slate-800 dark:bg-slate-900">
        {content}
      </aside>

      <div className={clsx("fixed inset-0 z-40 lg:hidden", mobileOpen ? "pointer-events-auto" : "pointer-events-none")}>
        <div className={clsx("absolute inset-0 bg-slate-900/50 transition-opacity", mobileOpen ? "opacity-100" : "opacity-0")} onClick={onCloseMobile} />
        <aside className={clsx("absolute inset-y-0 left-0 w-72 bg-white shadow-xl transition-transform dark:bg-slate-900", mobileOpen ? "translate-x-0" : "-translate-x-full")}>
          {content}
        </aside>
      </div>
    </>;
}