import { useState } from "react";
import { Outlet } from "react-router-dom";
import { BuyerSidebar } from "./BuyerSidebar";
import { Navbar } from "./Navbar";
export function BuyerDashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <BuyerSidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onOpenMobileSidebar={() => setMobileOpen(true)} notificationsPath="/buyer/notifications" profilePath="/buyer/profile" cartPath="/buyer/cart" />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>;
}