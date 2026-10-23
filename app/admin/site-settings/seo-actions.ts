"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guardian";
import { normalizeKeywords, seoPageSettingSchema } from "@/lib/validations/seo-page-setting";

export interface SeoSettingsFormState {
  success?: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  pageKey?: string;
}

function parseKeywordArray(value: FormDataEntryValue | null): string[] {
  if (typeof value !== "string") return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? normalizeKeywords(parsed.filter((item): item is string => typeof item === "string")) : [];
  } catch {
    return [];
  }
}

function optional(value: string): string | null {
  return value || null;
}

export async function updateSeoPageSettingsAction(
  _previousState: SeoSettingsFormState | null,
  formData: FormData
): Promise<SeoSettingsFormState> {
  await requireAdmin();

  const pageKey = String(formData.get("pageKey") ?? "");
  const raw = {
    pageKey,
    seoTitle: String(formData.get("seoTitle") ?? ""),
    seoDescription: String(formData.get("seoDescription") ?? ""),
    primaryKeyword: String(formData.get("primaryKeyword") ?? ""),
    secondaryKeywords: parseKeywordArray(formData.get("secondaryKeywords")),
    localKeywords: {
      الرياض: parseKeywordArray(formData.get("localKeywordsRiyadh")),
      جدة: parseKeywordArray(formData.get("localKeywordsJeddah")),
      الدمام: parseKeywordArray(formData.get("localKeywordsDammam")),
    },
  };
  const validation = seoPageSettingSchema.safeParse(raw);

  if (!validation.success) {
    return {
      success: false,
      pageKey,
      error: "يرجى مراجعة حقول SEO الموضحة أدناه.",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const data = validation.data;
  const [prefix, entityId] = data.pageKey.split(":", 2);
  let canonicalPath: string;
  let pageType: "static" | "service" | "portfolio";

  if (prefix === "static") {
    const paths: Record<string, string> = { home: "/", services: "/services", works: "/works", about: "/about", contact: "/contact" };
    canonicalPath = paths[entityId];
    pageType = "static";
  } else if (prefix === "service") {
    const service = await prisma.service.findFirst({ where: { id: entityId, isActive: true }, select: { id: true, slug: true } });
    if (!service) return { success: false, pageKey, error: "الخدمة المحددة غير موجودة أو غير منشورة." };
    canonicalPath = `/services/${service.slug}`;
    pageType = "service";
  } else {
    const portfolio = await prisma.portfolioItem.findFirst({ where: { id: entityId, isActive: true }, select: { id: true, slug: true } });
    if (!portfolio) return { success: false, pageKey, error: "العمل المحدد غير موجود أو غير منشور." };
    canonicalPath = `/works/${portfolio.slug}`;
    pageType = "portfolio";
  }

  try {
    await prisma.$transaction(async (tx) => {
      if (data.pageKey === "static:home") {
        const existing = await tx.siteSetting.findFirst({ select: { id: true } });
        if (existing) {
          await tx.siteSetting.update({ where: { id: existing.id }, data: { seoTitle: optional(data.seoTitle), seoDescription: optional(data.seoDescription) } });
        } else {
          await tx.siteSetting.create({ data: { seoTitle: optional(data.seoTitle), seoDescription: optional(data.seoDescription) } });
        }
      } else if (pageType === "service") {
        await tx.service.update({ where: { id: entityId }, data: { seoTitle: optional(data.seoTitle), seoDescription: optional(data.seoDescription) } });
      }

      const ownsMetadata = data.pageKey !== "static:home" && pageType !== "service";
      await tx.seoPageSetting.upsert({
        where: { pageKey: data.pageKey },
        create: {
          pageKey: data.pageKey,
          pageType,
          entityId: pageType === "static" ? null : entityId,
          seoTitle: ownsMetadata ? optional(data.seoTitle) : null,
          seoDescription: ownsMetadata ? optional(data.seoDescription) : null,
          primaryKeyword: optional(data.primaryKeyword),
          secondaryKeywords: data.secondaryKeywords,
          localKeywords: data.localKeywords,
        },
        update: {
          pageType,
          entityId: pageType === "static" ? null : entityId,
          seoTitle: ownsMetadata ? optional(data.seoTitle) : null,
          seoDescription: ownsMetadata ? optional(data.seoDescription) : null,
          primaryKeyword: optional(data.primaryKeyword),
          secondaryKeywords: data.secondaryKeywords,
          localKeywords: data.localKeywords,
        },
      });
    });

    revalidatePath("/admin/site-settings");
    revalidatePath(canonicalPath);
    return { success: true, pageKey, message: "تم حفظ إعدادات SEO للصفحة المحددة بنجاح." };
  } catch (error) {
    console.error(`Error saving SEO settings for "${pageKey}":`, error);
    return { success: false, pageKey, error: "تعذر حفظ إعدادات SEO. تحقق من جاهزية قاعدة البيانات ثم أعد المحاولة." };
  }
}
