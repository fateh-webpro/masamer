import React from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getSiteSettings } from "@/lib/services/site-setting-dal";
import { getActiveServices, getActiveServiceCategories } from "@/lib/services/service-dal";
import { RequestModalProvider } from "@/components/request/request-modal-provider";

export default async function WorksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, services, categories] = await Promise.all([
    getSiteSettings(),
    getActiveServices(),
    getActiveServiceCategories(),
  ]);

  return (
    <RequestModalProvider
      services={services.map(({ id, title, slug, icon, categoryId, category, options }) => ({
        id,
        title,
        slug,
        icon,
        categoryId,
        categoryName: category?.name,
        options: options?.map((o) => ({
          id: o.id,
          name: o.name,
          description: o.description,
          sortOrder: o.sortOrder,
        })),
      }))}
      categories={categories.map(({ id, name }) => ({ id, name }))}
      whatsapp={settings.whatsapp || settings.phone}
    >
    <div className="flex min-h-screen flex-col bg-(--background)">
      <Header settings={settings} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
    </div>
    </RequestModalProvider>
  );
}
