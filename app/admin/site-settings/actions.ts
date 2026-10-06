"use server";

import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guardian";
import { mergeSiteSettingFormData, siteSettingSchema } from "@/lib/validations/site-setting";
import { deleteUploadedFile, saveUploadedFile } from "@/lib/upload/storage";

function saveBrandLogo(file: File, prefix: string) {
  return saveUploadedFile(file, {
    prefix,
    allowedMimeTypes: ["image/png", "image/webp"],
    allowedExtensions: [".png", ".webp"],
    maxSizeBytes: 2 * 1024 * 1024,
  });
}

const backgroundUploads = [
  { fieldName: "homeHeroBackgroundFile", pathKey: "homeHeroBackgroundPath", prefix: "home-hero", label: "خلفية الواجهة الرئيسية" },
  { fieldName: "homeHeroCardBackgroundFile", pathKey: "homeHeroCardBackgroundPath", prefix: "home-hero-card", label: "خلفية بطاقة Hero الجانبية" },
  { fieldName: "homeStandardsBackgroundFile", pathKey: "homeStandardsBackgroundPath", prefix: "home-standards", label: "خلفية قسم معاييرنا" },
  { fieldName: "worksCtaBackgroundFile", pathKey: "worksCtaBackgroundPath", prefix: "works-cta", label: "خلفية قسم تجهيز مخصص لمناسبتك" },
  { fieldName: "aboutBackgroundFile", pathKey: "aboutBackgroundPath", prefix: "about", label: "خلفية صفحة من نحن" },
  { fieldName: "contactBackgroundFile", pathKey: "contactBackgroundPath", prefix: "contact", label: "خلفية صفحة تواصل معنا" },
  { fieldName: "requestBackgroundFile", pathKey: "requestBackgroundPath", prefix: "request", label: "خلفية صفحة طلب الخدمة" },
  { fieldName: "ctaBackgroundFile", pathKey: "ctaBackgroundPath", prefix: "cta", label: "خلفية CTA" },
] as const;

type BackgroundPathKey = (typeof backgroundUploads)[number]["pathKey"];

function saveInterfaceBackground(file: File, prefix: string) {
  return saveUploadedFile(file, {
    prefix,
    subDirectory: "site-backgrounds",
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    allowedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
    maxSizeBytes: 5 * 1024 * 1024,
  });
}

export interface SiteSettingsFormState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
  message?: string;
}

