"use server";

import { prisma } from "@/lib/prisma";
import { serviceRequestSchema, type RequestItemInput } from "@/lib/validations/request";
import { getRequestReference } from "@/lib/constants/request";

export interface RequestFormState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: {
    reference: string;
    serviceTitle: string;
  };
}

function parseItemsFromFormData(raw: unknown): RequestItemInput[] {
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => ({
      serviceId: item.serviceId ? String(item.serviceId) : undefined,
      serviceName: String(item.serviceName || "").trim(),
      categoryName: item.categoryName ? String(item.categoryName).trim() : undefined,
      quantity: Number(item.quantity) || 1,
    }));
  } catch {
    return [];
  }
}

export async function createRequestAction(
  _: RequestFormState | null,
  formData: FormData
): Promise<RequestFormState> {
  const selectedCity = String(formData.get("city") || "").trim();
  const customCity = String(formData.get("customCity") || "").trim();
  const finalCity = selectedCity === "أخرى" || selectedCity === "other" ? customCity : selectedCity;

  const rawItems = formData.get("items");
  const items = parseItemsFromFormData(rawItems);
  const singleServiceId = formData.get("serviceId") ? String(formData.get("serviceId")).trim() : undefined;

  const parsed = serviceRequestSchema.safeParse({
    customerName: formData.get("customerName"),
    phone: formData.get("phone"),
    eventDate: formData.get("eventDate"),
    city: finalCity,
    district: formData.get("district") ? String(formData.get("district")).trim() : undefined,
    location: formData.get("location") ? String(formData.get("location")).trim() : undefined,
    guestCount: formData.get("guestCount") ? String(formData.get("guestCount")).trim() : undefined,
    notes: formData.get("notes") ? String(formData.get("notes")).trim() : undefined,
    customRequest: formData.get("customRequest") ? String(formData.get("customRequest")).trim() : undefined,
    items,
    serviceId: singleServiceId,
  });

  if (!parsed.success) {
    return {
      error: "يرجى مراجعة وتصحيح البيانات المدخلة",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // Find a valid primary service ID if present
  let matchedServiceId: string | null = null;
  const firstItemServiceId = parsed.data.items.find((i) => i.serviceId)?.serviceId || parsed.data.serviceId;
  if (firstItemServiceId) {
    const svc = await prisma.service.findFirst({
      where: { id: firstItemServiceId, isActive: true },
      select: { id: true, title: true },
    });
    if (svc) matchedServiceId = svc.id;
  }

  // Build readable Arabic summary
  const servicesSummary = parsed.data.items
    .map((item) => `${item.serviceName} (${item.quantity})${item.categoryName ? ` [${item.categoryName}]` : ""}`)
    .join("، ");

  const summaryTitle =
    servicesSummary ||
    (parsed.data.customRequest ? `طلب خاص: ${parsed.data.customRequest.slice(0, 40)}` : "طلب خدمات المناسبات");

  // Build comprehensive notes to ensure NO data is ever lost even on legacy views
  const notesSegments: string[] = [];
  if (parsed.data.items.length > 0) {
    notesSegments.push(
      "الخدمات والكميات المطلوبة:\n" +
        parsed.data.items
          .map((item, idx) => `  ${idx + 1}. ${item.serviceName} - الكمية: ${item.quantity}${item.categoryName ? ` (تصنيف: ${item.categoryName})` : ""}`)
          .join("\n")
    );
  }
  if (parsed.data.customRequest) {
    notesSegments.push(`الطلب الخاص أو الإضافي:\n${parsed.data.customRequest}`);
  }
  if (parsed.data.district) {
    notesSegments.push(`الحي: ${parsed.data.district}`);
  }
  if (parsed.data.notes) {
    notesSegments.push(`ملاحظات العميل الإضافية:\n${parsed.data.notes}`);
  }
  const fullNotes = notesSegments.join("\n\n");

  const eventDateObj = new Date(`${parsed.data.eventDate}T00:00:00`);

  try {
    // Attempt complete insert with items relation and extra columns
    const request = await prisma.serviceRequest.create({
      data: {
        serviceId: matchedServiceId,
        customerName: parsed.data.customerName,
        phone: parsed.data.phone,
        city: parsed.data.city,
        district: parsed.data.district || null,
        location: parsed.data.location || null,
        guestCount: parsed.data.guestCount || null,
        customRequest: parsed.data.customRequest || null,
        notes: fullNotes || null,
        eventDate: eventDateObj,
        items: {
          create: parsed.data.items.map((item) => ({
            serviceId: item.serviceId || null,
            serviceName: item.serviceName,
            categoryName: item.categoryName || null,
            quantity: item.quantity,
          })),
        },
      },
    });

    return {
      success: {
        reference: getRequestReference(request.id, request.createdAt),
        serviceTitle: summaryTitle,
      },
    };
  } catch (err) {
    console.warn("Primary request create failed, attempting compatibility fallback:", err);

    // Fallback if migration for items table/extra columns has not run yet in MySQL
    try {
      // Find any active service if serviceId is required in legacy DB
      let fallbackServiceId = matchedServiceId;
      if (!fallbackServiceId) {
        const anyService = await prisma.service.findFirst({
          where: { isActive: true },
          select: { id: true },
        });
        fallbackServiceId = anyService?.id || null;
      }

      if (!fallbackServiceId) {
        return { error: "تعذر تسجيل الطلب، يرجى المحاولة لاحقاً" };
      }

      const fallbackRequest = await prisma.serviceRequest.create({
        data: {
          serviceId: fallbackServiceId,
          customerName: parsed.data.customerName,
          phone: parsed.data.phone,
          city: parsed.data.city,
          location: parsed.data.location || null,
          guestCount: parsed.data.guestCount || null,
          notes: fullNotes || null,
          eventDate: eventDateObj,
        },
      });

      return {
        success: {
          reference: getRequestReference(fallbackRequest.id, fallbackRequest.createdAt),
          serviceTitle: summaryTitle,
        },
      };
    } catch (fallbackErr) {
      console.error("Fallback request create also failed:", fallbackErr);
      return { error: "تعذر إرسال الطلب الآن، يرجى المحاولة لاحقاً" };
    }
  }
}
