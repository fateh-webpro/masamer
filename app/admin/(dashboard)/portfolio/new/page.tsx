import React from "react";
import type { Metadata } from "next";
import { getAllCategoriesForAdmin } from "@/lib/services/portfolio-dal";
import { PortfolioForm } from "@/components/admin/portfolio-form";

export const metadata: Metadata = {
  title: "إضافة عمل جديد | لوحة التحكم - مسامر",
};

export const dynamic = "force-dynamic";

export default async function NewPortfolioItemPage() {
  const categories = await getAllCategoriesForAdmin();

  return (
    <div className="py-2">
      <PortfolioForm categories={categories} mode="create" />
    </div>
  );
}
