import { z } from "zod";

export const SEO_CITIES = ["الرياض", "جدة", "الدمام"] as const;

const plainText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} يجب ألا يتجاوز ${max} حرفًا`)
    .refine((value) => !/[<>]/.test(value), `${label} لا يقبل وسوم HTML`)
    .refine((value) => !/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value), `${label} يحتوي محارف غير صالحة`);

const keyword = plainText(100, "الكلمة المفتاحية").refine(
  (value) => value.length >= 2,
  "الكلمة المفتاحية قصيرة جدًا"
);

export const seoPageSettingSchema = z.object({
  pageKey: z
    .string()
    .max(255)
    .regex(
      /^(?:static:(?:home|services|works|about|contact)|service:[A-Za-z0-9_-]+|portfolio:[A-Za-z0-9_-]+)$/,
      "معرف الصفحة غير صالح"
    ),
  seoTitle: plainText(200, "عنوان SEO"),
  seoDescription: plainText(400, "وصف SEO"),
  primaryKeyword: plainText(160, "الكلمة الرئيسية"),
  secondaryKeywords: z.array(keyword).max(12, "الحد الأقصى 12 كلمة ثانوية"),
  localKeywords: z.object({
    الرياض: z.array(keyword).max(8, "الحد الأقصى 8 عبارات لمدينة الرياض"),
    جدة: z.array(keyword).max(8, "الحد الأقصى 8 عبارات لمدينة جدة"),
    الدمام: z.array(keyword).max(8, "الحد الأقصى 8 عبارات لمدينة الدمام"),
  }),
});

export type SeoPageSettingInput = z.infer<typeof seoPageSettingSchema>;

export function normalizeKeywords(values: string[]): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const value of values) {
    const clean = value.trim().replace(/\s+/g, " ");
    const key = clean.toLocaleLowerCase("ar");
    if (!clean || seen.has(key)) continue;
    seen.add(key);
    normalized.push(clean);
  }

  return normalized;
}
