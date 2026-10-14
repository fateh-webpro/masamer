import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServiceCategoryByIdForAdmin } from "@/lib/services/service-dal";
import { ServiceCategoryForm } from "@/components/admin/service-category-form";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const category = await getServiceCategoryByIdForAdmin(id);

  if (!category) {
    return { title: "التصنيف غير موجود | مسامر" };
  }

  return {
    title: `تعديل تصنيف: ${category.name} | مسامر`,
  };
}

export default async function EditServiceCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await getServiceCategoryByIdForAdmin(id);

  if (!category) {
    notFound();
  }

  return (
    <div className="py-2">
      <ServiceCategoryForm initialData={category} mode="edit" />
    </div>
  );
}
