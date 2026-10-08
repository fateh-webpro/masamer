import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getSiteSettings } from "@/lib/services/site-setting-dal";
import { getActiveServices } from "@/lib/services/service-dal";
import { RequestModalProvider } from "@/components/request/request-modal-provider";

export async function PublicPageShell({ children }: { children: React.ReactNode }) {
  const [settings, services] = await Promise.all([getSiteSettings(), getActiveServices()]);
  return <RequestModalProvider services={services.map(({ id, title, slug }) => ({ id, title, slug }))} whatsapp={settings.whatsapp || settings.phone}><div className="min-h-screen flex flex-col"><Header settings={settings} /><main className="flex-1">{children}</main><Footer settings={settings} /></div></RequestModalProvider>;
}
