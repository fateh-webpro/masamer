"use client";

import * as React from "react";
import { MessageCircle, Phone, ArrowLeft, Sparkles, ShieldCheck } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { MasamerDiamondMotif } from "@/components/shared/decorative-pattern";
import { formatWhatsAppUrl } from "@/lib/utils";
import type { SiteSettingsData } from "@/lib/services/site-setting-dal";

interface CTAProps {
  settings?: SiteSettingsData;
}

export function CTA({ settings }: CTAProps) {
  const { cta } = siteConfig;
  const phone = settings?.phone || siteConfig.contact.phone;
  const whatsappUrl = formatWhatsAppUrl(
    settings?.whatsapp || settings?.phone || "0539691477",
    "مرحباً مسامر، أود الاستفسار وطلب خدمة ضيافة وتجهيز لمناسبتي."
  );

  return (
    <section
      id="cta-section"
      className="py-14 sm:py-16 md:py-24 bg-sand-50/70 relative overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div
          className={`relative rounded-3xl bg-cover bg-center text-white p-8 sm:p-12 md:p-16 lg:p-20 overflow-hidden shadow-2xl border border-secondary-600/30 max-w-6xl mx-auto ${settings?.ctaBackgroundPath ? "" : "bg-gradient-to-br from-primary-950 via-primary-900 to-primary-950"}`}
          style={settings?.ctaBackgroundPath ? { backgroundImage: `url(${JSON.stringify(settings.ctaBackgroundPath)})` } : undefined}
        >
          {settings?.ctaBackgroundPath && <div className="pointer-events-none absolute inset-0 bg-primary-950/85" aria-hidden="true" />}
          {/* Subtle Decorative Glows & Geometry */}
          <div
            className="pointer-events-none absolute -top-32 -left-32 w-80 h-80 rounded-full bg-secondary-600/15 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-secondary-500/10 blur-3xl"
            aria-hidden="true"
          />

          {/* Decorative Subtle Diamond in Background */}
          <div
            className="pointer-events-none absolute top-8 left-8 opacity-10"
            aria-hidden="true"
          >
            <MasamerDiamondMotif className="w-28 h-28 text-white" size={112} />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary-900/70 text-secondary-300 text-xs font-semibold mb-5 sm:mb-6 border border-secondary-700/60 shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-secondary-400" />
              <span>جاهزون لتشريف مناسبتكم القادمة</span>
            </div>

            {/* Main Headline */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {cta.title}
            </h2>

            {/* Description */}
            <p className="mt-4 sm:mt-5 text-sm sm:text-base md:text-lg text-sand-200/80 leading-relaxed max-w-2xl mx-auto font-normal">
              {cta.description}
            </p>

            {/* Action Buttons */}
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5 sm:gap-4 w-full sm:w-auto">
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto font-bold shadow-lg shadow-secondary-900/40 gap-2 justify-center h-13 px-8 text-base"
                onClick={() => {
                  window.open(whatsappUrl, "_blank");
                }}
              >
                <MessageCircle className="h-5 w-5" />
                <span>محادثة فورية عبر واتساب</span>
                <ArrowLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-white/25 text-white hover:bg-white/10 hover:text-white justify-center h-13 px-7 text-base font-semibold"
                onClick={() => {
                  window.location.href = `tel:${phone.replace(/\s+/g, "")}`;
                }}
              >
                <Phone className="h-4 w-4 text-secondary-300" />
                <span>اتصال مباشر: {phone}</span>
              </Button>
            </div>

            {/* Micro-Features Guarantee Footer */}
            <div className="mt-10 pt-7 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-sand-100 font-medium">
              {[
                { label: "استجابة فورية وتنسيق مباشر", icon: MessageCircle },
                { label: "تغطية متكاملة لمدن ومناطق المملكة", icon: ShieldCheck },
                { label: "تنسيق وتجهيز مخصص", icon: Sparkles },
              ].map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.label}
                    className="group flex items-center gap-3 rounded-2xl border border-[#D69A7E]/25 bg-[#C2704B]/10 p-3 text-start transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D69A7E]/45 hover:bg-[#C2704B]/15 hover:shadow-sm motion-reduce:transform-none motion-reduce:transition-none"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#C2704B] text-white">
                      <Icon className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none" />
                    </span>
                    <span className="leading-relaxed">{feature.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
