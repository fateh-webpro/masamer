"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guardian";
import { serviceCategorySchema } from "@/lib/validations/service";

export interface ServiceCategoryFormState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
}

function revalidateServiceCategoryPaths() {
  try {
    revalidatePath("/admin/services/categories");
    revalidatePath("/admin/services");
    revalidatePath("/admin/services/new");
    revalidatePath("/services");
    revalidatePath("/");
  } catch (err) {
    console.error("Error during revalidateServiceCategoryPaths:", err);
  }
}

export async function createServiceCategoryAction(
  prevState: ServiceCategoryFormState | null,
  formData: FormData
): Promise<ServiceCategoryFormState> {
  await requireAdmin();

  const name = (formData.get("name") as string)?.trim() || "";
  const slug = (formData.get("slug") as string)?.trim().toLowerCase() || "";
  const description = (formData.get("description") as string)?.trim() || null;
  const icon = (formData.get("icon") as string)?.trim() || "Coffee";
  const isActive = formData.get("isActive") === "true" || formData.get("isActive") === "on";
  const sortOrder = Number(formData.get("sortOrder") || 0);

  const validation = serviceCategorySchema.safeParse({
    name,
    slug,
    description,
    icon,
    isActive,
    sortOrder,
  });

  if (!validation.success) {
    return {
      fieldErrors: validation.error.flatten().fieldErrors,
      error: "يرجى تصحيح الأخطاء الموضحة في النموذج",
    };
  }

  try {
    const existing = await prisma.serviceCategory.findUnique({
      where: { slug: validation.data.slug },
    });

    if (existing) {
      return {
        fieldErrors: {
          slug: ["الاسم اللطيف (Slug) مستخدم بالفعل لتصنيف آخر، يرجى اختيار اسم فريد"],
        },
        error: "الاسم اللطيف مسجل مسبقاً في النظام",
      };
    }

    await prisma.serviceCategory.create({
      data: {
        name: validation.data.name,
        slug: validation.data.slug,
        description: validation.data.description,
        icon: validation.data.icon,
        isActive: validation.data.isActive,
        sortOrder: validation.data.sortOrder,
      },
    });
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    console.error("Error creating service category:", error);
    return {
      error: "حدث خطأ أثناء إضافة تصنيف الخدمة",
    };
  }

  revalidateServiceCategoryPaths();
  redirect("/admin/services/categories");
}

export async function updateServiceCategoryAction(
  id: string,
  prevState: ServiceCategoryFormState | null,
  formData: FormData
): Promise<ServiceCategoryFormState> {
  await requireAdmin();

  if (!id) {
    return { error: "معرّف التصنيف مفقود" };
  }

  const name = (formData.get("name") as string)?.trim() || "";
  const slug = (formData.get("slug") as string)?.trim().toLowerCase() || "";
  const description = (formData.get("description") as string)?.trim() || null;
  const icon = (formData.get("icon") as string)?.trim() || "Coffee";
  const isActive = formData.get("isActive") === "true" || formData.get("isActive") === "on";
  const sortOrder = Number(formData.get("sortOrder") || 0);

  const validation = serviceCategorySchema.safeParse({
    name,
    slug,
    description,
    icon,
    isActive,
    sortOrder,
  });

  if (!validation.success) {
    return {
      fieldErrors: validation.error.flatten().fieldErrors,
      error: "يرجى تصحيح الأخطاء الموضحة في النموذج",
    };
  }

  try {
    const existing = await prisma.serviceCategory.findUnique({
      where: { id },
    });

    if (!existing) {
      return { error: "التصنيف المطلوب غير موجود" };
    }

    if (validation.data.slug !== existing.slug) {
      const slugConflict = await prisma.serviceCategory.findUnique({
        where: { slug: validation.data.slug },
      });

      if (slugConflict && slugConflict.id !== id) {
        return {
          fieldErrors: {
            slug: ["الاسم اللطيف (Slug) مستخدم بالفعل لتصنيف آخر"],
          },
          error: "الاسم اللطيف مسجل مسبقاً",
        };
      }
    }

    await prisma.serviceCategory.update({
      where: { id },
      data: {
        name: validation.data.name,
        slug: validation.data.slug,
        description: validation.data.description,
        icon: validation.data.icon,
        isActive: validation.data.isActive,
        sortOrder: validation.data.sortOrder,
      },
    });
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    console.error(`Error updating service category ${id}:`, error);
    return {
      error: "حدث خطأ أثناء تحديث التصنيف",
    };
  }

  revalidateServiceCategoryPaths();
  redirect("/admin/services/categories");
}

export async function toggleServiceCategoryStatusAction(
  id: string,
  currentStatus: boolean
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    await prisma.serviceCategory.update({
      where: { id },
      data: { isActive: !currentStatus },
    });

    revalidateServiceCategoryPaths();
    return { success: true };
  } catch (error) {
    console.error(`Error toggling service category status for ${id}:`, error);
    return { success: false, error: "تعذر تحديث حالة تفعيل التصنيف" };
  }
}

export async function deleteServiceCategoryAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    const count = await prisma.service.count({
      where: { categoryId: id },
    });

    if (count > 0) {
      return {
        success: false,
        error: `لا يمكن حذف هذا التصنيف لأنه مرتبط بـ (${count}) من الخدمات. يرجى تعديل الخدمات المرتبطة أولاً.`,
      };
    }

    await prisma.serviceCategory.delete({
      where: { id },
    });

    revalidateServiceCategoryPaths();
    return { success: true };
  } catch (error) {
    console.error(`Error deleting service category ${id}:`, error);
    return { success: false, error: "تعذر حذف التصنيف" };
  }
}
