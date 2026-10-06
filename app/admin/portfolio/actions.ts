"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guardian";
import { portfolioItemSchema } from "@/lib/validations/portfolio";
import {
  saveUploadedFile,
  deleteUploadedFile,
  PORTFOLIO_ALLOWED_MIMES,
  PORTFOLIO_ALLOWED_EXTS,
  PORTFOLIO_MAX_SIZE,
} from "@/lib/upload/storage";

export interface PortfolioFormState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
}

/**
 * Revalidate public and admin paths for portfolio items
 */
function revalidatePortfolioPaths(slugs: string[] = []) {
  try {
    revalidatePath("/admin/portfolio");
    revalidatePath("/admin");
    revalidatePath("/works");
    revalidatePath("/");
    for (const slug of slugs) {
      if (slug) {
        revalidatePath(`/works/${slug}`);
      }
    }
  } catch (err) {
    console.error("Error during revalidatePortfolioPaths:", err);
  }
}

/**
 * Server Action: Create a new portfolio item
 */
export async function createPortfolioItemAction(
  prevState: PortfolioFormState | null,
  formData: FormData
): Promise<PortfolioFormState> {
  await requireAdmin();

  const title = (formData.get("title") as string)?.trim() || "";
  const slug = (formData.get("slug") as string)?.trim().toLowerCase() || "";
  const categoryId = (formData.get("categoryId") as string)?.trim() || "";
  const shortDescription = (formData.get("shortDescription") as string)?.trim() || "";
  const description = (formData.get("description") as string)?.trim() || null;
  const isFeatured = formData.get("isFeatured") === "true" || formData.get("isFeatured") === "on";
  const isActive = formData.get("isActive") === "true" || formData.get("isActive") === "on";
  const sortOrder = Number(formData.get("sortOrder") || 0);

  const validation = portfolioItemSchema.safeParse({
    title,
    slug,
    categoryId,
    shortDescription,
    description,
    isFeatured,
    isActive,
    sortOrder,
  });

  if (!validation.success) {
    return {
      fieldErrors: validation.error.flatten().fieldErrors,
      error: "يرجى تصحيح الأخطاء الموضحة في النموذج",
    };
  }

  // Verify category exists
  const category = await prisma.portfolioCategory.findUnique({
    where: { id: validation.data.categoryId },
  });

  if (!category) {
    return {
      fieldErrors: { categoryId: ["التصنيف المختار غير موجود"] },
      error: "يرجى اختيار تصنيف صالح للعمل",
    };
  }

  // Check unique slug constraint
  const existing = await prisma.portfolioItem.findUnique({
    where: { slug: validation.data.slug },
  });

  if (existing) {
    return {
      fieldErrors: {
        slug: ["الاسم اللطيف (Slug) مستخدم بالفعل لعمل آخر، يرجى اختيار اسم فريد"],
      },
      error: "الاسم اللطيف (Slug) مسجل مسبقاً في النظام",
    };
  }

  // Handle Cover Image (Mandatory on creation)
  const coverFile = formData.get("coverImage") as File | null;
  if (!coverFile || coverFile.size === 0) {
    return {
      fieldErrors: {
        coverImage: ["صورة الغلاف إلزامية لإنشاء العمل في المعرض"],
      },
      error: "يرجى رفع صورة الغلاف للعمل",
    };
  }

  const coverUploadResult = await saveUploadedFile(coverFile, {
    subDirectory: "portfolio",
    prefix: "portfolio-cover",
    allowedMimeTypes: PORTFOLIO_ALLOWED_MIMES,
    allowedExtensions: PORTFOLIO_ALLOWED_EXTS,
    maxSizeBytes: PORTFOLIO_MAX_SIZE,
  });

  if (!coverUploadResult.success || !coverUploadResult.filePath) {
    return {
      fieldErrors: {
        coverImage: [coverUploadResult.error || "تعذر حفظ صورة الغلاف"],
      },
      error: coverUploadResult.error || "خطأ أثناء رفع صورة الغلاف",
    };
  }

  const coverImagePath = coverUploadResult.filePath;
  const uploadedGalleryPaths: string[] = [];

  // Handle Additional Images
  const rawGalleryFiles = formData.getAll("additionalImages") as File[];
  const validGalleryFiles = rawGalleryFiles.filter((f) => f && f.size > 0);

  for (const file of validGalleryFiles) {
    const uploadRes = await saveUploadedFile(file, {
      subDirectory: "portfolio",
      prefix: "portfolio-gallery",
      allowedMimeTypes: PORTFOLIO_ALLOWED_MIMES,
      allowedExtensions: PORTFOLIO_ALLOWED_EXTS,
      maxSizeBytes: PORTFOLIO_MAX_SIZE,
    });

    if (uploadRes.success && uploadRes.filePath) {
      uploadedGalleryPaths.push(uploadRes.filePath);
    }
  }

  try {
    await prisma.portfolioItem.create({
      data: {
        title: validation.data.title,
        slug: validation.data.slug,
        categoryId: validation.data.categoryId,
        shortDescription: validation.data.shortDescription,
        description: validation.data.description,
        coverImagePath,
        isFeatured: validation.data.isFeatured,
        isActive: validation.data.isActive,
        sortOrder: validation.data.sortOrder,
        images: {
          create: uploadedGalleryPaths.map((imagePath, index) => ({
            imagePath,
            sortOrder: index + 1,
            altText: `${validation.data.title} - صورة إضافية ${index + 1}`,
          })),
        },
      },
    });
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    console.error("Error creating portfolio item:", error);

    // Rollback uploaded files to prevent orphan files on disk
    await deleteUploadedFile(coverImagePath, "portfolio");
    for (const galleryPath of uploadedGalleryPaths) {
      await deleteUploadedFile(galleryPath, "portfolio");
    }

    return {
      error: "حدث خطأ غير متوقع أثناء حفظ العمل في قاعدة البيانات",
    };
  }

  revalidatePortfolioPaths([validation.data.slug]);
  redirect("/admin/portfolio");
}

