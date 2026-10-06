import React from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getSiteSettings } from "@/lib/services/site-setting-dal";

export default async function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <div className="flex min-h-screen flex-col bg-(--background)">
      <Header settings={settings} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
    </div>
  );
}
