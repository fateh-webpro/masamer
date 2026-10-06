import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, MessageCircle, ArrowLeft } from "lucide-react";
import { getActivePortfolioCategories, getActivePortfolioItems } from "@/lib/services/portfolio-dal";
import { getSiteSettings } from "@/lib/services/site-setting-dal";
import { PortfolioGrid } from "@/components/portfolio/portfolio-grid";
import { formatWhatsAppUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const revalidate = 60; // ISR cache revalidation

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteName = settings.siteName || "مسامر";

  return {
    title: `معرض الأعمال والتجهيزات | ${siteName}`,
    description:
      "استكشف معرض أعمال مسامر الحقيقية في تجهيز الفعاليات الكبرى والمناسبات الملكية والخاصة، وخدمات القهوجيين والصبابين والتأثيث الفاخر في المملكة العربية السعودية.",
    openGraph: {
      title: `معرض الأعمال والتجهيزات | ${siteName}`,
      description:
        "شاهد نماذج من تجهيزاتنا الميدانية الفاخرة للفعاليات والمناسبات الملكية والخاصة في المملكة العربية السعودية.",
    },
  };
}

export default async function WorksPage() {
  const [categories, items, settings] = await Promise.all([
    getActivePortfolioCategories(),
    getActivePortfolioItems(),
    getSiteSettings(),
  ]);

  const whatsappUrl = formatWhatsAppUrl(
    settings.whatsapp || settings.phone || "0539691477",
    "مرحباً مسامر، شاهدت معرض الأعمال وأود الاستفسار وطلب تجهيز لمناسبتي."
  );

  return (
    <div className="min-h-screen bg-sand-50/50 pb-24 pt-10 sm:pt-14">
      {/* Visual Hero Header */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl mb-12 sm:mb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sand-100 border border-sand-200/80 text-secondary-800 text-xs sm:text-sm font-semibold mb-4 sm:mb-5">
          <Sparkles className="w-4 h-4 text-secondary-600" />
          <span>أصالة التنفيذ وفخامة التجهيز الميداني</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary-950 mb-4 tracking-tight">
          معرض أعمال مسـامر
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed font-normal">
          نماذج حية وتجهيزات حقيقية من فعاليات ومناسبات تشرفنا بإدارتها وتقديم خدمات الضيافة والتأثيث التراثي والعصري فيها.
        </p>
      </section>

      {/* Main Filterable Gallery */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <PortfolioGrid items={items} categories={categories} />
      </section>

      {/* Inquiry Bottom CTA */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl mt-20">
        <div
          className={`rounded-3xl bg-cover bg-center text-white p-8 sm:p-12 md:p-14 border border-[#C2704B]/30 text-center relative overflow-hidden shadow-xl ${settings.worksCtaBackgroundPath ? "" : "bg-linear-to-br from-[#151C34] via-[#1F294A] to-[#3A2940]"}`}
          style={settings.worksCtaBackgroundPath ? { backgroundImage: `url(${JSON.stringify(settings.worksCtaBackgroundPath)})` } : undefined}
        >
          {settings.worksCtaBackgroundPath && (
            <div className="pointer-events-none absolute inset-0 bg-linear-to-l from-[#151C34]/92 via-[#1F294A]/84 to-[#151C34]/88" aria-hidden="true" />
          )}
          <div
            className="pointer-events-none absolute -top-20 right-1/2 translate-x-1/2 w-96 h-96 rounded-full bg-[#C2704B]/15 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="inline-block px-3 py-1 rounded-full bg-[#151C34]/65 text-[#D69A7E] text-xs font-semibold border border-[#D69A7E]/30 backdrop-blur-sm">
              تجهيز مخصص لمناسبتك
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              هل تخطط لمناسبة خاصة أو فعالية قادمة؟
            </h2>
            <p className="text-[#F8F6F3]/80 text-sm sm:text-base leading-relaxed">
              فريقنا جاهز لتجهيز وترتيب كافة تفاصيل الضيافة لتظهر مناسبتك بأبهى مظهر.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto font-bold shadow-md">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>تواصل لطلب تجهيز مماثل</span>
                  <ArrowLeft className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
