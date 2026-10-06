import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getSiteSettings } from "@/lib/services/site-setting-dal";

export async function PublicPageShell({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  return <div className="min-h-screen flex flex-col"><Header settings={settings} /><main className="flex-1">{children}</main><Footer settings={settings} /></div>;
}
