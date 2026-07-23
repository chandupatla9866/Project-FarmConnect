import { NavLink } from "react-router-dom";
import { LayoutDashboard, Sprout, Building2, ShoppingBasket, ClipboardList, Truck, Bike, BarChart3, X, Leaf } from "lucide-react";
import { clsx } from "clsx";
const NAV_ITEMS = [{
  to: "/admin/dashboard",
  label: "Dashboard",
  icon: LayoutDashboard,
  end: true
}, {
  to: "/admin/farmers",
  label: "Manage Farmers",
  icon: Sprout
}, {
  to: "/admin/delivery-partners",
  label: "Delivery Partners",
  icon: Bike
}, {
  to: "/admin/buyers",
  label: "Manage Buyers",
  icon: Building2
}, {
  to: "/admin/products",
  label: "Manage Products",
  icon: ShoppingBasket
}, {
  to: "/admin/orders",
  label: "Manage Orders",
  icon: ClipboardList
}, {
  to: "/admin/deliveries",
  label: "Manage Deliveries",
  icon: Truck
}, {
  to: "/admin/analytics",
  label: "Analytics",
  icon: BarChart3
}];
const linkClasses = active => clsx("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors", active ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800");
export function AdminSidebar({
  mobileOpen,
  onCloseMobile
}) {
  const content = <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 py-5">
        <NavLink to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-soft">
            <Leaf className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-lg font-bold leading-tight text-slate-900 dark:text-white">FarmConnect</span>
            <span className="block text-[10px] font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
              Admin
            </span>
          </div>
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