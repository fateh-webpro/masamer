import React from "react";
import Link from "next/link";
import { PlusCircle, ChevronLeft } from "lucide-react";
import { ServiceForm } from "@/components/admin/service-form";
import { createServiceAction } from "@/app/admin/services/actions";

export const dynamic = "force-dynamic";

export default function NewServicePage() {
  return (
    <div className="space-y-6">
      {/* Breadcrumbs & Header */}
      <div>
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-3">
          <Link href="/admin" className="hover:text-primary-900 transition-colors">
            لوحة التحكم
          </Link>
          <ChevronLeft className="w-3.5 h-3.5" />
          <Link
            href="/admin/services"
            className="hover:text-primary-900 transition-colors"
          >
            الخدمات
          </Link>
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="text-secondary-600 font-bold">إضافة خدمة جديدة</span>
        </nav>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-secondary-50 border border-secondary-200 flex items-center justify-center text-secondary-600 shrink-0">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              إضافة خدمة ضيافة جديدة
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              أدخل تفاصيل الخدمة والمميزات بدقة لتظهر في منصة مسامر بأبهى صورة.
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <ServiceForm formAction={createServiceAction} mode="create" />
    </div>
  );
}
