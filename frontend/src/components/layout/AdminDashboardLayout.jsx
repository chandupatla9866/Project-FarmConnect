import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { Navbar } from "./Navbar";
export function AdminDashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <AdminSidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onOpenMobileSidebar={() => setMobileOpen(true)} notificationsPath="/admin/notifications" profilePath="/admin/profile" />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>;
}