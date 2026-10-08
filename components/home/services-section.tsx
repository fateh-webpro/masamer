import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Sparkles } from "lucide-react";
import { ServiceIcon } from "@/components/shared/service-icon";
import { Button } from "@/components/ui/button";
import { getServiceDisplayImage, type ServiceItem } from "@/lib/services/service-dal";
import { isRuntimeUploadPath } from "@/lib/utils";

interface ServicesSectionProps {
  services: ServiceItem[];
}

export function ServicesSection({ services }: ServicesSectionProps) {
  if (!services || services.length === 0) {
    return null;
  }

  return (
    <section
      id="services-section"
      className="py-14 sm:py-16 md:py-24 bg-sand-50/50 border-b border-sand-200/70 relative"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Section Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-14">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sand-100 border border-sand-200 text-secondary-800 text-xs sm:text-sm font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-secondary-600" />
              <span>خدمات متكاملة</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-primary-950 tracking-tight leading-tight">
              خدمات الضيافة والمراسم
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2 leading-relaxed">
              حلول مصممة بعناية لتغطية كافة متطلبات الضيافة، من القهوجيين والصبابين المحترفين إلى تجهيز المؤتمرات والمناسبات الملكية والخاصة.
            </p>
          </div>

          <div>
            <Button asChild variant="outline" className="border-sand-300 hover:border-secondary-400 bg-white gap-2 font-bold shadow-2xs h-11 px-6">
              <Link href="/services">
                <span>استكشف كافة الخدمات</span>
                <ArrowLeft className="w-4 h-4 text-secondary-600" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Services Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.slice(0, 4).map((service, index) => {
            const displayImage = getServiceDisplayImage(service);
            return (
            <article
              key={service.id}
              className="group relative bg-white rounded-3xl border border-[#E8E3DE] hover:border-[#C2704B]/55 flex flex-col transition-all duration-300 motion-reduce:transition-none hover:shadow-lg hover:shadow-[#1F294A]/8 hover:-translate-y-1 motion-reduce:hover:translate-y-0 overflow-hidden"
            >
              <Link href={`/services/${service.slug}`} className="relative aspect-16/9 overflow-hidden bg-[#1F294A]">
                {displayImage ? <Image src={displayImage} alt={service.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw" className="object-cover transition-transform duration-500 motion-reduce:transition-none group-hover:scale-[1.03] motion-reduce:group-hover:scale-100" unoptimized={isRuntimeUploadPath(displayImage)} /> : <div className="absolute inset-0 bg-linear-to-br from-[#1F294A] to-[#29365D] bg-arabesque-subtle" />}
                <div className="absolute inset-0 bg-linear-to-t from-[#1F294A]/70 via-transparent to-transparent" />
                <span className="absolute top-3 right-3 text-[11px] font-bold text-white/85">{String(index + 1).padStart(2, "0")}</span>
                <span className="absolute bottom-3 right-3 w-10 h-10 rounded-xl border border-white/20 bg-[#1F294A]/70 text-[#E7C8B7] backdrop-blur-sm flex items-center justify-center"><ServiceIcon name={service.icon} className="w-5 h-5" /></span>
              </Link>

              <div className="p-5 sm:p-6 flex flex-1 flex-col">
                <div>

                <h3 className="text-lg font-bold text-primary-950 group-hover:text-secondary-700 transition-colors mb-2.5 leading-snug">
                  <Link href={`/services/${service.slug}`}>
                    {service.title}
                  </Link>
                </h3>

                <p className="text-[#747986] text-xs sm:text-sm leading-relaxed mb-5 line-clamp-2">
                  {service.shortDescription}
                </p>
              </div>

              <div className="mt-auto pt-4 border-t border-[#E8E3DE] flex items-center justify-between">
                <Link
                  href={`/services/${service.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-900 group-hover:text-secondary-600 transition-colors"
                >
                  <span>تفاصيل ومميزات الخدمة</span>
                  <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1 text-secondary-600" />
                </Link>
              </div>
              </div>
            </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
