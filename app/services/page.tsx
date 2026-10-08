import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";
import { getActiveServices, getServiceDisplayImage } from "@/lib/services/service-dal";
import { ServiceIcon } from "@/components/shared/service-icon";
import { Button } from "@/components/ui/button";
import { RequestModalTrigger } from "@/components/request/request-modal-provider";
import { isRuntimeUploadPath } from "@/lib/utils";

export const metadata: Metadata = {
  title: "خدمات الضيافة الفاخرة | مسامر",
  description:
    "استكشف خدمات مسامر المتخصصة في تقديم القهوة السعودية الأصيلة، القهوجيين والصبابين المحترفين، وإدارة بوفيهات المناسبات الملكية والخاصة.",
};

export const revalidate = 60; // ISR cache revalidation

export default async function ServicesPage() {
  const services = await getActiveServices();

  return (
    <div className="min-h-screen bg-sand-50/50 pb-24 pt-12">
      {/* Header Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sand-100 border border-sand-200/80 text-secondary-700 text-xs sm:text-sm font-medium mb-5">
          <Sparkles className="w-4 h-4 text-secondary-500" />
          <span>خدمات ضيافة مصممة لأرقى المناسبات</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary-950 mb-4 tracking-tight">
          خدمات الضيافة المتكاملة
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
          نقدم باقة مختارة من خدمات القهوة السعودية والمشروبات التراثية بإشراف كوادر وطنية متمرسة تجمع بين عراقة التقاليد ودقة التنظيم.
        </p>
      </section>

      {/* Services Grid */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        {services.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-16 px-6 bg-white rounded-2xl border border-sand-200 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-sand-100 text-secondary-600 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-primary-950 mb-2">
              جاري تحديث قائمة الخدمات
            </h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              نقوم حالياً بإعداد وتحديث خدماتنا لتظهر لكم بأبهى حلة. يُرجى العودة قريباً.
            </p>
            <Button asChild variant="primary">
              <Link href="/">العودة للرئيسية</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const displayImage = getServiceDisplayImage(service);
              return (
              <article
                key={service.id}
                className="group relative flex flex-col bg-white rounded-2xl border border-sand-200/90 hover:border-secondary-300 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-secondary-900/5 hover:-translate-y-1"
              >
                <div className="relative aspect-16/9 bg-primary-950 overflow-hidden">
                  {displayImage ? <Image src={displayImage} alt={service.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover transition-transform duration-500 motion-reduce:transition-none group-hover:scale-[1.03] motion-reduce:group-hover:scale-100" unoptimized={isRuntimeUploadPath(displayImage)} /> : <div className="absolute inset-0 bg-linear-to-br from-[#1F294A] to-[#29365D] bg-arabesque-subtle flex items-center justify-center"><div className="w-16 h-16 rounded-2xl border border-[#C2704B]/40 bg-white/5 text-[#E7C8B7] flex items-center justify-center"><ServiceIcon name={service.icon} className="w-8 h-8" /></div></div>}
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-[#1F294A]/55 to-transparent" aria-hidden="true" />
                  <span className="absolute top-4 right-4 rounded-full border border-white/30 bg-[#1F294A]/75 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">خدمة {String(index + 1).padStart(2, "0")}</span>
                </div>
                <div className="p-7 flex flex-col flex-1"><div>
                  {/* Icon & Title */}
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 rounded-xl bg-sand-100/80 border border-sand-200 text-secondary-600 flex items-center justify-center group-hover:bg-secondary-600 group-hover:text-white group-hover:border-secondary-600 transition-colors duration-300 shadow-sm">
                      <ServiceIcon name={service.icon} className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-primary-950 group-hover:text-secondary-700 transition-colors">
                        {service.title}
                      </h2>
                    </div>
                  </div>

                  {/* Short Description */}
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    {service.shortDescription}
                  </p>

                  {/* Features Highlight */}
                  {service.features.length > 0 && (
                    <div className="space-y-2.5 mb-6 pt-4 border-t border-sand-100">
                      {service.features.slice(0, 3).map((feature, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 text-xs sm:text-sm text-slate-700"
                        >
                          <CheckCircle2 className="w-4 h-4 text-secondary-600 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="pt-4 mt-auto border-t border-sand-100/80 grid grid-cols-2 gap-2"><Link href={`/services/${service.slug}`} className="inline-flex items-center justify-center gap-1 rounded-xl border border-sand-200 px-3 py-2 text-sm font-semibold">تفاصيل الخدمة <ArrowLeft className="w-4 h-4" /></Link><RequestModalTrigger serviceSlug={service.slug} className="inline-flex items-center justify-center rounded-xl bg-secondary-600 text-white px-3 py-2 text-sm font-bold">اطلب الخدمة</RequestModalTrigger></div>
                </div>
              </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
