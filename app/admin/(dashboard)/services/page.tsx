import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Layers,
  PlusCircle,
  ExternalLink,
  Coffee,
  Calendar,
} from "lucide-react";
import { getAllServicesForAdmin, getServiceDisplayImage } from "@/lib/services/service-dal";
import { Button } from "@/components/ui/button";
import { ServiceIcon } from "@/components/shared/service-icon";
import { ServiceTableActions } from "@/components/admin/service-table-actions";
import { isRuntimeUploadPath } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const services = await getAllServicesForAdmin();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sand-100 text-secondary-800 text-xs font-semibold mb-2 border border-sand-200">
            <Layers className="w-3.5 h-3.5 text-secondary-600" />
            <span>إدارة المحتوى والخدمات</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            خدمات الضيافة
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            إضافة وتعديل وحذف خدمات الضيافة المعروضة للعملاء في منصة مسامر.
          </p>
        </div>

        <Button asChild variant="secondary" size="lg" className="gap-2 font-bold shadow-md shadow-secondary-900/10">
          <Link href="/admin/services/new">
            <PlusCircle className="w-4 h-4" />
            <span>إضافة خدمة جديدة</span>
          </Link>
        </Button>
      </div>

      {/* Services Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {services.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-sand-100 text-secondary-600 mx-auto flex items-center justify-center mb-4">
              <Coffee className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">لا توجد خدمات مسجلة</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-6">
              لم تتم إضافة أي خدمة بعد. أضف خدمات الضيافة لتبدأ بالظهور للزوار.
            </p>
            <Button asChild variant="secondary" className="gap-2">
              <Link href="/admin/services/new">
                <PlusCircle className="w-4 h-4" />
                <span>إضافة أول خدمة الآن</span>
              </Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 text-slate-700 text-xs font-bold border-b border-slate-200">
                <tr>
                  <th className="py-4 px-6">الخدمة</th>
                  <th className="py-4 px-6">الاسم اللطيف (Slug)</th>
                  <th className="py-4 px-6">الحالة</th>
                  <th className="py-4 px-6">الترتيب</th>
                  <th className="py-4 px-6">آخر تحديث</th>
                  <th className="py-4 px-6">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {services.map((service) => {
                  const displayImage = getServiceDisplayImage(service);
                  return (
                  <tr key={service.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3.5">
                        <div className="relative w-14 h-12 rounded-xl bg-[#1F294A] border border-[#E8E3DE] flex items-center justify-center text-[#E7C8B7] shrink-0 overflow-hidden">
                          {displayImage ? <Image src={displayImage} alt={service.title} fill sizes="56px" className="object-cover" unoptimized={isRuntimeUploadPath(displayImage)} /> : <ServiceIcon name={service.icon} className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{service.title}</span>
                            <Link
                              href={`/services/${service.slug}`}
                              target="_blank"
                              className="text-slate-400 hover:text-secondary-600 transition-colors"
                              title="معاينة في الموقع"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 max-w-xs">
                            {service.shortDescription}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-slate-600" dir="ltr">
                      {service.slug}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          service.isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}
                      >
                        {service.isActive ? "نشط" : "معطل"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-semibold">
                      {service.sortOrder}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {new Date(service.updatedAt).toLocaleDateString("ar-SA", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <ServiceTableActions
                        serviceId={service.id}
                        serviceTitle={service.title}
                        isActive={service.isActive}
                      />
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
