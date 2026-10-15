"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guardian";
import { requestAdminUpdateSchema } from "@/lib/validations/request";

export async function updateRequestAction(id: string, _: { error?: string; success?: boolean } | null, formData: FormData) {
  await requireAdmin();
  const parsed = requestAdminUpdateSchema.safeParse({ status: formData.get("status"), adminNotes: formData.get("adminNotes") || undefined });
  if (!parsed.success) return { error: "بيانات التحديث غير صالحة" };
  try { await prisma.serviceRequest.update({ where: { id }, data: { status: parsed.data.status, adminNotes: parsed.data.adminNotes || null } }); }
  catch { return { error: "تعذر تحديث الطلب" }; }
  revalidatePath("/admin/requests"); revalidatePath(`/admin/requests/${id}`); return { success: true };
}

export async function deleteRequestAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  return deleteRequestRecord(id);
}

export async function deleteRequestRecord(
  id: string,
  db = prisma
): Promise<{ success: boolean; error?: string }> {
  const trimmedId = typeof id === "string" ? id.trim() : "";
  if (!trimmedId) {
    return { success: false, error: "معرّف الطلب غير صالح" };
  }

  try {
    const existing = await db.serviceRequest.findUnique({
      where: { id: trimmedId },
      select: { id: true },
    });

    if (!existing) {
      return { success: false, error: "الطلب غير موجود أو تم حذفه مسبقاً" };
    }

    // Atomic transaction: safely delete associated request items and the service request itself
    await db.$transaction(async (tx) => {
      await tx.serviceRequestItem.deleteMany({
        where: { requestId: trimmedId },
      });
      await tx.serviceRequest.delete({
        where: { id: trimmedId },
      });
    });

    try {
      revalidatePath("/admin/requests");
      revalidatePath(`/admin/requests/${trimmedId}`);
      revalidatePath("/admin");
    } catch {
      // Ignore revalidatePath outside request scope (e.g. during tests)
    }

    return { success: true };
  } catch (error) {
    console.error(`Error deleting service request ${trimmedId}:`, error);
    return { success: false, error: "تعذر حذف الطلب، يرجى المحاولة لاحقاً" };
  }
}