export async function updateSiteSettingsAction(
  prevState: SiteSettingsFormState | null,
  formData: FormData
): Promise<SiteSettingsFormState> {
  await requireAdmin();

  // Inputs from inactive tabs are not mounted, so FormData omits them entirely.
  // Preserve their stored values while allowing an explicitly submitted "" to clear an optional field.
  const existing = await prisma.siteSetting.findFirst();
  // 1. Extract and merge text fields
  const rawData = mergeSiteSettingFormData(formData, existing ?? {});

  const validation = siteSettingSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      fieldErrors: validation.error.flatten().fieldErrors,
      error: "يرجى مراجعة الحقول الموضحة أدناه.",
    };
  }

  let newLogoPath: string | null = null;
  let newLogoDarkPath: string | null = null;
  const newBackgroundPaths: Partial<Record<BackgroundPathKey, string>> = {};
  const cleanupNewUploads = async () => {
    await Promise.all([
      deleteUploadedFile(newLogoPath, "site"),
      deleteUploadedFile(newLogoDarkPath, "site"),
      ...Object.values(newBackgroundPaths).map((filePath) =>
        deleteUploadedFile(filePath, "site-backgrounds")
      ),
    ]);
  };

  try {
    let logoPath = existing?.logoPath || null;
    let logoDarkPath = existing?.logoDarkPath || null;
    let faviconPath = existing?.faviconPath || null;
    let seoImagePath = existing?.seoImagePath || null;
    const backgroundPaths: Record<BackgroundPathKey, string | null> = {
      homeHeroBackgroundPath: existing?.homeHeroBackgroundPath || null,
      homeHeroCardBackgroundPath: existing?.homeHeroCardBackgroundPath || null,
      homeStandardsBackgroundPath: existing?.homeStandardsBackgroundPath || null,
      worksCtaBackgroundPath: existing?.worksCtaBackgroundPath || null,
      aboutBackgroundPath: existing?.aboutBackgroundPath || null,
      contactBackgroundPath: existing?.contactBackgroundPath || null,
      requestBackgroundPath: existing?.requestBackgroundPath || null,
      ctaBackgroundPath: existing?.ctaBackgroundPath || null,
    };

    // 3. Process Logo upload if provided
    const logoFile = formData.get("logoFile") as File | null;
    if (logoFile && logoFile.size > 0) {
      const uploadRes = await saveBrandLogo(logoFile, "logo");

      if (!uploadRes.success) {
        return {
          success: false,
          error: uploadRes.error || "فشل رفع الشعار",
        };
      }
      logoPath = uploadRes.filePath || null;
      newLogoPath = logoPath;
    }

    // 4. Process dark-background logo upload if provided
    const logoDarkFile = formData.get("logoDarkFile") as File | null;
    if (logoDarkFile && logoDarkFile.size > 0) {
      const uploadRes = await saveBrandLogo(logoDarkFile, "logo-dark");

      if (!uploadRes.success) {
        await cleanupNewUploads();
        return {
          success: false,
          error: uploadRes.error || "فشل رفع شعار الخلفيات الداكنة",
        };
      }
      logoDarkPath = uploadRes.filePath || null;
      newLogoDarkPath = logoDarkPath;
    }

    // 5. Process Favicon upload if provided
    const faviconFile = formData.get("faviconFile") as File | null;
    if (faviconFile && faviconFile.size > 0) {
      const uploadRes = await saveUploadedFile(faviconFile, {
        prefix: "favicon",
        allowedMimeTypes: ["image/png", "image/webp", "image/x-icon", "image/vnd.microsoft.icon"],
        allowedExtensions: [".png", ".webp", ".ico"],
        maxSizeBytes: 1 * 1024 * 1024,
        previousFilePath: existing?.faviconPath,
      });

      if (!uploadRes.success) {
        await cleanupNewUploads();
        return {
          success: false,
          error: uploadRes.error || "فشل رفع أيقونة الموقع (Favicon)",
        };
      }
      faviconPath = uploadRes.filePath || null;
    }

    // 6. Process SEO Image upload if provided
    const seoImageFile = formData.get("seoImageFile") as File | null;
    if (seoImageFile && seoImageFile.size > 0) {
      const uploadRes = await saveUploadedFile(seoImageFile, {
        prefix: "seo-og",
        allowedMimeTypes: ["image/png", "image/webp", "image/jpeg"],
        allowedExtensions: [".png", ".webp", ".jpg", ".jpeg"],
        maxSizeBytes: 5 * 1024 * 1024,
        previousFilePath: existing?.seoImagePath,
      });

      if (!uploadRes.success) {
        await cleanupNewUploads();
        return {
          success: false,
          error: uploadRes.error || "فشل رفع صورة المشاركة لمحركات البحث (SEO Image)",
        };
      }
      seoImagePath = uploadRes.filePath || null;
    }

    for (const upload of backgroundUploads) {
      const file = formData.get(upload.fieldName) as File | null;
      if (!file || file.size === 0) continue;

      const uploadRes = await saveInterfaceBackground(file, upload.prefix);
      if (!uploadRes.success || !uploadRes.filePath) {
        await cleanupNewUploads();
        return {
          success: false,
          error: uploadRes.error || `فشل رفع ${upload.label}`,
        };
      }

      backgroundPaths[upload.pathKey] = uploadRes.filePath;
      newBackgroundPaths[upload.pathKey] = uploadRes.filePath;
    }

    // 7. Upsert Single Record in Database
    if (existing) {
      await prisma.siteSetting.update({
        where: { id: existing.id },
        data: {
          ...validation.data,
          logoPath,
          logoDarkPath,
          faviconPath,
          seoImagePath,
          ...backgroundPaths,
        },
      });
    } else {
      await prisma.siteSetting.create({
        data: {
          ...validation.data,
          logoPath,
          logoDarkPath,
          faviconPath,
          seoImagePath,
          ...backgroundPaths,
        },
      });
    }

    if (newLogoPath && existing?.logoPath) {
      await deleteUploadedFile(existing.logoPath, "site");
    }
    if (newLogoDarkPath && existing?.logoDarkPath) {
      await deleteUploadedFile(existing.logoDarkPath, "site");
    }
    for (const upload of backgroundUploads) {
      const newPath = newBackgroundPaths[upload.pathKey];
      const oldPath = existing?.[upload.pathKey];
      if (newPath && oldPath) {
        await deleteUploadedFile(oldPath, "site-backgrounds");
      }
    }

    // 8. Targeted Revalidations
    try {
      revalidatePath("/");
      revalidatePath("/services");
      revalidatePath("/admin/site-settings");
      if (newBackgroundPaths.aboutBackgroundPath) revalidatePath("/about");
      if (newBackgroundPaths.contactBackgroundPath) revalidatePath("/contact");
      if (newBackgroundPaths.requestBackgroundPath) revalidatePath("/request");
      if (newBackgroundPaths.worksCtaBackgroundPath) revalidatePath("/works");
    } catch (revalErr) {
      console.error("Revalidation error:", revalErr);
    }

    return {
      success: true,
      message: "تم حفظ إعدادات وهيكل الموقع بنجاح",
    };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    await cleanupNewUploads();
    console.error("Error updating site settings:", error);
    return {
      success: false,
      error: "حدث خطأ غير متوقع أثناء حفظ إعدادات الموقع في قاعدة البيانات",
    };
  }
}
