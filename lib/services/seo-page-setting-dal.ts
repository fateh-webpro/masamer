import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/services/site-setting-dal";
import { getAllServicesForAdmin } from "@/lib/services/service-dal";
import { getActivePortfolioItems } from "@/lib/services/portfolio-dal";
import { SEO_CITIES } from "@/lib/validations/seo-page-setting";

export type SeoPageType = "static" | "service" | "portfolio";
export type LocalKeywords = Record<(typeof SEO_CITIES)[number], string[]>;

export interface SeoPageValues {
  seoTitle: string;
  seoDescription: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  localKeywords: LocalKeywords;
}

export interface SeoPageTarget extends SeoPageValues {
  pageKey: string;
  pageType: SeoPageType;
  entityId: string | null;
  label: string;
  canonicalPath: string;
  fallbackTitle: string;
  fallbackDescription: string;
}

const EMPTY_LOCAL_KEYWORDS: LocalKeywords = { الرياض: [], جدة: [], الدمام: [] };

const STATIC_PAGES = [
  { key: "static:home", label: "الصفحة الرئيسية", path: "/", title: "مسامر | خدمات الضيافة وتجهيز المناسبات", description: "خدمات الضيافة وتجهيز المناسبات بلمسة منظمة وراقية من مسامر." },
  { key: "static:services", label: "خدماتنا", path: "/services", title: "خدمات الضيافة وتجهيز المناسبات والحفلات", description: "خدمات ضيافة وتجهيز مناسبات تشمل القهوجيين والصبابين والخيام والجلسات والديكورات." },
  { key: "static:works", label: "أعمالنا", path: "/works", title: "معرض الأعمال وتجهيزات المناسبات", description: "نماذج من أعمال مسامر في تجهيز الفعاليات والمناسبات وخدمات الضيافة والتأثيث." },
  { key: "static:about", label: "من نحن", path: "/about", title: "عن مسامر", description: "تعرف على مسامر ورؤيتها وقيمها وأسلوبها في إدارة الضيافة وتجهيز المناسبات." },
  { key: "static:contact", label: "تواصل معنا", path: "/contact", title: "تواصل مع مسامر", description: "تواصل مع فريق مسامر للاستفسار عن خدمات الضيافة وتجهيز المناسبات." },
] as const;

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function localKeywordMap(value: unknown): LocalKeywords {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { ...EMPTY_LOCAL_KEYWORDS };
  const source = value as Record<string, unknown>;
  return {
    الرياض: stringArray(source.الرياض),
    جدة: stringArray(source.جدة),
    الدمام: stringArray(source.الدمام),
  };
}

function valuesFromRecord(record: Awaited<ReturnType<typeof getSeoPageSetting>>): SeoPageValues {
  return {
    seoTitle: record?.seoTitle ?? "",
    seoDescription: record?.seoDescription ?? "",
    primaryKeyword: record?.primaryKeyword ?? "",
    secondaryKeywords: stringArray(record?.secondaryKeywords),
    localKeywords: localKeywordMap(record?.localKeywords),
  };
}

export const getSeoPageSetting = cache(async (pageKey: string) => {
  try {
    return await prisma.seoPageSetting.findUnique({ where: { pageKey } });
  } catch (error) {
    console.error(`Error fetching SEO settings for "${pageKey}":`, error);
    return null;
  }
});

export function cleanSeoTitle(title: string): string {
  return title.replace(/\s*[|\-–—]\s*(?:مسامر|MASAMER)\s*$/iu, "").trim();
}

export async function getSeoAdminTargets(): Promise<SeoPageTarget[]> {
  const [settings, services, portfolio, records] = await Promise.all([
    getSiteSettings(),
    getAllServicesForAdmin(),
    getActivePortfolioItems(),
    prisma.seoPageSetting.findMany().catch((error) => {
      console.error("Error fetching SEO page settings for admin:", error);
      return [];
    }),
  ]);
  const recordMap = new Map(records.map((record) => [record.pageKey, record]));

  const staticTargets = STATIC_PAGES.map((page) => {
    const stored = valuesFromRecord(recordMap.get(page.key) ?? null);
    return {
      ...stored,
      pageKey: page.key,
      pageType: "static" as const,
      entityId: null,
      label: page.label,
      canonicalPath: page.path,
      fallbackTitle: page.key === "static:home" ? settings.seoTitle : page.title,
      fallbackDescription: page.key === "static:home" ? settings.seoDescription : page.description,
      seoTitle: page.key === "static:home" ? settings.seoTitle : stored.seoTitle,
      seoDescription: page.key === "static:home" ? settings.seoDescription : stored.seoDescription,
    };
  });

  const serviceTargets = services.filter((service) => service.isActive).map((service) => {
    const pageKey = `service:${service.id}`;
    const stored = valuesFromRecord(recordMap.get(pageKey) ?? null);
    return {
      ...stored,
      pageKey,
      pageType: "service" as const,
      entityId: service.id,
      label: `خدمة: ${service.title}`,
      canonicalPath: `/services/${service.slug}`,
      fallbackTitle: service.title,
      fallbackDescription: service.shortDescription,
      seoTitle: service.seoTitle ?? "",
      seoDescription: service.seoDescription ?? "",
    };
  });

  const portfolioTargets = portfolio.map((item) => {
    const pageKey = `portfolio:${item.id}`;
    const stored = valuesFromRecord(recordMap.get(pageKey) ?? null);
    return {
      ...stored,
      pageKey,
      pageType: "portfolio" as const,
      entityId: item.id,
      label: `عمل: ${item.title}`,
      canonicalPath: `/works/${item.slug}`,
      fallbackTitle: item.title,
      fallbackDescription: item.shortDescription,
    };
  });

  return [...staticTargets, ...serviceTargets, ...portfolioTargets];
}
