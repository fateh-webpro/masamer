import type { Metadata } from "next";
import { PublicPageShell } from "@/components/layout/public-page-shell";
import { RequestForm } from "@/components/request/request-form";
import { getActiveServices } from "@/lib/services/service-dal";
import { getSiteSettings } from "@/lib/services/site-setting-dal";

export const metadata: Metadata = { title: "طلب الخدمة", description: "أرسل تفاصيل مناسبتك ليجهز فريق مسامر الخدمة المناسبة لك." };
export default async function RequestPage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const [{ service: slug }, services, settings] = await Promise.all([searchParams, getActiveServices(), getSiteSettings()]);
  const selected = services.find((service) => service.slug === slug);
  return <PublicPageShell><div className={settings.requestBackgroundPath ? "" : "bg-arabesque-subtle"}><div className="relative bg-cover bg-center py-12 sm:py-16" style={settings.requestBackgroundPath ? { backgroundImage: `url(${JSON.stringify(settings.requestBackgroundPath)})` } : undefined}>{settings.requestBackgroundPath && <div className="absolute inset-0 bg-[#F8F6F3]/90" aria-hidden="true" />}<div className="relative container mx-auto max-w-3xl px-4 text-center"><p className="text-secondary-700 font-semibold">تنسيق يبدأ من التفاصيل</p><h1 className="text-3xl sm:text-5xl font-extrabold text-primary-950 mt-2">اطلب الخدمة</h1><p className="text-slate-600 mt-3">شاركنا معلومات المناسبة، وسيتواصل معك فريق مسامر لاستكمال التنسيق.</p></div></div><div className="container mx-auto max-w-3xl px-4 py-12 sm:py-16"><RequestForm services={services.map(({ id, title, slug }) => ({ id, title, slug }))} selectedServiceId={selected?.id} whatsapp={settings.whatsapp || settings.phone} /></div></div></PublicPageShell>;
}
