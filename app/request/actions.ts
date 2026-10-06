"use server";

import { prisma } from "@/lib/prisma";
import { serviceRequestSchema } from "@/lib/validations/request";
import { getRequestReference } from "@/lib/constants/request";

export interface RequestFormState { error?: string; fieldErrors?: Record<string, string[]>; success?: { reference: string; serviceTitle: string } }

export async function createRequestAction(_: RequestFormState | null, formData: FormData): Promise<RequestFormState> {
  const parsed = serviceRequestSchema.safeParse({ serviceId: formData.get("serviceId"), customerName: formData.get("customerName"), phone: formData.get("phone"), eventDate: formData.get("eventDate") || undefined, city: formData.get("city"), location: formData.get("location") || undefined, guestCount: formData.get("guestCount") || undefined, notes: formData.get("notes") || undefined });
  if (!parsed.success) return { error: "يرجى مراجعة البيانات", fieldErrors: parsed.error.flatten().fieldErrors };
  const service = await prisma.service.findFirst({ where: { id: parsed.data.serviceId, isActive: true }, select: { id: true, title: true } });
  if (!service) return { error: "الخدمة المختارة غير متاحة", fieldErrors: { serviceId: ["اختر خدمة نشطة"] } };
  try {
    const request = await prisma.serviceRequest.create({ data: { serviceId: service.id, customerName: parsed.data.customerName, phone: parsed.data.phone, city: parsed.data.city, location: parsed.data.location || null, guestCount: parsed.data.guestCount || null, notes: parsed.data.notes || null, eventDate: parsed.data.eventDate ? new Date(`${parsed.data.eventDate}T00:00:00`) : null } });
    return { success: { reference: getRequestReference(request.id, request.createdAt), serviceTitle: service.title } };
  } catch (error) { console.error(error); return { error: "تعذر إرسال الطلب الآن، يرجى المحاولة لاحقًا" }; }
}
