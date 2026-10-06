import { z } from "zod";
import { REQUEST_STATUSES } from "@/lib/constants/request";

export const serviceRequestSchema = z.object({
  serviceId: z.string().trim().min(1, "يرجى اختيار الخدمة"),
  customerName: z.string().trim().min(2, "الاسم مطلوب").max(120),
  phone: z.string().trim().min(8, "رقم الجوال غير مكتمل").max(50).regex(/^[+\d\s()-]+$/, "رقم الجوال غير صالح"),
  eventDate: z.string().trim().optional().refine((value) => !value || !Number.isNaN(Date.parse(`${value}T00:00:00`)), "تاريخ المناسبة غير صالح"),
  city: z.string().trim().min(2, "المدينة مطلوبة").max(100),
  location: z.string().trim().max(255).optional(),
  guestCount: z.string().trim().max(50).optional(),
  notes: z.string().trim().max(3000).optional(),
});

export const requestAdminUpdateSchema = z.object({
  status: z.enum(REQUEST_STATUSES),
  adminNotes: z.string().trim().max(5000).optional(),
});
