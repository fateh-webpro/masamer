import { z } from "zod";
import { REQUEST_STATUSES } from "@/lib/constants/request";

export const requestItemSchema = z.object({
  serviceId: z.string().trim().optional().nullable(),
  serviceName: z.string().trim().min(1, "اسم الخدمة مطلوب").max(180),
  categoryName: z.string().trim().max(120).optional().nullable(),
  quantity: z.coerce
    .number()
    .int("الكمية يجب أن تكون رقماً صحيحاً")
    .min(1, "الكمية يجب أن تكون 1 على الأقل"),
});

export type RequestItemInput = z.infer<typeof requestItemSchema>;

export const serviceRequestSchema = z
  .object({
    customerName: z
      .string({ required_error: "الاسم الكريم مطلوب" })
      .trim()
      .min(2, "الاسم الكريم يجب أن يكون حرفين على الأقل")
      .max(120, "الاسم طويل جداً"),
    phone: z
      .string({ required_error: "رقم الجوال مطلوب" })
      .trim()
      .min(8, "رقم الجوال غير مكتمل")
      .max(50)
      .regex(/^[+\d\s()-]+$/, "رقم الجوال غير صالح"),
    eventDate: z
      .string({ required_error: "تاريخ المناسبة مطلوب" })
      .trim()
      .min(1, "تاريخ المناسبة مطلوب")
      .refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00`)), "تاريخ المناسبة غير صالح")
      .refine((value) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const parsed = new Date(`${value}T00:00:00`);
        return parsed >= today;
      }, "لا يمكن اختيار تاريخ مناسبة في الماضي"),
    city: z
      .string({ required_error: "المدينة مطلوبة" })
      .trim()
      .min(2, "يرجى تحديد المدينة")
      .max(100, "اسم المدينة طويل جداً"),
    district: z.string().trim().max(100, "اسم الحي طويل جداً").optional().nullable(),
    location: z.string().trim().max(255).optional().nullable(),
    guestCount: z.string().trim().max(50).optional().nullable(),
    notes: z.string().trim().max(3000).optional().nullable(),
    customRequest: z.string().trim().max(3000).optional().nullable(),
    items: z.array(requestItemSchema).default([]),
    serviceId: z.string().trim().optional().nullable(),
  })
  .refine(
    (data) =>
      (Array.isArray(data.items) && data.items.length > 0) ||
      Boolean(data.customRequest && data.customRequest.trim().length > 0) ||
      Boolean(data.serviceId && data.serviceId.trim().length > 0),
    {
      message: "يرجى اختيار خدمة واحدة على الأقل أو كتابة طلب خاص",
      path: ["items"],
    }
  );

export type ServiceRequestInput = z.infer<typeof serviceRequestSchema>;

export const requestAdminUpdateSchema = z.object({
  status: z.enum(REQUEST_STATUSES),
  adminNotes: z.string().trim().max(5000).optional().nullable(),
});
