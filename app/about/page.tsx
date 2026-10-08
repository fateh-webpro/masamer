import type { Metadata } from "next";
import { ArrowLeft, Award, Coffee, HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";
import { PublicPageShell } from "@/components/layout/public-page-shell";
import { MasamerDiamondMotif, MasamerFlourish } from "@/components/shared/decorative-pattern";
import { Reveal } from "@/components/shared/reveal";
import { getSiteSettings } from "@/lib/services/site-setting-dal";
import { RequestModalTrigger } from "@/components/request/request-modal-provider";

export const metadata: Metadata = {
  title: "من نحن",
  description: "تعرف على مسامر ورؤيتها في تقديم الضيافة السعودية الأصيلة بإتقان وانضباط.",
};

const values = [
  { title: "الأصالة", icon: Coffee },
  { title: "الإتقان", icon: Award },
  { title: "الحفاوة", icon: HeartHandshake },
  { title: "الانضباط الميداني", icon: ShieldCheck },
];

const steps = ["التنسيق والاستشارة", "التجهيز", "الوصول المبكر", "إدارة المراسم والضيافة"];

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <PublicPageShell>
      <div
        className={`relative overflow-hidden bg-cover bg-center ${settings.aboutBackgroundPath ? "" : "bg-arabesque-subtle"}`}
        style={settings.aboutBackgroundPath ? { backgroundImage: `url(${JSON.stringify(settings.aboutBackgroundPath)})` } : undefined}
      >
        {settings.aboutBackgroundPath && <div className="absolute inset-0 bg-[#F8F6F3]/85" aria-hidden="true" />}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-b from-transparent to-[#F8F6F3]" aria-hidden="true" />
        <Reveal>
          <section className="relative container mx-auto max-w-6xl px-4 py-16 text-center sm:py-20">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#C2704B]/25 bg-[#C2704B]/10 text-[#C2704B]">
              <Sparkles className="h-6 w-6" aria-hidden="true" />
            </span>
            <h1 className="mt-4 text-4xl font-extrabold text-[#1F294A] sm:text-6xl">عن {settings.siteName}</h1>
            <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-[#505563]">
              مسامر فريق ضيافة سعودي يصنع حضورًا دافئًا ومنظمًا للمناسبات، ويجمع بين الموروث الأصيل ودقة التنفيذ المعاصر.
            </p>
            <MasamerFlourish className="mx-auto mt-7 h-5 w-32 text-[#C2704B]/55" />
          </section>
        </Reveal>
      </div>

      <section className="bg-[#F8F6F3] py-12 sm:py-16">
        <Reveal className="container mx-auto grid max-w-6xl gap-5 px-4 lg:grid-cols-2 lg:gap-7">
          <article className="relative overflow-hidden rounded-3xl border border-[#C2704B]/25 bg-linear-to-br from-[#1F294A] to-[#151C34] p-7 shadow-sm sm:p-9">
            <div className="pointer-events-none absolute -bottom-10 -left-8 text-[#D69A7E]/8" aria-hidden="true">
              <MasamerDiamondMotif className="h-36 w-36" size={144} />
            </div>
            <span className="text-sm font-extrabold tracking-widest text-[#D69A7E]">01</span>
            <h2 className="mt-3 text-2xl font-bold text-[#F8F6F3]">رؤيتنا</h2>
            <p className="relative mt-3 max-w-xl leading-7 text-[#F8F6F3]/80">
              أن تكون مسامر معيارًا موثوقًا للضيافة السعودية الراقية في المناسبات الخاصة والرسمية.
            </p>
          </article>

          <article className="relative overflow-hidden rounded-3xl border border-[#C2704B]/25 bg-white p-7 shadow-sm sm:p-9">
            <div className="absolute inset-y-7 start-0 w-1 rounded-e-full bg-[#C2704B]" aria-hidden="true" />
            <span className="text-sm font-extrabold tracking-widest text-[#C2704B]">02</span>
            <h2 className="mt-3 text-2xl font-bold text-[#1F294A]">رسالتنا</h2>
            <p className="mt-3 max-w-xl leading-7 text-[#5E6370]">
              نحوّل تفاصيل الضيافة إلى تجربة متقنة، من لحظة التنسيق وحتى توديع آخر ضيف.
            </p>
          </article>
        </Reveal>
      </section>

      <section className="bg-white py-12 sm:py-16">
        <Reveal className="container mx-auto max-w-6xl px-4">
          <div className="mb-7 text-center sm:mb-9">
            <MasamerDiamondMotif className="mx-auto h-6 w-6 text-[#C2704B]" size={24} />
            <h2 className="mt-3 text-3xl font-bold text-[#1F294A]">قيمنا</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ title, icon: Icon }) => (
              <article
                key={title}
                className="group relative overflow-hidden rounded-2xl border border-[#E8E3DE] bg-[#F8F6F3]/55 p-6 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-[#C2704B]/50 hover:shadow-md hover:shadow-[#1F294A]/5 motion-reduce:transform-none motion-reduce:transition-none"
              >
                <div className="absolute inset-x-0 top-0 mx-auto h-0.5 w-12 rounded-full bg-[#C2704B]/70" aria-hidden="true" />
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#C2704B]/20 bg-[#C2704B]/10 text-[#1F294A] transition-colors duration-200 group-hover:bg-[#C2704B]/15 motion-reduce:transition-none">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-bold text-[#1F294A]">{title}</h3>
              </article>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="border-y border-[#E8E3DE] bg-[#F8F6F3] py-12 sm:py-16">
        <Reveal className="container mx-auto max-w-6xl px-4">
          <div className="mb-7 text-center sm:mb-9">
            <MasamerDiamondMotif className="mx-auto h-6 w-6 text-[#C2704B]" size={24} />
            <h2 className="mt-3 text-3xl font-bold text-[#1F294A]">أسلوب العمل</h2>
          </div>
          <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="absolute inset-x-[12%] top-7 hidden h-px bg-[#C2704B]/20 lg:block" aria-hidden="true" />
            {steps.map((step, index) => (
              <article
                key={step}
                className="group relative rounded-2xl border border-[#E8E3DE] bg-white p-6 transition-all duration-200 hover:border-[#C2704B]/45 hover:shadow-sm motion-reduce:transition-none"
              >
                <span className="relative z-10 inline-flex h-12 min-w-12 items-center justify-center rounded-xl border border-[#C2704B]/25 bg-[#F8F6F3] px-2 text-lg font-extrabold text-[#C2704B] transition-colors duration-200 group-hover:bg-[#C2704B] group-hover:text-white motion-reduce:transition-none">
                  0{index + 1}
                </span>
                <h3 className="mt-5 font-bold leading-7 text-[#1F294A]">{step}</h3>
              </article>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="bg-white px-4 py-12 sm:py-16">
        <Reveal className="container relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-[#C2704B]/25 bg-linear-to-br from-[#1F294A] to-[#151C34] px-6 py-11 text-center shadow-lg shadow-[#1F294A]/10 sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute -right-10 -top-12 text-white/5" aria-hidden="true">
            <MasamerDiamondMotif className="h-44 w-44" size={176} />
          </div>
          <div className="pointer-events-none absolute -bottom-24 -left-20 h-48 w-48 rounded-full bg-[#C2704B]/15 blur-3xl" aria-hidden="true" />
          <div className="relative">
            <h2 className="text-3xl font-bold text-[#F8F6F3]">دعنا نرتب ضيافتك</h2>
            <RequestModalTrigger
              className="mt-6 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#C2704B] px-7 py-3 text-[1.1875rem] font-bold text-white shadow-sm transition-colors duration-200 hover:bg-[#A95F3F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D69A7E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1F294A] motion-reduce:transition-none"
            >
              <span>اطلب الخدمة</span>
              <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
            </RequestModalTrigger>
          </div>
        </Reveal>
      </section>
    </PublicPageShell>
  );
}
