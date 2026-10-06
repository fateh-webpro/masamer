import * as React from "react";
import { Users, Utensils, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";
import { MasamerDiamondMotif } from "@/components/shared/decorative-pattern";
import type { SiteSettingsData } from "@/lib/services/site-setting-dal";

interface WhyMasamerProps {
  settings?: SiteSettingsData;
}

export function WhyMasamer({ settings }: WhyMasamerProps) {
  const backgroundPath = settings?.homeStandardsBackgroundPath;
  const reasons = [
    {
      icon: Users,
      title: "كوادر ضيافة ومراسم محترفة",
      description:
        "طواقم سعودية مدربة على أعلى معايير اللباقة وحسن المظهر بالزي الوطني الموحد، مع إتقان بروتوكول صب القهوة وخدمة الضيوف.",
    },
    {
      icon: Utensils,
      title: "تجهيزات وأوانٍ ملكية فاخرة",
      description:
        "جاهزية شاملة تشمل دلال رسلان والنحاسية الأصلية، ترامس فاخرة تحفظ الحرارة، مباخر عود ملكية، وأطقم تقديم معقمة بالكامل.",
    },
    {
      icon: ShieldCheck,
      title: "إشراف ميداني وانضباط دقيق",
      description:
        "تواجد مشرفين ميدانيين لضمان الجاهزية المبكرة وسلاسة سير الضيافة والانتباه لأدق تفاصيل الخدمة طوال فترة المناسبة.",
    },
    {
      icon: Sparkles,
      title: "تنسيق مخصص لطبيعة كل مناسبة",
      description:
        "حلول مرنة تناسب حجم الفعالية؛ من المؤتمرات والمعارض الكبرى إلى مجالس كبار الشخصيات واللقاءات العائلية الخاصة.",
    },
  ];

  return (
    <section
      className={`masamer-parallax relative overflow-hidden border-b border-[#D69A7E]/20 bg-cover bg-center py-14 sm:py-16 md:py-24 ${backgroundPath ? "" : "bg-linear-to-br from-[#1F294A] via-[#1F294A] to-[#151C34]"}`}
      style={backgroundPath ? { backgroundImage: `url(${JSON.stringify(backgroundPath)})` } : undefined}
    >
      {backgroundPath && (
        <div className="pointer-events-none absolute inset-0 z-0 bg-linear-to-l from-[#151C34]/90 via-[#1F294A]/84 to-[#1F294A]/80" aria-hidden="true" />
      )}
      <div className="pointer-events-none absolute -right-24 top-1/3 z-10 h-64 w-64 rounded-full bg-[#C2704B]/12 blur-3xl" aria-hidden="true" />
      <div className="masamer-float-slow pointer-events-none absolute -left-8 top-10 z-10 text-[#D69A7E]/15" aria-hidden="true">
        <MasamerDiamondMotif className="h-36 w-36 sm:h-48 sm:w-48" size={192} />
      </div>

      <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#151C34]/60 border border-[#D69A7E]/30 text-[#F8F6F3] text-xs sm:text-sm font-semibold mb-3 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#D69A7E]" />
            <span>لماذا يختار عملاؤنا مسـامر</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#F8F6F3] tracking-tight leading-tight">
            معايير نلتزم بها في كل مناسبة
          </h2>
          <p className="text-[#F8F6F3]/72 text-sm sm:text-base mt-2 leading-relaxed">
            نضع بين أيديكم خبرتنا التراكمية في إدارة المراسم والضيافة التراثية لضمان إبراز كرمكم وحسن استقبالكم لضيوفكم.
          </p>
        </div>

        {/* 4 Reasons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <div
                key={reason.title}
                className="p-6 sm:p-7 rounded-3xl bg-[#151C34]/65 backdrop-blur-sm border border-white/10 hover:border-[#D69A7E]/40 transition-all duration-300 flex flex-col justify-between group hover:shadow-lg hover:shadow-black/10 hover:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#C2704B]/15 text-[#D69A7E] flex items-center justify-center mb-5 border border-[#D69A7E]/25 group-hover:bg-[#C2704B] group-hover:text-white transition-colors duration-300 motion-reduce:transition-none">
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-[#D69A7E] transition-colors mb-2.5 motion-reduce:transition-none">
                    {reason.title}
                  </h3>

                  <p className="text-[#F8F6F3]/70 text-xs sm:text-sm leading-relaxed">
                    {reason.description}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-white/10 flex items-center gap-1.5 text-[11px] font-semibold text-[#D69A7E]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>معيار جودة موثق</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
