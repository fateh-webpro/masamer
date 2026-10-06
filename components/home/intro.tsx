import * as React from "react";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { MasamerDiamondMotif, MasamerFlourish } from "@/components/shared/decorative-pattern";

export function Intro() {
  const pillars = [
    {
      number: "01",
      title: "أصالة التقاليد وبروتوكول المراسم",
      description:
        "طواقمنا السعودية مدربة بأعلى درجات الإتقان على أصول صب القهوة السعودية والضيافة ومراعاة الترتيب واللباقة وفق أدق قواعد المراسم المعتمدة.",
    },
    {
      number: "02",
      title: "تجهيزات فاخرة ومعدات معقمة",
      description:
        "نعتمد أجود أنواع دلال رسلان النحاسية الأصلية، المباخر الملكية، وأطقم الفناجيل والكاسات المعقمة والجاهزة للاستخدام المباشر في مناسبتكم.",
    },
    {
      number: "03",
      title: "إشراف ميداني وانضباط تشغيلي",
      description:
        "نلتزم بالجاهزية المبكرة والتنسيق الكامل مع المنظمين وأصحاب الحفل، مع تواجد مشرف ميداني متفرغ يضمن سير خدمات الضيافة بأعلى جودة.",
    },
  ];

  return (
    <section
      id="intro-section"
      className="py-14 sm:py-16 md:py-24 bg-white border-b border-sand-200/70 relative overflow-hidden"
    >
      {/* Background Subtle Flourish */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Editorial Top Grid: Headline + Narrative Description */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end mb-14 sm:mb-16">
          <div className="lg:col-span-6 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sand-100 text-secondary-800 text-xs font-semibold border border-sand-200">
              <Sparkles className="w-3.5 h-3.5 text-secondary-600" />
              <span>فلسفة مسـامر في الضيافة</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary-950 tracking-tight leading-snug">
              نصنع لمناسباتكم طابعاً من <span className="text-secondary-600">الفخامة والأصالة</span>
            </h2>
          </div>

          <div className="lg:col-span-6">
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-normal">
              في مسامر، لا نكتفي بتقديم القهوة السعودية والمشروبات التراثية؛ بل نصنع تجربة ضيافة متكاملة تجمع بين عراقة الكرم السعودي ودقة التنظيم العصري لتشريف مناسباتكم الرسمية والخاصة أمام ضيوفكم الكرام.
            </p>
          </div>
        </div>

        {/* 3 Editorial Pillars (No boring identical white boxes) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 pt-4">
          {pillars.map((pillar) => (
            <div
              key={pillar.number}
              className="relative p-6 sm:p-8 rounded-3xl bg-sand-50/70 border border-sand-200/90 hover:border-secondary-300 transition-all duration-300 flex flex-col justify-between group hover:shadow-lg hover:shadow-secondary-900/5 hover:-translate-y-1"
            >
              <div>
                {/* Header with Index Number & Diamond Icon */}
                <div className="flex items-center justify-between mb-5">
                  <span className="text-2xl font-mono font-bold text-secondary-600/80">
                    {pillar.number}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-white text-secondary-600 flex items-center justify-center border border-sand-200 shadow-2xs group-hover:bg-secondary-600 group-hover:text-white transition-colors duration-300">
                    <MasamerDiamondMotif className="w-4 h-4" size={16} />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-primary-950 mb-3 group-hover:text-secondary-700 transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {pillar.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-sand-200/60 flex items-center gap-1.5 text-xs font-semibold text-secondary-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-secondary-600" />
                <span>معيار أساسي في كافة أعمالنا</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
