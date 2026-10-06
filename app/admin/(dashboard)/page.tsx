import React from "react";
import Link from "next/link";
import {
  Coffee,
  Sparkles,
  PlusCircle,
  ExternalLink,
  Layers,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { getAllServicesForAdmin } from "@/lib/services/service-dal";
import { Button } from "@/components/ui/button";
import { ServiceIcon } from "@/components/shared/service-icon";
import { ServiceTableActions } from "@/components/admin/service-table-actions";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const services = await getAllServicesForAdmin();
  const totalCount = services.length;
  const activeCount = services.filter((s) => s.isActive).length;
  const inactiveCount = totalCount - activeCount;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sand-100 text-secondary-800 text-xs font-semibold mb-3 border border-sand-200">
            <Sparkles className="w-3.5 h-3.5 text-secondary-600" />
            <span>لوحة التحكم الرئيسية لمنصة مسامر</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            مرحباً بك في إدارة مسـامر
          </h1>
          <p className="text-slate-500 text-sm mt-1.5 leading-relaxed max-w-xl">
            إدارة خدمات الضيافة الفاخرة، ومتابعة حالات التفعيل وترتيب العرض للعملاء بكفاءة وسلاسة.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="secondary" className="gap-2 font-semibold shadow-sm">
            <Link href="/admin/services/new">
              <PlusCircle className="w-4 h-4" />
              <span>إضافة خدمة جديدة</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/services" target="_blank">
              <ExternalLink className="w-4 h-4" />
              <span>الموقع العام</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              إجمالي خدمات الضيافة
            </p>
            <h3 className="text-3xl font-extrabold text-slate-900">{totalCount}</h3>
            <p className="text-xs text-slate-400 mt-1">الخدمات المسجلة بالنظام</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
              الخدمات النشطة
            </p>
            <h3 className="text-3xl font-extrabold text-emerald-600">{activeCount}</h3>
            <p className="text-xs text-slate-400 mt-1">تظهر للزوار في الموقع</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
              الخدمات غير المفعلة
            </p>
            <h3 className="text-3xl font-extrabold text-amber-600">{inactiveCount}</h3>
            <p className="text-xs text-slate-400 mt-1">مسودة غير معروضة</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <XCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Services Table Summary */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">نظرة عامة على الخدمات</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              قائمة بأحدث الخدمات المسجلة وإمكانية التعديل السريع
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
            <Link href="/admin/services">
              <span>عرض كل الخدمات ({totalCount})</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>

        {services.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-sand-100 text-secondary-600 mx-auto flex items-center justify-center mb-4">
              <Coffee className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">لا توجد خدمات مسجلة بعد</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
              ابدأ بإضافة أول خدمة ضيافة فاخرة لعرضها لعملاء مسامر.
            </p>
            <Button asChild variant="secondary" size="sm" className="gap-2">
              <Link href="/admin/services/new">
                <PlusCircle className="w-4 h-4" />
                <span>إضافة خدمة جديدة</span>
              </Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">الخدمة</th>
                  <th className="py-3.5 px-6">الاسم اللطيف (Slug)</th>
                  <th className="py-3.5 px-6">الحالة</th>
                  <th className="py-3.5 px-6">الترتيب</th>
                  <th className="py-3.5 px-6">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {services.slice(0, 5).map((service) => (
                  <tr key={service.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sand-100 border border-sand-200 flex items-center justify-center text-secondary-700 shrink-0">
                          <ServiceIcon name={service.icon} className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{service.title}</p>
                          <p className="text-xs text-slate-400 line-clamp-1">
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
                    <td className="py-4 px-6 text-slate-600 font-medium">
                      {service.sortOrder}
                    </td>
                    <td className="py-4 px-6">
                      <ServiceTableActions
                        serviceId={service.id}
                        serviceTitle={service.title}
                        isActive={service.isActive}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
