import { z } from "zod";

export const SITE_SETTING_TEXT_FIELDS = [
  "siteName", "siteNameEn", "shortDescription", "phone", "whatsapp", "email", "address",
  "facebookUrl", "xUrl", "instagramUrl", "snapchatUrl", "heroBadge", "heroTitle",
  "heroHighlightedText", "heroDescription", "heroPrimaryButtonText", "heroSecondaryButtonText",
  "footerDescription", "copyrightText", "seoTitle", "seoDescription",
] as const;

export function mergeSiteSettingFormData(
  formData: FormData,
  current: Partial<Record<(typeof SITE_SETTING_TEXT_FIELDS)[number], string | null | undefined>>,
) {
  return Object.fromEntries(SITE_SETTING_TEXT_FIELDS.map((name) => [
    name,
    formData.has(name) ? formData.get(name) : current[name] ?? (name === "siteName" ? "مسامر" : ""),
  ]));
}

/** Treat absent, null, empty, and whitespace-only form values as optional. */
const optionalFormText = (schema: z.ZodString) =>
  z.preprocess(
    (value) => typeof value === "string" && value.trim() !== "" ? value.trim() : undefined,
    schema.optional(),
  ).transform((value) => value ?? null);

const optionalText = (max: number, message: string) => optionalFormText(z.string().max(max, message));
const optionalSocialUrl = (message: string, domains: readonly string[]) =>
  z.preprocess(
    (value) => typeof value === "string" && value.trim() !== "" ? value.trim() : undefined,
    z.string().url(message).refine((value) => {
      try {
        const hostname = new URL(value).hostname.toLowerCase();
        return domains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
      } catch {
        return false;
      }
    }, message).optional(),
  ).transform((value) => value ?? null);
const optionalEmail = optionalFormText(z.string().email("البريد الإلكتروني غير صالح"));

export const siteSettingSchema = z.object({
  siteName: z.string({ required_error: "اسم الموقع مطلوب", invalid_type_error: "اسم الموقع مطلوب" }).trim().min(2, "اسم الموقع يجب أن يكون حرفين على الأقل").max(120, "اسم الموقع طويل جداً"),
  siteNameEn: optionalText(120, "الاسم بالإنجليزية طويل جداً"),
  shortDescription: optionalText(300, "الوصف المختصر يجب ألا يتجاوز 300 حرف"),
  phone: optionalText(50, "رقم الهاتف طويل جداً"),
  whatsapp: optionalText(50, "رقم الواتساب طويل جداً"),
  email: optionalEmail,
  address: optionalText(255, "العنوان طويل جداً"),
  facebookUrl: optionalSocialUrl("رابط فيسبوك غير صالح", ["facebook.com"]),
  xUrl: optionalSocialUrl("رابط تويتر غير صالح", ["twitter.com", "x.com"]),
  instagramUrl: optionalSocialUrl("رابط إنستغرام غير صالح", ["instagram.com"]),
  snapchatUrl: optionalSocialUrl("رابط سناب شات غير صالح", ["snapchat.com"]),
  heroBadge: optionalText(150, "نص الشارة طويل جداً"),
  heroTitle: optionalText(200, "عنوان الواجهة طويل جداً"),
  heroHighlightedText: optionalText(200, "النص المميز طويل جداً"),
  heroDescription: optionalFormText(z.string()),
  heroPrimaryButtonText: optionalText(80, "نص الزر الرئيسي طويل جداً"),
  heroSecondaryButtonText: optionalText(80, "نص الزر الثانوي طويل جداً"),
  footerDescription: optionalText(500, "وصف التذييل طويل جداً"),
  copyrightText: optionalText(255, "نص الحقوق طويل جداً"),
  seoTitle: optionalText(200, "عنوان SEO طويل جداً"),
  seoDescription: optionalText(400, "وصف SEO طويل جداً"),
});

export type SiteSettingInput = z.infer<typeof siteSettingSchema>;
