import React from "react";
import { requireAdmin } from "@/lib/auth/guardian";
import { AdminNav } from "@/components/admin/admin-nav";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <AdminNav adminName={admin.name} adminEmail={admin.email} />
      <div className="flex-1 md:mr-64 flex flex-col min-w-0">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
