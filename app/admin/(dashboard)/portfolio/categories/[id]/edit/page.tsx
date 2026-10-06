import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPortfolioCategoryById } from "@/lib/services/portfolio-dal";
import { CategoryForm } from "@/components/admin/category-form";

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "تعديل تصنيف الأعمال | لوحة التحكم - مسامر",
};

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params;
  const category = await getPortfolioCategoryById(id);

  if (!category) {
    notFound();
  }

  return (
    <div className="py-2">
      <CategoryForm initialData={category} mode="edit" />
    </div>
  );
}
