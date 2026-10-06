import { z } from "zod";

export const portfolioCategorySchema = z.object({
  name: z
    .string()
    .min(2, "اسم التصنيف يجب أن يكون حرفين على الأقل")
    .max(120, "اسم التصنيف طويل جداً"),
  slug: z
    .string()
    .min(2, "الاسم اللطيف (Slug) مطلوب")
    .max(120, "الاسم اللطيف طويل جداً")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "الاسم اللطيف يجب أن يحتوي فقط على أحرف إنجليزية صغيرة وأرقام وشرطات (-)"
    ),
  description: z
    .string()
    .max(300, "الوصف يجب ألا يتجاوز 300 حرف")
    .optional()
    .nullable(),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

export type PortfolioCategoryInput = z.infer<typeof portfolioCategorySchema>;

export const portfolioItemSchema = z.object({
  categoryId: z.string().min(1, "يرجى اختيار تصنيف العمل"),
  title: z
    .string()
    .min(3, "عنوان العمل يجب أن يكون 3 أحرف على الأقل")
    .max(180, "عنوان العمل طويل جداً"),
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
    .min(5, "الوصف المختصر يجب أن يكون 5 أحرف على الأقل")
    .max(300, "الوصف المختصر يجب ألا يتجاوز 300 حرف"),
  description: z.string().optional().nullable(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

export type PortfolioItemInput = z.infer<typeof portfolioItemSchema>;
