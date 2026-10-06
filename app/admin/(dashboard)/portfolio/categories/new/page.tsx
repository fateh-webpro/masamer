import React from "react";
import type { Metadata } from "next";
import { CategoryForm } from "@/components/admin/category-form";

export const metadata: Metadata = {
  title: "إضافة تصنيف أعمال جديد | لوحة التحكم - مسامر",
};

export default function NewCategoryPage() {
  return (
    <div className="py-2">
      <CategoryForm mode="create" />
    </div>
  );
}
