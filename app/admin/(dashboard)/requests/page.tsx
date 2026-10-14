import React from "react";
import Link from "next/link";
import { getAllRequestsForAdmin } from "@/lib/services/request-dal";
import {
  getRequestReference,
  REQUEST_STATUS_PRESENTATION,
  type RequestStatus,
} from "@/lib/constants/request";

export const dynamic = "force-dynamic";

export default async function AdminRequestsPage() {
  const requests = await getAllRequestsForAdmin();

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white border border-slate-200 p-6">
        <h1 className="text-2xl font-bold text-slate-900">طلبات الخدمة</h1>
        <p className="text-slate-500 text-sm mt-1">
          متابعة طلبات العملاء وتفاصيل الخدمات والكميات وتحديث حالتها.
        </p>
      </div>

      <div className="rounded-3xl bg-white border border-slate-200 overflow-x-auto shadow-sm">
        <table className="w-full text-sm text-right min-w-[950px]">
          <thead className="bg-slate-50 text-slate-700 text-xs font-bold border-b border-slate-200">
            <tr>
              <th className="p-4">الرقم المرجعي</th>
              <th className="p-4">العميل</th>
              <th className="p-4">الجوال</th>
              <th className="p-4">الخدمات المطلوبة</th>
              <th className="p-4">المدينة / الحي</th>
              <th className="p-4">تاريخ المناسبة</th>
              <th className="p-4">الحالة</th>
              <th className="p-4">تاريخ الطلب</th>
              <th className="p-4 text-center">الإجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {requests.map((request) => {
              const presentation =
                REQUEST_STATUS_PRESENTATION[request.status as RequestStatus] ||
                REQUEST_STATUS_PRESENTATION.new;

              const reqAny = request as unknown as {
                items?: Array<{ serviceName: string; quantity: number }>;
                district?: string | null;
                customRequest?: string | null;
              };

              const itemsDisplay =
                reqAny.items && reqAny.items.length > 0
                  ? reqAny.items.map((i) => `${i.serviceName} (${i.quantity})`).join("، ")
                  : request.service?.title || reqAny.customRequest || "طلب خدمة";

              return (
                <tr key={request.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4 font-mono text-xs font-bold" dir="ltr">
                    {getRequestReference(request.id, request.createdAt)}
                  </td>
                  <td className="p-4 font-bold text-slate-900">{request.customerName}</td>
                  <td className="p-4 font-mono text-xs" dir="ltr">
                    {request.phone}
                  </td>
                  <td className="p-4 max-w-xs">
                    <p className="text-xs font-semibold text-slate-800 line-clamp-2" title={itemsDisplay}>
                      {itemsDisplay}
                    </p>
                  </td>
                  <td className="p-4 text-xs">
                    <span className="font-semibold text-slate-800">{request.city}</span>
                    {reqAny.district && (
                      <span className="text-slate-500 block text-[11px]">{reqAny.district}</span>
                    )}
                  </td>
                  <td className="p-4 text-xs text-slate-600">
                    {request.eventDate
                      ? new Date(request.eventDate).toLocaleDateString("ar-SA", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "—"}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold ${presentation.className}`}
                    >
                      {presentation.label}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-slate-500">
                    {new Date(request.createdAt).toLocaleDateString("ar-SA")}
                  </td>
                  <td className="p-4 text-center">
                    <Link
                      href={`/admin/requests/${request.id}`}
                      className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-sand-100 hover:bg-secondary-50 text-secondary-800 hover:text-secondary-900 font-bold text-xs border border-sand-200 transition-colors"
                    >
                      عرض التفاصيل
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {requests.length === 0 && (
          <p className="p-10 text-center text-slate-500">لا توجد طلبات مسجلة بعد.</p>
        )}
      </div>
    </div>
  );
}
