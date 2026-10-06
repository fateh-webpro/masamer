import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/config/site";
import type { SiteSetting } from "@/generated/prisma/client";

export interface SiteSettingsData {
  id?: string;
  siteName: string;
  siteNameEn: string;
  shortDescription: string;
  logoPath: string | null;
  logoDarkPath: string | null;
  faviconPath: string | null;
  homeHeroBackgroundPath: string | null;
  homeHeroCardBackgroundPath: string | null;
  homeStandardsBackgroundPath: string | null;
  worksCtaBackgroundPath: string | null;
  aboutBackgroundPath: string | null;
  contactBackgroundPath: string | null;
  requestBackgroundPath: string | null;
  ctaBackgroundPath: string | null;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  facebookUrl: string | null;
  xUrl: string | null;
  instagramUrl: string | null;
  snapchatUrl: string | null;
  heroBadge: string;
  heroTitle: string;
  heroHighlightedText: string;
  heroDescription: string;
  heroPrimaryButtonText: string;
  heroSecondaryButtonText: string;
  footerDescription: string;
  copyrightText: string;
  seoTitle: string;
  seoDescription: string;
  seoImagePath: string | null;
  updatedAt?: Date;
}

const DEFAULT_SETTINGS: SiteSettingsData = {
  siteName: siteConfig.name || "مسامر",
  siteNameEn: "MASAMER",
  shortDescription: siteConfig.description || "خدمات الضيافة الفاخرة والقهوجيين وتجهيز المناسبات",
  logoPath: null,
  logoDarkPath: null,
  faviconPath: null,
  homeHeroBackgroundPath: null,
  homeHeroCardBackgroundPath: null,
  homeStandardsBackgroundPath: null,
  worksCtaBackgroundPath: null,
  aboutBackgroundPath: null,
  contactBackgroundPath: null,
  requestBackgroundPath: null,
  ctaBackgroundPath: null,
  phone: "0539691477",
  whatsapp: "0539691477",
  email: siteConfig.contact?.email || "",
  address: siteConfig.contact?.location || "المملكة العربية السعودية",
  facebookUrl: null,
  xUrl: null,
  instagramUrl: null,
  snapchatUrl: null,
  heroBadge: siteConfig.hero?.badge || "أصالة الضيافة برؤية معاصرة",
  heroTitle: siteConfig.hero?.titlePrimary || "مسـامر لخدمات الضيافة",
  heroHighlightedText: siteConfig.hero?.titleHighlight || "فخامة تليق بضيوفك ومناسباتك",
  heroDescription:
    siteConfig.hero?.description ||
    "نقدم أرقى خدمات القهوجيين والصبابين المدربين بأعلى معايير اللباقة والأصالة، مع جاهزية متكاملة لتوفير وتجهيز كافة مستلزمات الضيافة لمناسباتك الرسمية والخاصة.",
  heroPrimaryButtonText: siteConfig.hero?.ctaPrimary || "اطلب الخدمة",
  heroSecondaryButtonText: siteConfig.hero?.ctaSecondary || "استكشف خدماتنا",
  footerDescription:
    "المنصة الرائدة في تقديم أرقى خدمات القهوجيين والصبابين وتجهيز متطلبات الضيافة للمؤتمرات والفعاليات والمناسبات الخاصة في المملكة العربية السعودية.",
  copyrightText: "مسامر لخدمات الضيافة. جميع الحقوق محفوظة.",
  seoTitle: siteConfig.title || "مسامر | خدمات الضيافة والقهوجيين وتجهيز المناسبات",
  seoDescription: siteConfig.description || "المنصة الرائدة في تقديم خدمات القهوجيين والصبابين المحترفين في المملكة العربية السعودية.",
  seoImagePath: null,
};

/**
 * Fetch the single SiteSetting record with React cache per-request deduplication
 */
export const getSiteSettings = cache(async (): Promise<SiteSettingsData> => {
  try {
    const record = await prisma.siteSetting.findFirst();
    if (!record) {
      return DEFAULT_SETTINGS;
    }

    return {
      id: record.id,
      siteName: record.siteName || DEFAULT_SETTINGS.siteName,
      siteNameEn: record.siteNameEn || DEFAULT_SETTINGS.siteNameEn,
      shortDescription: record.shortDescription || DEFAULT_SETTINGS.shortDescription,
      logoPath: record.logoPath,
      logoDarkPath: record.logoDarkPath,
      faviconPath: record.faviconPath,
      homeHeroBackgroundPath: record.homeHeroBackgroundPath,
      homeHeroCardBackgroundPath: record.homeHeroCardBackgroundPath,
      homeStandardsBackgroundPath: record.homeStandardsBackgroundPath,
      worksCtaBackgroundPath: record.worksCtaBackgroundPath,
      aboutBackgroundPath: record.aboutBackgroundPath,
      contactBackgroundPath: record.contactBackgroundPath,
      requestBackgroundPath: record.requestBackgroundPath,
      ctaBackgroundPath: record.ctaBackgroundPath,
      phone: record.phone || DEFAULT_SETTINGS.phone,
      whatsapp: record.whatsapp || record.phone || DEFAULT_SETTINGS.whatsapp,
      email: record.email || DEFAULT_SETTINGS.email,
      address: record.address || DEFAULT_SETTINGS.address,
      facebookUrl: record.facebookUrl,
      xUrl: record.xUrl,
      instagramUrl: record.instagramUrl,
      snapchatUrl: record.snapchatUrl,
      heroBadge: record.heroBadge || DEFAULT_SETTINGS.heroBadge,
      heroTitle: record.heroTitle || DEFAULT_SETTINGS.heroTitle,
      heroHighlightedText: record.heroHighlightedText || DEFAULT_SETTINGS.heroHighlightedText,
      heroDescription: record.heroDescription || DEFAULT_SETTINGS.heroDescription,
      heroPrimaryButtonText: record.heroPrimaryButtonText || DEFAULT_SETTINGS.heroPrimaryButtonText,
      heroSecondaryButtonText: record.heroSecondaryButtonText || DEFAULT_SETTINGS.heroSecondaryButtonText,
      footerDescription: record.footerDescription || DEFAULT_SETTINGS.footerDescription,
      copyrightText: record.copyrightText || DEFAULT_SETTINGS.copyrightText,
      seoTitle: record.seoTitle || DEFAULT_SETTINGS.seoTitle,
      seoDescription: record.seoDescription || DEFAULT_SETTINGS.seoDescription,
      seoImagePath: record.seoImagePath,
      updatedAt: record.updatedAt,
    };
  } catch (error) {
    console.error("Error fetching site settings:", error);
    return DEFAULT_SETTINGS;
  }
});
