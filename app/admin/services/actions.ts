"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guardian";
import { serviceSchema } from "@/lib/validations/service";
import { deleteUploadedFile, saveUploadedFile, SERVICE_ALLOWED_EXTS, SERVICE_ALLOWED_MIMES, SERVICE_MAX_SIZE } from "@/lib/upload/storage";

export interface ServiceFormState { error?: string; fieldErrors?: Record<string, string[]>; success?: boolean }

function values(formData: FormData) {
  return {
    title: String(formData.get("title") || "").trim(), slug: String(formData.get("slug") || "").trim().toLowerCase(),
    shortDescription: String(formData.get("shortDescription") || "").trim(), fullDescription: String(formData.get("fullDescription") || "").trim(),
    icon: String(formData.get("icon") || "Coffee").trim(), features: String(formData.get("features") || "").split("\n").map((v) => v.trim()).filter(Boolean),
    isActive: formData.get("isActive") === "true" || formData.get("isActive") === "on", sortOrder: Number(formData.get("sortOrder") || 0),
  };
}
function revalidateServicePaths(slugs: string[]) { revalidatePath("/admin/services"); revalidatePath("/services"); revalidatePath("/"); slugs.filter(Boolean).forEach((slug) => revalidatePath(`/services/${slug}`)); }
function upload(file: File, prefix: string) { return saveUploadedFile(file, { subDirectory: "services", prefix, allowedMimeTypes: SERVICE_ALLOWED_MIMES, allowedExtensions: SERVICE_ALLOWED_EXTS, maxSizeBytes: SERVICE_MAX_SIZE }); }

export async function createServiceAction(_: ServiceFormState | null, formData: FormData): Promise<ServiceFormState> {
  await requireAdmin(); const validation = serviceSchema.safeParse(values(formData));
  if (!validation.success) return { error: "يرجى تصحيح الأخطاء الموضحة", fieldErrors: validation.error.flatten().fieldErrors };
  if (await prisma.service.findUnique({ where: { slug: validation.data.slug } })) return { error: "الرابط مستخدم مسبقًا", fieldErrors: { slug: ["اختر اسم رابط فريدًا"] } };
  const newPaths: string[] = []; const cover = formData.get("coverImage") as File | null; let coverImagePath: string | null = null;
  if (cover?.size) { const result = await upload(cover, "service-cover"); if (!result.success || !result.filePath) return { error: result.error || "تعذر رفع الغلاف", fieldErrors: { coverImage: [result.error || "تعذر رفع الغلاف"] } }; coverImagePath = result.filePath; newPaths.push(result.filePath); }
  for (const file of formData.getAll("additionalImages") as File[]) { if (!file.size) continue; const result = await upload(file, "service-gallery"); if (!result.success || !result.filePath) { await Promise.all(newPaths.map((p) => deleteUploadedFile(p, "services"))); return { error: result.error || "تعذر رفع إحدى الصور" }; } newPaths.push(result.filePath); }
  const galleryPaths = coverImagePath ? newPaths.slice(1) : newPaths;
  try { await prisma.service.create({ data: { ...validation.data, coverImagePath, images: { create: galleryPaths.map((imagePath, i) => ({ imagePath, altText: `${validation.data.title} - صورة ${i + 1}`, sortOrder: i + 1 })) } } }); }
  catch (error) { console.error(error); await Promise.all(newPaths.map((p) => deleteUploadedFile(p, "services"))); return { error: "تعذر حفظ الخدمة" }; }
  revalidateServicePaths([validation.data.slug]); redirect("/admin/services");
}

export async function updateServiceAction(id: string, _: ServiceFormState | null, formData: FormData): Promise<ServiceFormState> {
  await requireAdmin(); const existing = await prisma.service.findUnique({ where: { id }, include: { images: true } }); if (!existing) return { error: "الخدمة غير موجودة" };
  const validation = serviceSchema.safeParse(values(formData)); if (!validation.success) return { error: "يرجى تصحيح الأخطاء الموضحة", fieldErrors: validation.error.flatten().fieldErrors };
  if (await prisma.service.findFirst({ where: { slug: validation.data.slug, NOT: { id } } })) return { error: "الرابط مستخدم مسبقًا", fieldErrors: { slug: ["اختر اسم رابط فريدًا"] } };
  const newPaths: string[] = []; let coverImagePath = existing.coverImagePath; const cover = formData.get("coverImage") as File | null;
  if (cover?.size) { const result = await upload(cover, "service-cover"); if (!result.success || !result.filePath) return { error: result.error || "تعذر رفع الغلاف" }; coverImagePath = result.filePath; newPaths.push(result.filePath); }
  for (const file of formData.getAll("additionalImages") as File[]) { if (!file.size) continue; const result = await upload(file, "service-gallery"); if (!result.success || !result.filePath) { await Promise.all(newPaths.map((p) => deleteUploadedFile(p, "services"))); return { error: result.error || "تعذر رفع إحدى الصور" }; } newPaths.push(result.filePath); }
  const galleryPaths = cover?.size ? newPaths.slice(1) : newPaths; const deletedIds = formData.getAll("deletedImageIds").map(String); const deleted = existing.images.filter((image) => deletedIds.includes(image.id));
  try { const maxSort = existing.images.reduce((max, image) => Math.max(max, image.sortOrder), 0); await prisma.$transaction(async (tx) => { if (deletedIds.length) await tx.serviceImage.deleteMany({ where: { serviceId: id, id: { in: deletedIds } } }); if (galleryPaths.length) await tx.serviceImage.createMany({ data: galleryPaths.map((imagePath, i) => ({ serviceId: id, imagePath, altText: `${validation.data.title} - صورة إضافية`, sortOrder: maxSort + i + 1 })) }); await tx.service.update({ where: { id }, data: { ...validation.data, coverImagePath } }); }); }
  catch (error) { console.error(error); await Promise.all(newPaths.map((p) => deleteUploadedFile(p, "services"))); return { error: "تعذر تحديث الخدمة" }; }
  if (cover?.size && existing.coverImagePath) await deleteUploadedFile(existing.coverImagePath, "services"); await Promise.all(deleted.map((image) => deleteUploadedFile(image.imagePath, "services")));
  revalidateServicePaths([existing.slug, validation.data.slug]); redirect("/admin/services");
}

export async function toggleServiceStatusAction(id: string, currentStatus: boolean) { await requireAdmin(); try { const service = await prisma.service.update({ where: { id }, data: { isActive: !currentStatus } }); revalidateServicePaths([service.slug]); return { success: true }; } catch { return { success: false, error: "تعذر تحديث حالة الخدمة" }; } }
export async function deleteServiceAction(id: string) { await requireAdmin(); const service = await prisma.service.findUnique({ where: { id }, include: { images: true, _count: { select: { requests: true } } } }); if (!service) return { success: false, error: "الخدمة غير موجودة" }; if (service._count.requests) return { success: false, error: "لا يمكن حذف خدمة مرتبطة بطلبات" }; try { await prisma.service.delete({ where: { id } }); } catch { return { success: false, error: "تعذر حذف الخدمة" }; } await Promise.all([deleteUploadedFile(service.coverImagePath, "services"), ...service.images.map((image) => deleteUploadedFile(image.imagePath, "services"))]); revalidateServicePaths([service.slug]); return { success: true }; }
