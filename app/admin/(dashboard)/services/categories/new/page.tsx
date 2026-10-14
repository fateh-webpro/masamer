import React from "react";
import type { Metadata } from "next";
import { ServiceCategoryForm } from "@/components/admin/service-category-form";

export const metadata: Metadata = {
  title: "إضافة تصنيف خدمات جديد | لوحة التحكم - مسامر",
};

export default function NewServiceCategoryPage() {
  return (
    <div className="py-2">
      <ServiceCategoryForm mode="create" />
    </div>
  );
}