/**
 * Server Action: Update an existing portfolio item
 */
export async function updatePortfolioItemAction(
  id: string,
  prevState: PortfolioFormState | null,
  formData: FormData
): Promise<PortfolioFormState> {
  await requireAdmin();

  if (!id) {
    return { error: "معرّف العمل مفقود" };
  }

  const existingItem = await prisma.portfolioItem.findUnique({
    where: { id },
    include: { images: true },
  });

  if (!existingItem) {
    return { error: "العمل المطلوب غير موجود في النظام" };
  }

  const title = (formData.get("title") as string)?.trim() || "";
  const slug = (formData.get("slug") as string)?.trim().toLowerCase() || "";
  const categoryId = (formData.get("categoryId") as string)?.trim() || "";
  const shortDescription = (formData.get("shortDescription") as string)?.trim() || "";
  const description = (formData.get("description") as string)?.trim() || null;
  const isFeatured = formData.get("isFeatured") === "true" || formData.get("isFeatured") === "on";
  const isActive = formData.get("isActive") === "true" || formData.get("isActive") === "on";
  const sortOrder = Number(formData.get("sortOrder") || 0);

  const validation = portfolioItemSchema.safeParse({
    title,
    slug,
    categoryId,
    shortDescription,
    description,
    isFeatured,
    isActive,
    sortOrder,
  });

  if (!validation.success) {
    return {
      fieldErrors: validation.error.flatten().fieldErrors,
      error: "يرجى تصحيح الأخطاء الموضحة في النموذج",
    };
  }

  // Verify category exists
  const category = await prisma.portfolioCategory.findUnique({
    where: { id: validation.data.categoryId },
  });

  if (!category) {
    return {
      fieldErrors: { categoryId: ["التصنيف المختار غير موجود"] },
      error: "يرجى اختيار تصنيف صالح للعمل",
    };
  }

  // Check unique slug constraint if slug was updated
  if (validation.data.slug !== existingItem.slug) {
    const slugConflict = await prisma.portfolioItem.findUnique({
      where: { slug: validation.data.slug },
    });

    if (slugConflict && slugConflict.id !== id) {
      return {
        fieldErrors: {
          slug: ["الاسم اللطيف (Slug) مستخدم بالفعل لعمل آخر، يرجى اختيار اسم فريد"],
        },
        error: "الاسم اللطيف (Slug) مسجل مسبقاً لعمل آخر",
      };
    }
  }

  // 1. Handle Cover Image Replacement (Optional on update)
  let coverImagePath = existingItem.coverImagePath;
  const coverFile = formData.get("coverImage") as File | null;
  let oldCoverToDelete: string | null = null;

  if (coverFile && coverFile.size > 0) {
    const coverUploadResult = await saveUploadedFile(coverFile, {
      subDirectory: "portfolio",
      prefix: "portfolio-cover",
      allowedMimeTypes: PORTFOLIO_ALLOWED_MIMES,
      allowedExtensions: PORTFOLIO_ALLOWED_EXTS,
      maxSizeBytes: PORTFOLIO_MAX_SIZE,
    });

    if (!coverUploadResult.success || !coverUploadResult.filePath) {
      return {
        fieldErrors: {
          coverImage: [coverUploadResult.error || "تعذر حفظ صورة الغلاف الجديدة"],
        },
        error: coverUploadResult.error || "خطأ أثناء رفع صورة الغلاف الجديدة",
      };
    }

    oldCoverToDelete = existingItem.coverImagePath;
    coverImagePath = coverUploadResult.filePath;
  }

  // 2. Handle Deleting selected gallery images
  const deletedImageIds = formData.getAll("deletedImageIds").map(String);
  const imagesToDelete = existingItem.images.filter((img) => deletedImageIds.includes(img.id));

  // 3. Handle newly uploaded gallery images
  const rawGalleryFiles = formData.getAll("additionalImages") as File[];
  const validGalleryFiles = rawGalleryFiles.filter((f) => f && f.size > 0);
  const newlyUploadedGalleryPaths: string[] = [];

  for (const file of validGalleryFiles) {
    const uploadRes = await saveUploadedFile(file, {
      subDirectory: "portfolio",
      prefix: "portfolio-gallery",
      allowedMimeTypes: PORTFOLIO_ALLOWED_MIMES,
      allowedExtensions: PORTFOLIO_ALLOWED_EXTS,
      maxSizeBytes: PORTFOLIO_MAX_SIZE,
    });

    if (uploadRes.success && uploadRes.filePath) {
      newlyUploadedGalleryPaths.push(uploadRes.filePath);
    }
  }

  try {
    // Determine highest current sortOrder
    const currentMaxSort = existingItem.images.reduce((max, img) => Math.max(max, img.sortOrder), 0);

    await prisma.$transaction(async (tx) => {
      // Delete selected gallery records
      if (deletedImageIds.length > 0) {
        await tx.portfolioImage.deleteMany({
          where: {
            id: { in: deletedImageIds },
            portfolioItemId: id,
          },
        });
      }

      // Add new gallery records
      if (newlyUploadedGalleryPaths.length > 0) {
        await tx.portfolioImage.createMany({
          data: newlyUploadedGalleryPaths.map((imagePath, index) => ({
            portfolioItemId: id,
            imagePath,
            sortOrder: currentMaxSort + index + 1,
            altText: `${validation.data.title} - صورة إضافية`,
          })),
        });
      }

      // Update main item record
      await tx.portfolioItem.update({
        where: { id },
        data: {
          title: validation.data.title,
          slug: validation.data.slug,
          categoryId: validation.data.categoryId,
          shortDescription: validation.data.shortDescription,
          description: validation.data.description,
          coverImagePath,
          isFeatured: validation.data.isFeatured,
          isActive: validation.data.isActive,
          sortOrder: validation.data.sortOrder,
        },
      });
    });

    // Clean up old cover image from disk if replaced
    if (oldCoverToDelete) {
      await deleteUploadedFile(oldCoverToDelete, "portfolio");
    }

    // Clean up deleted gallery images from disk
    for (const img of imagesToDelete) {
      await deleteUploadedFile(img.imagePath, "portfolio");
    }
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    console.error(`Error updating portfolio item ${id}:`, error);

    // If transaction failed, delete newly uploaded files to prevent orphans
    if (oldCoverToDelete && coverImagePath !== existingItem.coverImagePath) {
      await deleteUploadedFile(coverImagePath, "portfolio");
    }
    for (const newPath of newlyUploadedGalleryPaths) {
      await deleteUploadedFile(newPath, "portfolio");
    }

    return {
      error: "حدث خطأ غير متوقع أثناء تحديث بيانات العمل",
    };
  }

  const oldSlug = existingItem.slug;
  const newSlug = validation.data.slug;
  revalidatePortfolioPaths([oldSlug, newSlug]);
  redirect("/admin/portfolio");
}

