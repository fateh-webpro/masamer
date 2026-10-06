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
