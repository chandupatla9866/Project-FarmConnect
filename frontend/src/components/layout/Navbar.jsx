import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, Bell, ChevronDown, LogOut, UserCircle, ShoppingCart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { notificationApi } from "@/lib/api/notificationApi";
export function Navbar({
  onOpenMobileSidebar,
  notificationsPath = "/farmer/notifications",
  profilePath = "/farmer/profile",
  cartPath
}) {
  const {
    user,
    logout
  } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const cart = useCart();
  const {
    data: unreadCount
  } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: notificationApi.unreadCount,
    refetchInterval: 30_000
  });
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md sm:px-6 dark:border-slate-800 dark:bg-slate-950/80">
      <button onClick={onOpenMobileSidebar} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800">
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeToggle />

        {cartPath && <Link to={cartPath} className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800">
            <ShoppingCart className="h-4 w-4" />
            {cart.totalItems > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
                {cart.totalItems > 9 ? "9+" : cart.totalItems}
              </span>}
          </Link>}

        <Link to={notificationsPath} className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800">
          <Bell className="h-4 w-4" />
          {!!unreadCount && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-sunrise-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>}
        </Link>

        <div className="relative" ref={menuRef}>
          <button onClick={() => setMenuOpen(v => !v)} className="flex items-center gap-2 rounded-lg border border-slate-200 py-1.5 pl-1.5 pr-2.5 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
            {user?.profileImageUrl ? <img src={user.profileImageUrl} alt="" className="h-7 w-7 rounded-full object-cover" /> : <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-500/20 dark:text-brand-400">
                {user?.fullName?.charAt(0)?.toUpperCase() ?? "F"}
              </div>}
            <span className="hidden text-sm font-medium text-slate-700 sm:block dark:text-slate-200">
              {user?.fullName?.split(" ")[0]}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {menuOpen && <div className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-soft-lg dark:border-slate-700 dark:bg-slate-900">
              <Link to={profilePath} onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3.5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                <UserCircle className="h-4 w-4" /> Profile
              </Link>
              <button onClick={logout} className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>}
        </div>
      </div>
    </header>;
}