import { z } from "zod";

export const serviceSchema = z.object({
  title: z
    .string()
    .min(3, "عنوان الخدمة يجب أن يكون 3 أحرف على الأقل")
    .max(180, "عنوان الخدمة طويل جداً"),
  slug: z
    .string()
    .min(2, "الاسم اللطيف (Slug) مطلوب")
    .max(120, "الاسم اللطيف طويل جداً")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "الاسم اللطيف يجب أن يحتوي فقط على أحرف إنجليزية صغيرة وأرقام وشرطات (-)"
    ),
  shortDescription: z
    .string()
    .min(10, "الوصف المختصر يجب أن يكون 10 أحرف على الأقل")
    .max(300, "الوصف المختصر يجب ألا يتجاوز 300 حرف"),
  fullDescription: z
    .string()
    .min(20, "الوصف التفصيلي يجب أن يكون 20 حرفاً على الأقل"),
  icon: z
    .string()
    .min(2, "رمز الأيقونة مطلوب")
    .default("Coffee"),
  features: z
    .array(z.string().min(1))
    .min(1, "يجب إضافة ميزة واحدة على الأقل"),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
