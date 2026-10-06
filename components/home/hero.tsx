"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "motion/react";
import {
  Sparkles,
  ArrowLeft,
  ChevronLeft,
  CheckCircle2,
  ShieldCheck,
  Award,
  Clock,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MasamerDiamondMotif } from "@/components/shared/decorative-pattern";
import type { SiteSettingsData } from "@/lib/services/site-setting-dal";

interface HeroProps {
  settings?: SiteSettingsData;
  featuredImage?: string | null;
}

export function Hero({ settings, featuredImage }: HeroProps) {
  const prefersReducedMotion = useReducedMotion();
  const { hero } = siteConfig;
  const heroBackground = settings?.homeHeroBackgroundPath;
  const cardBackground = settings?.homeHeroCardBackgroundPath || featuredImage;

  const badge = settings?.heroBadge || hero.badge;
  const title = settings?.heroTitle || hero.titlePrimary;
  const highlight = settings?.heroHighlightedText || hero.titleHighlight;
  const description = settings?.heroDescription || hero.description;
  const primaryBtn = settings?.heroPrimaryButtonText || hero.ctaPrimary;
  const secondaryBtn = settings?.heroSecondaryButtonText || hero.ctaSecondary;

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const trustPoints = [
    {
      title: "طواقم مراسم مؤهلة",
      description: "كوادر سعودية متمرسة بأصول البروتوكول واللباقة",
      icon: ShieldCheck,
    },
    {
      title: "تجهيزات ملكية فاخرة",
      description: "دلال رسلان ومباخر وأواني تقديم معقمة بالكامل",
      icon: Award,
    },
    {
      title: "جاهزية ميدانية مبكرة",
      description: "التزام تام بالمواعيد وانضباط تشغيلي متكامل",
      icon: Clock,
    },
  ];

  return (
    <section
      className="relative overflow-hidden bg-cover bg-center pt-6 pb-12 sm:pt-10 sm:pb-16 md:pt-12 md:pb-20 bg-sand-50/70 border-b border-sand-200/60"
      style={heroBackground ? { backgroundImage: `url(${JSON.stringify(heroBackground)})` } : undefined}
    >
      {heroBackground && (
        <div className="pointer-events-none absolute inset-0 bg-linear-to-l from-[#F8F6F3]/95 via-[#F8F6F3]/88 to-[#F8F6F3]/78" aria-hidden="true" />
      )}
      {/* Subtle Background Glows */}
      <div
        className="pointer-events-none absolute -top-40 right-1/4 w-[500px] h-[500px] rounded-full bg-(--secondary)/5 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/3 -left-32 w-[400px] h-[400px] rounded-full bg-(--primary)/5 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Main Hero Content (RTL Right side) */}
          <motion.div
            className="lg:col-span-7 flex flex-col items-start text-start"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Top Identity Badge */}
            <motion.div variants={itemVariants} className="mb-4">
              <Badge
                variant="default"
                className="py-1.5 px-3.5 text-xs sm:text-sm font-semibold rounded-full bg-sand-100 text-secondary-800 border-sand-200/80 shadow-2xs gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5 text-(--secondary)" />
                <span>{badge}</span>
              </Badge>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-(--primary) leading-[1.25] sm:leading-[1.18]"
            >
              <span>{title}</span>
              <span className="block mt-1.5 sm:mt-2 text-(--secondary)">
                {highlight}
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={itemVariants}
              className="mt-4 sm:mt-5 text-base sm:text-lg text-(--text-muted) leading-relaxed max-w-2xl font-normal"
            >
              {description}
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              variants={itemVariants}
              className="mt-7 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto"
            >
              <Button asChild variant="secondary" size="lg" className="group shadow-sm hover:shadow-md justify-center w-full sm:w-auto h-12 px-7 font-bold text-base"><Link href="/request" className="inline-flex items-center justify-center gap-2 whitespace-nowrap"><span>{primaryBtn}</span><ArrowLeft className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-x-1" aria-hidden="true" /></Link></Button>

              <Button
                variant="outline"
                size="lg"
                className="border-sand-300 hover:border-(--secondary)/40 bg-white/80 backdrop-blur-xs justify-center w-full sm:w-auto h-12 px-6 font-semibold text-primary-950"
                onClick={() => {
                  const servicesEl = document.getElementById("services-section");
                  servicesEl?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <span>{secondaryBtn}</span>
                <ChevronLeft className="h-4 w-4 opacity-70" />
              </Button>
            </motion.div>

            {/* Qualitative Trust Indicators */}
            <motion.div
              variants={itemVariants}
              className="mt-10 pt-7 border-t border-sand-200/80 w-full grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              {trustPoints.map((point) => {
                const Icon = point.icon;
                return (
                  <div
                    key={point.title}
                    className="flex items-start gap-2.5 p-2 rounded-xl transition-colors hover:bg-white/40"
                  >
                    <div className="h-7 w-7 rounded-lg bg-(--secondary)/10 flex items-center justify-center shrink-0 mt-0.5 text-(--secondary)">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-(--primary)">
                        {point.title}
                      </h3>
                      <p className="text-[11px] text-(--text-muted) mt-0.5 leading-snug">
                        {point.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </motion.div>

          {/* Visual Showcase (RTL Left side) */}
          <motion.div
            className="lg:col-span-5 relative flex items-center justify-center mt-4 lg:mt-0"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative w-full max-w-md lg:max-w-none rounded-3xl p-3 sm:p-4 bg-linear-to-br from-[#1F294A] to-[#151C34] border border-[#C2704B]/35 shadow-xl overflow-hidden">
              {/* Decorative Corner Embellishments */}
              <div
                className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-(--secondary)/10 via-transparent to-transparent rounded-bl-full pointer-events-none"
                aria-hidden="true"
              />

              <div className={`relative aspect-4/3 sm:aspect-16/11 w-full rounded-2xl overflow-hidden border shadow-md group ${cardBackground ? "bg-slate-900 border-sand-200" : "bg-gradient-to-br from-primary-950 via-primary-900 to-primary-950 border-primary-800"}`}>
                {cardBackground && (
                  <Image
                    src={cardBackground}
                    alt="تجهيزات مسامر لخدمات الضيافة والمناسبات"
                    fill
                    sizes="(max-width: 1024px) 100vw, 500px"
                    className="z-0 object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    priority
                  />
                )}
                <div className="absolute inset-0 z-10 bg-[#1F294A]/78" aria-hidden="true" />
                <div className="absolute inset-0 z-10 bg-linear-to-t from-[#151C34]/85 via-transparent to-[#1F294A]/25" aria-hidden="true" />
                <motion.div
                  className="pointer-events-none absolute left-5 top-5 z-20 text-[#D69A7E]/35"
                  aria-hidden="true"
                  animate={prefersReducedMotion ? undefined : { y: [0, -6, 0], rotate: [0, 2, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                  <MasamerDiamondMotif className="h-14 w-14" size={56} />
                </motion.div>

                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center px-6 pb-24 pt-5 text-center text-white sm:px-8">
                  <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl border border-secondary-400/30 bg-secondary-600/20 shadow-inner">
                    <MasamerDiamondMotif className="h-9 w-9 text-secondary-300" size={36} />
                  </div>
                  <h3 className="mb-1.5 text-lg font-bold tracking-tight text-white sm:text-xl">
                    مسـامر للضيافة الفاخرة
                  </h3>
                  <p className="max-w-xs text-[11px] leading-relaxed text-sand-200/85 sm:text-xs">
                    نقدم أرقى خدمات القهوجيين والصبابين وتجهيز المناسبات الملكية والخاصة في كافة مناطق المملكة.
                  </p>
                  <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-2 text-[10px] text-secondary-300 sm:text-[11px]">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>مراسم معتمدة وإشراف مباشر</span>
                  </div>

                  <div className="absolute bottom-4 right-4 left-4 z-30 p-3.5 rounded-xl bg-[#1F294A]/82 backdrop-blur-md border border-[#D69A7E]/30 shadow-md flex items-center justify-between">
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white block">
                        تجهيزات ميدانية فاخرة
                      </span>
                      <span className="text-[10px] text-white/70 block mt-0.5">
                        أرقى معايير الضيافة والمراسم السعودية
                      </span>
                    </div>
                    <div className="h-8 w-8 rounded-lg bg-(--secondary) text-white flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
