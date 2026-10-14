import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getSiteSettings } from "@/lib/services/site-setting-dal";
import { getActiveServices, getActiveServiceCategories } from "@/lib/services/service-dal";
import { RequestModalProvider } from "@/components/request/request-modal-provider";

export async function PublicPageShell({ children }: { children: React.ReactNode }) {
  const [settings, services, categories] = await Promise.all([
    getSiteSettings(),
    getActiveServices(),
    getActiveServiceCategories(),
  ]);
  return (
    <RequestModalProvider
      services={services.map(({ id, title, slug, categoryId, category }) => ({
        id,
        title,
        slug,
        categoryId,
        categoryName: category?.name,
      }))}
      categories={categories.map(({ id, name }) => ({ id, name }))}
      whatsapp={settings.whatsapp || settings.phone}
    >
      <div className="min-h-screen flex flex-col">
        <Header settings={settings} />
        <main className="flex-1">{children}</main>
        <Footer settings={settings} />
      </div>
    </RequestModalProvider>
  );
}