/**
 * Server Action: Toggle item active status
 */
export async function togglePortfolioItemStatusAction(
  id: string,
  currentStatus: boolean
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    const item = await prisma.portfolioItem.update({
      where: { id },
      data: { isActive: !currentStatus },
    });

    revalidatePortfolioPaths([item.slug]);
    return { success: true };
  } catch (error) {
    console.error(`Error toggling portfolio item status for ${id}:`, error);
    return { success: false, error: "تعذر تحديث حالة التفعيل" };
  }
}

/**
 * Server Action: Toggle item featured status
 */
export async function togglePortfolioItemFeaturedAction(
  id: string,
  currentFeatured: boolean
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    const item = await prisma.portfolioItem.update({
      where: { id },
      data: { isFeatured: !currentFeatured },
    });

    revalidatePortfolioPaths([item.slug]);
    return { success: true };
  } catch (error) {
    console.error(`Error toggling portfolio item featured status for ${id}:`, error);
    return { success: false, error: "تعذر تحديث حالة العرض في الرئيسية" };
  }
}

/**
 * Server Action: Delete a portfolio item with disk cleanup
 */
export async function deletePortfolioItemAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    const item = await prisma.portfolioItem.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!item) {
      return { success: false, error: "العمل المطلوب غير موجود" };
    }

    // Delete from DB (cascades to PortfolioImage)
    await prisma.portfolioItem.delete({
      where: { id },
    });

    // Delete physical files from disk
    await deleteUploadedFile(item.coverImagePath, "portfolio");
    for (const img of item.images) {
      await deleteUploadedFile(img.imagePath, "portfolio");
    }

    revalidatePortfolioPaths([item.slug]);
    return { success: true };
  } catch (error) {
    console.error(`Error deleting portfolio item ${id}:`, error);
    return { success: false, error: "تعذر حذف العمل من قاعدة البيانات" };
  }
}
