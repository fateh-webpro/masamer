import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Edit, ChevronLeft } from "lucide-react";
import { getServiceByIdForAdmin } from "@/lib/services/service-dal";
import { ServiceForm } from "@/components/admin/service-form";
import { updateServiceAction } from "@/app/admin/services/actions";

export const dynamic = "force-dynamic";

interface EditServicePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditServicePage({ params }: EditServicePageProps) {
  const { id } = await params;
  const service = await getServiceByIdForAdmin(id);

  if (!service) {
    notFound();
  }

  const boundUpdateAction = updateServiceAction.bind(null, id);

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
          <span className="text-secondary-600 font-bold truncate max-w-xs">
            تعديل: {service.title}
          </span>
        </nav>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sand-100 border border-sand-200 flex items-center justify-center text-secondary-700 shrink-0">
            <Edit className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              تعديل الخدمة: {service.title}
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              تحديث بيانات الخدمة، الوصف، المميزات، أو ترتيب وحالة العرض.
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <ServiceForm
        initialData={service}
        formAction={boundUpdateAction}
        mode="edit"
      />
    </div>
  );
}
