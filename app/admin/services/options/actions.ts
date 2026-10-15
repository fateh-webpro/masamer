"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guardian";
import { serviceOptionSchema } from "@/lib/validations/service";

export interface ServiceOptionItemData {
  id: string;
  serviceId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OptionActionResult {
  success: boolean;
  action?: "created" | "updated" | "deleted" | "deactivated" | "toggled";
  message?: string;
  error?: string;
  option?: ServiceOptionItemData;
}

// Backward-compatible alias for existing imports
export type OptionActionState = OptionActionResult;

function revalidatePaths(serviceSlug?: string) {
  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/");
  if (serviceSlug) {
    revalidatePath(`/services/${serviceSlug}`);
  }
}

export async function createServiceOptionAction(
  prevState: OptionActionResult | null,
  formData: FormData
): Promise<OptionActionResult> {
  await requireAdmin();

  const serviceId = String(formData.get("serviceId") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const isActive = formData.get("isActive") === "true" || formData.get("isActive") === "on";
  const sortOrder = Number(formData.get("sortOrder") || 0);

  const validation = serviceOptionSchema.safeParse({
    serviceId,
    name,
    description,
    isActive,
    sortOrder,
  });

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0]?.message || "بيانات الخيار الفرعي غير صالحة",
    };
  }

  try {
    const service = await prisma.service.findUnique({
      where: { id: validation.data.serviceId },
      select: { id: true, slug: true },
    });

    if (!service) {
      return { success: false, error: "الخدمة الرئيسية غير موجودة" };
    }

    const created = await prisma.serviceOption.create({
      data: {
        serviceId: service.id,
        name: validation.data.name,
        description: validation.data.description,
        isActive: validation.data.isActive,
        sortOrder: validation.data.sortOrder,
      },
    });

    revalidatePath(`/admin/services/${service.id}`);
    revalidatePaths(service.slug);

    return {
      success: true,
      action: "created",
      message: "تمت إضافة الخيار الفرعي بنجاح",
      option: {
        id: created.id,
        serviceId: created.serviceId,
        name: created.name,
        description: created.description,
        isActive: created.isActive,
        sortOrder: created.sortOrder,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      },
    };
  } catch (error) {
    console.error("Error creating service option:", error);
    return { success: false, error: "تعذر حفظ الخيار الفرعي، يرجى المحاولة لاحقاً" };
  }
}

export async function updateServiceOptionAction(
  id: string,
  prevState: OptionActionResult | null,
  formData: FormData
): Promise<OptionActionResult> {
  await requireAdmin();

  if (!id || id.startsWith("temp-")) return { success: false, error: "معرف الخيار غير صالح أو مفقود" };

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const isActive = formData.get("isActive") === "true" || formData.get("isActive") === "on";
  const sortOrder = Number(formData.get("sortOrder") || 0);

  if (!name || name.length < 2) {
    return { success: false, error: "اسم الخيار يجب أن يكون حرفين على الأقل" };
  }

  try {
    const existing = await prisma.serviceOption.findUnique({
      where: { id },
      include: { service: { select: { id: true, slug: true } } },
    });

    if (!existing) {
      return { success: false, error: "الخيار الفرعي غير موجود" };
    }

    const updated = await prisma.serviceOption.update({
      where: { id },
      data: {
        name,
        description,
        isActive,
        sortOrder,
      },
    });

    revalidatePath(`/admin/services/${existing.service.id}`);
    revalidatePaths(existing.service.slug);

    return {
      success: true,
      action: "updated",
      message: "تم تحديث الخيار الفرعي بنجاح",
      option: {
        id: updated.id,
        serviceId: updated.serviceId,
        name: updated.name,
        description: updated.description,
        isActive: updated.isActive,
        sortOrder: updated.sortOrder,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    };
  } catch (error) {
    console.error(`Error updating service option ${id}:`, error);
    return { success: false, error: "تعذر تحديث الخيار الفرعي" };
  }
}

export async function toggleServiceOptionStatusAction(
  id: string,
  currentStatus: boolean
): Promise<OptionActionResult> {
  await requireAdmin();

  if (!id || id.startsWith("temp-")) {
    return { success: false, error: "معرف الخيار غير صالح" };
  }

  try {
    const option = await prisma.serviceOption.update({
      where: { id },
      data: { isActive: !currentStatus },
      include: { service: { select: { id: true, slug: true } } },
    });

    revalidatePath(`/admin/services/${option.service.id}`);
    revalidatePaths(option.service.slug);

    return {
      success: true,
      action: "toggled",
      message: option.isActive ? "تم تفعيل الخيار بنجاح" : "تم تعطيل الخيار بنجاح",
    };
  } catch (error) {
    console.error(`Error toggling option status for ${id}:`, error);
    return { success: false, error: "تعذر تغيير حالة تفعيل الخيار" };
  }
}

export async function deleteServiceOptionAction(
  id: string
): Promise<OptionActionResult> {
  await requireAdmin();

  if (!id || id.startsWith("temp-")) {
    return { success: false, error: "معرف الخيار غير صالح" };
  }

  try {
    const existing = await prisma.serviceOption.findUnique({
      where: { id },
      include: {
        service: { select: { id: true, slug: true } },
        _count: { select: { requestItems: true } },
      },
    });

    if (!existing) {
      return { success: false, error: "الخيار غير موجود" };
    }

    // Default safe action is deactivation instead of deletion if linked to orders
    if (existing._count.requestItems > 0) {
      // Rather than a destructive delete, safely deactivate it so past orders stay clean
      await prisma.serviceOption.update({
        where: { id },
        data: { isActive: false },
      });

      revalidatePath(`/admin/services/${existing.service.id}`);
      revalidatePaths(existing.service.slug);

      return {
        success: true,
        action: "deactivated",
        message: `تم تعطيل الخيار الفرعي بدلاً من حذفه لوجود (${existing._count.requestItems}) طلبات سابقة مرتبطة به، للحفاظ على دقة السجلات.`,
      };
    }

    await prisma.serviceOption.delete({
      where: { id },
    });

    revalidatePath(`/admin/services/${existing.service.id}`);
    revalidatePaths(existing.service.slug);

    return {
      success: true,
      action: "deleted",
      message: "تم حذف الخيار الفرعي بنجاح",
    };
  } catch (error) {
    console.error(`Error deleting option ${id}:`, error);
    return { success: false, error: "تعذر حذف الخيار الفرعي، يرجى المحاولة لاحقاً" };
  }
}
