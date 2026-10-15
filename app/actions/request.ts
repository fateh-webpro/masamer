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
      serviceId: item.serviceId ? String(item.serviceId).trim() : undefined,
      optionId: item.optionId ? String(item.optionId).trim() : undefined,
      serviceName: item.serviceName ? String(item.serviceName).trim() : undefined,
      optionName: item.optionName ? String(item.optionName).trim() : undefined,
      categoryName: item.categoryName ? String(item.categoryName).trim() : undefined,
      quantity: Math.min(1000, Math.max(1, Math.floor(Number(item.quantity) || 1))),
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

  // Authoritative server-side resolution and validation of services and options from DB
  const validatedItems: Array<{
    serviceId: string | null;
    optionId: string | null;
    serviceName: string;
    optionName: string | null;
    categoryName: string | null;
    quantity: number;
  }> = [];

  const seenKeys = new Set<string>();

  for (const rawItem of parsed.data.items) {
    if (rawItem.serviceId) {
      const dbService = await prisma.service.findFirst({
        where: { id: rawItem.serviceId, isActive: true },
        include: {
          category: true,
          options: {
            where: { isActive: true },
            select: { id: true, name: true },
          },
        },
      });

      if (!dbService) {
        return {
          error: "إحدى الخدمات المطلوبة غير متاحة حالياً أو غير نشطة",
        };
      }

      let validOptionName: string | null = null;
      let validOptionId: string | null = null;

      // Check if service has active options: if so, optionId is strictly required
      if (dbService.options.length > 0) {
        if (!rawItem.optionId) {
          return {
            error: `يرجى تحديد خيار فرعي لخدمة (${dbService.title})`,
          };
        }

        const matchedOption = dbService.options.find((o) => o.id === rawItem.optionId);
        if (!matchedOption) {
          return {
            error: `الخيار المحدد للخدمة (${dbService.title}) غير متاح حالياً أو تم تعطيله`,
          };
        }

        validOptionId = matchedOption.id;
        validOptionName = matchedOption.name;
      } else if (rawItem.optionId) {
        return {
          error: `الخيار المحدد للخدمة (${dbService.title}) غير صالح`,
        };
      }

      // Check for duplicate in items
      const itemKey = validOptionId ? `${dbService.id}:${validOptionId}` : `svc:${dbService.id}`;
      if (seenKeys.has(itemKey)) {
        return {
          error: `تم تكرار الخيار (${validOptionName || dbService.title}) في الطلب، يرجى زيادة الكمية بدلاً من التكرار.`,
        };
      }
      seenKeys.add(itemKey);

      validatedItems.push({
        serviceId: dbService.id,
        optionId: validOptionId,
        serviceName: dbService.title,
        optionName: validOptionName,
        categoryName: dbService.category?.name || null,
        quantity: Math.min(1000, Math.max(1, rawItem.quantity || 1)),
      });
    } else if (rawItem.serviceName) {
      const itemKey = `custom:${rawItem.serviceName}`;
      if (seenKeys.has(itemKey)) {
        return {
          error: `تم تكرار العنصر (${rawItem.serviceName}) في الطلب.`,
        };
      }
      seenKeys.add(itemKey);

      validatedItems.push({
        serviceId: null,
        optionId: null,
        serviceName: rawItem.serviceName,
        optionName: rawItem.optionName || null,
        categoryName: rawItem.categoryName || null,
        quantity: Math.min(1000, Math.max(1, rawItem.quantity || 1)),
      });
    }
  }

  // Must have at least one validated item or a custom request
  if (validatedItems.length === 0 && !parsed.data.customRequest?.trim()) {
    return {
      error: "يرجى اختيار خدمة وخيار متاح واحد على الأقل، أو كتابة طلب خاص في المربع المخصص",
    };
  }

  // Find a valid primary service ID if present
  let matchedServiceId: string | null = null;
  const firstItemServiceId = validatedItems.find((i) => i.serviceId)?.serviceId || parsed.data.serviceId;
  if (firstItemServiceId) {
    const svc = await prisma.service.findFirst({
      where: { id: firstItemServiceId, isActive: true },
      select: { id: true, title: true },
    });
    if (svc) matchedServiceId = svc.id;
  }

  // Build readable Arabic summary
  const servicesSummary = validatedItems
    .map((item) => {
      const title = item.optionName ? `${item.serviceName} - ${item.optionName}` : item.serviceName;
      return `${title} (${item.quantity})`;
    })
    .join("، ");

  const summaryTitle =
    servicesSummary ||
    (parsed.data.customRequest ? `طلب خاص: ${parsed.data.customRequest.slice(0, 40)}` : "طلب خدمات المناسبات");

  // Build comprehensive notes to ensure NO data is ever lost even on legacy views
  const notesSegments: string[] = [];
  if (validatedItems.length > 0) {
    notesSegments.push(
      "الخدمات والخيارات المطلوبة:\n" +
        validatedItems
          .map((item, idx) => {
            const opt = item.optionName ? ` (الخيار: ${item.optionName})` : "";
            const cat = item.categoryName ? ` [تصنيف: ${item.categoryName}]` : "";
            return `  ${idx + 1}. ${item.serviceName}${opt} - الكمية: ${item.quantity}${cat}`;
          })
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
    // Atomic transactional insert with items relation and option snapshots
    const request = await prisma.$transaction(async (tx) => {
      const created = await tx.serviceRequest.create({
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
            create: validatedItems.map((item) => ({
              serviceId: item.serviceId || null,
              optionId: item.optionId || null,
              serviceName: item.serviceName,
              optionName: item.optionName || null,
              categoryName: item.categoryName || null,
              quantity: item.quantity,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // Verification check: ensure all validated items were saved inside transaction; throw triggers rollback
      if (validatedItems.length > 0 && (!created.items || created.items.length !== validatedItems.length)) {
        throw new Error(
          `Item count mismatch on request ${created.id}. Expected ${validatedItems.length}, got ${created.items?.length}`
        );
      }

      return created;
    });

    return {
      success: {
        reference: getRequestReference(request.id, request.createdAt),
        serviceTitle: summaryTitle,
      },
    };
  } catch (err) {
    console.error("Critical error creating service request and items:", err);
    const isMismatch = err instanceof Error && err.message.includes("Item count mismatch");
    return {
      error: isMismatch
        ? "حدث خطأ غير متوقع أثناء معالجة عناصر الطلب، يرجى إعادة المحاولة."
        : "تعذر إرسال الطلب في الوقت الحالي بسبب مشكلة في النظام، يرجى المحاولة لاحقاً.",
    };
  }
}
