import React from "react";
import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/services/site-setting-dal";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";

export const metadata: Metadata = {
  title: "إعدادات وهوية الموقع | لوحة التحكم - مسامر",
  description: "إدارة هوية الموقع، شعار المنصة، بيانات التواصل، نصوص الواجهة والفوتر، وإعدادات السيو",
};

export const dynamic = "force-dynamic";

export default async function AdminSiteSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          إعدادات وهوية الموقع
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          تحكم بهوية المنصة، الشعار، أرقام التواصل، روابط الشبكات الاجتماعية، نصوص الواجهة والفوتر، وإعدادات السيو.
        </p>
      </div>

      <SiteSettingsForm initialData={settings} />
    </div>
  );
}
