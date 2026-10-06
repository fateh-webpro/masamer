import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPortfolioItemById, getAllCategoriesForAdmin } from "@/lib/services/portfolio-dal";
import { PortfolioForm } from "@/components/admin/portfolio-form";

interface EditPortfolioItemPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "تعديل بيانات العمل | لوحة التحكم - مسامر",
};

export const dynamic = "force-dynamic";

export default async function EditPortfolioItemPage({ params }: EditPortfolioItemPageProps) {
  const { id } = await params;
  const [item, categories] = await Promise.all([
    getPortfolioItemById(id),
    getAllCategoriesForAdmin(),
  ]);

  if (!item) {
    notFound();
  }

  return (
    <div className="py-2">
      <PortfolioForm initialData={item} categories={categories} mode="edit" />
    </div>
  );
}
