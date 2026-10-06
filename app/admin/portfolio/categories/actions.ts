"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guardian";
import { portfolioCategorySchema } from "@/lib/validations/portfolio";

export interface CategoryFormState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
}

/**
 * Revalidate public and admin paths for portfolio categories
 */
function revalidateCategoryPaths() {
  try {
    revalidatePath("/admin/portfolio/categories");
    revalidatePath("/admin/portfolio");
    revalidatePath("/admin/portfolio/new");
    revalidatePath("/works");
    revalidatePath("/");
  } catch (err) {
    console.error("Error during revalidateCategoryPaths:", err);
  }
}

/**
 * Server Action: Create a new portfolio category
 */
export async function createCategoryAction(
  prevState: CategoryFormState | null,
  formData: FormData
): Promise<CategoryFormState> {
  await requireAdmin();

  const name = (formData.get("name") as string)?.trim() || "";
  const slug = (formData.get("slug") as string)?.trim().toLowerCase() || "";
  const description = (formData.get("description") as string)?.trim() || null;
  const isActive = formData.get("isActive") === "true" || formData.get("isActive") === "on";
  const sortOrder = Number(formData.get("sortOrder") || 0);

  const validation = portfolioCategorySchema.safeParse({
    name,
    slug,
    description,
    isActive,
    sortOrder,
  });

  if (!validation.success) {
    return {
      fieldErrors: validation.error.flatten().fieldErrors,
      error: "يرجى تصحيح الأخطاء الموضحة في النموذج",
    };
  }

  // Check unique slug constraint
  const existing = await prisma.portfolioCategory.findUnique({
    where: { slug: validation.data.slug },
  });

  if (existing) {
    return {
      fieldErrors: {
        slug: ["الاسم اللطيف (Slug) مستخدم بالفعل لتصنيف آخر، يرجى اختيار اسم فريد"],
      },
      error: "الاسم اللطيف (Slug) مسجل مسبقاً في النظام",
    };
  }

  try {
    await prisma.portfolioCategory.create({
      data: {
        name: validation.data.name,
        slug: validation.data.slug,
        description: validation.data.description,
        isActive: validation.data.isActive,
        sortOrder: validation.data.sortOrder,
      },
    });
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    console.error("Error creating portfolio category:", error);
    return {
      error: "حدث خطأ غير متوقع أثناء إضافة التصنيف",
    };
  }

  revalidateCategoryPaths();
  redirect("/admin/portfolio/categories");
}

/**
 * Server Action: Update an existing portfolio category
 */
export async function updateCategoryAction(
  id: string,
  prevState: CategoryFormState | null,
  formData: FormData
): Promise<CategoryFormState> {
  await requireAdmin();

  if (!id) {
    return { error: "معرّف التصنيف مفقود" };
  }

  const existing = await prisma.portfolioCategory.findUnique({
    where: { id },
  });

  if (!existing) {
    return { error: "التصنيف المطلوب غير موجود في النظام" };
  }

  const name = (formData.get("name") as string)?.trim() || "";
  const slug = (formData.get("slug") as string)?.trim().toLowerCase() || "";
  const description = (formData.get("description") as string)?.trim() || null;
  const isActive = formData.get("isActive") === "true" || formData.get("isActive") === "on";
  const sortOrder = Number(formData.get("sortOrder") || 0);

  const validation = portfolioCategorySchema.safeParse({
    name,
    slug,
    description,
    isActive,
    sortOrder,
  });

  if (!validation.success) {
    return {
      fieldErrors: validation.error.flatten().fieldErrors,
      error: "يرجى تصحيح الأخطاء الموضحة في النموذج",
    };
  }

  // Check if slug changed and if conflict exists
  if (validation.data.slug !== existing.slug) {
    const slugConflict = await prisma.portfolioCategory.findUnique({
      where: { slug: validation.data.slug },
    });

    if (slugConflict && slugConflict.id !== id) {
      return {
        fieldErrors: {
          slug: ["الاسم اللطيف (Slug) مستخدم بالفعل لتصنيف آخر، يرجى اختيار اسم فريد"],
        },
        error: "الاسم اللطيف (Slug) مسجل مسبقاً لتصنيف آخر",
      };
    }
  }

  try {
    await prisma.portfolioCategory.update({
      where: { id },
      data: {
        name: validation.data.name,
        slug: validation.data.slug,
        description: validation.data.description,
        isActive: validation.data.isActive,
        sortOrder: validation.data.sortOrder,
      },
    });
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    console.error(`Error updating portfolio category ${id}:`, error);
    return {
      error: "حدث خطأ غير متوقع أثناء تحديث بيانات التصنيف",
    };
  }

  revalidateCategoryPaths();
  redirect("/admin/portfolio/categories");
}

/**
 * Server Action: Toggle category active status
 */
export async function toggleCategoryStatusAction(
  id: string,
  currentStatus: boolean
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    await prisma.portfolioCategory.update({
      where: { id },
      data: { isActive: !currentStatus },
    });

    revalidateCategoryPaths();
    return { success: true };
  } catch (error) {
    console.error(`Error toggling category status for ${id}:`, error);
    return { success: false, error: "تعذر تحديث حالة تفعيل التصنيف" };
  }
}

/**
 * Server Action: Delete a portfolio category safely (prevent delete if category contains items)
 */
export async function deleteCategoryAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    const count = await prisma.portfolioItem.count({
      where: { categoryId: id },
    });

    if (count > 0) {
      return {
        success: false,
        error: `لا يمكن حذف هذا التصنيف لأنه يحتوي على (${count}) من الأعمال المسجلة. يرجى حذف الأعمال أو نقلها لتصنيف آخر أولاً.`,
      };
    }

    await prisma.portfolioCategory.delete({
      where: { id },
    });

    revalidateCategoryPaths();
    return { success: true };
  } catch (error) {
    console.error(`Error deleting portfolio category ${id}:`, error);
    return { success: false, error: "تعذر حذف التصنيف من قاعدة البيانات" };
  }
}
