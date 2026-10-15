import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRequestByIdForAdmin } from "@/lib/services/request-dal";
import {
  getRequestReference,
  REQUEST_STATUS_PRESENTATION,
  type RequestStatus,
} from "@/lib/constants/request";
import { formatWhatsAppUrl } from "@/lib/utils";
import { RequestUpdateForm } from "@/components/admin/request-update-form";
import { DeleteRequestButton } from "@/components/admin/delete-request-button";

export const dynamic = "force-dynamic";

export default async function AdminRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const request = await getRequestByIdForAdmin(id);

  if (!request) {
    notFound();
  }

  const presentation =
    REQUEST_STATUS_PRESENTATION[request.status as RequestStatus] ||
    REQUEST_STATUS_PRESENTATION.new;

  const reqAny = request as unknown as {
    items?: Array<{
      id: string;
      serviceName: string;
      optionName?: string | null;
      categoryName: string | null;
      quantity: number;
      notes: string | null;
      option?: { name: string } | null;
    }>;
    district?: string | null;
    customRequest?: string | null;
  };

  const hasItems = reqAny.items && reqAny.items.length > 0;
  const totalQuantity = hasItems
    ? reqAny.items!.reduce((acc, item) => acc + item.quantity, 0)
    : 0;

  const eventDetails = [
    { label: "اسم العميل", value: request.customerName },
    { label: "رقم الجوال", value: request.phone, dir: "ltr" },
    { label: "المدينة", value: request.city },
    { label: "الحي", value: reqAny.district || "—" },
    { label: "الموقع / القاعة", value: request.location || "—" },
    {
      label: "عدد الضيوف التقديري",
      value: request.guestCount ? `${request.guestCount} ضيف` : "—",
    },
    {
      label: "تاريخ المناسبة",
      value: request.eventDate
        ? new Date(request.eventDate).toLocaleDateString("ar-SA", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "—",
    },
    {
      label: "تاريخ تقديم الطلب",
      value: new Date(request.createdAt).toLocaleString("ar-SA"),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl bg-white border border-slate-200 p-6">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/requests"
              className="text-xs text-secondary-700 hover:text-secondary-900 font-bold hover:underline"
            >
              ← العودة لكل الطلبات
            </Link>
            <span className="text-slate-300">|</span>
            <span className="font-mono text-xs font-bold text-slate-500" dir="ltr">
              {getRequestReference(request.id, request.createdAt)}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">
            طلب العميل: {request.customerName}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center px-3.5 py-1.5 rounded-full border text-xs font-bold ${presentation.className}`}
          >
            {presentation.label}
          </span>
          <a
            href={`tel:${request.phone.replace(/\s/g, "")}`}
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-slate-200 text-slate-800 hover:bg-slate-50 font-bold text-xs transition-colors"
          >
            اتصال
          </a>
          <a
            href={formatWhatsAppUrl(
              request.phone,
              `مرحبًا ${request.customerName}، معك فريق مسامر بخصوص طلبك رقم ${getRequestReference(
                request.id,
                request.createdAt
              )}.`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
          >
            مراسلة واتساب
          </a>
          <DeleteRequestButton
            requestId={request.id}
            customerName={request.customerName}
            reference={getRequestReference(request.id, request.createdAt)}
            variant="detail"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
        <div className="space-y-6">
          {/* Services Breakdown */}
          <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">الخدمات والخيارات المطلوبة</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  قائمة الخدمات والخيارات الفرعية والكميات المحددة من العميل
                </p>
              </div>
              {hasItems && (
                <span className="text-xs font-bold bg-sand-100 text-secondary-800 px-3 py-1 rounded-full border border-sand-200">
                  {reqAny.items!.length} عناصر • إجمالي الكمية: {totalQuantity}
                </span>
              )}
            </div>

            {hasItems ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                  <thead className="bg-slate-50 text-slate-700 text-xs font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">الخدمة الرئيسية</th>
                      <th className="p-3">الخيار الفرعي</th>
                      <th className="p-3">التصنيف</th>
                      <th className="p-3 text-center">الكمية</th>
                      <th className="p-3">ملاحظات خاصة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reqAny.items!.map((item, idx) => {
                      const subOption = item.optionName || item.option?.name;
                      return (
                        <tr key={item.id || idx} className="hover:bg-slate-50/60">
                          <td className="p-3 text-xs text-slate-400 font-mono">{idx + 1}</td>
                          <td className="p-3 font-bold text-slate-900">{item.serviceName}</td>
                          <td className="p-3">
                            {subOption ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-sand-100 text-secondary-900 font-bold text-xs border border-sand-200">
                                {subOption}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">خدمة رئيسية عامة</span>
                            )}
                          </td>
                          <td className="p-3 text-xs text-slate-600">
                            {item.categoryName ? (
                              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                                {item.categoryName}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <span className="inline-block bg-secondary-50 text-secondary-800 font-bold px-2.5 py-0.5 rounded-lg border border-secondary-200 text-xs">
                              {item.quantity}
                            </span>
                          </td>
                          <td className="p-3 text-xs text-slate-600">{item.notes || "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">الخدمة المطلوبة:</p>
                <p className="font-bold text-slate-800">
                  {request.service?.title || "طلب مخصص / غير محدد"}
                </p>
              </div>
            )}
          </div>

          {/* Custom Request Section */}
          {reqAny.customRequest && (
            <div className="rounded-3xl bg-amber-50/60 border border-amber-200 p-6 shadow-sm">
              <h2 className="text-base font-bold text-amber-950 mb-2">
                طلب خاص إضافي من العميل
              </h2>
              <p className="text-sm text-amber-900 whitespace-pre-wrap leading-relaxed">
                {reqAny.customRequest}
              </p>
            </div>
          )}

          {/* Event & Customer Details */}
          <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">
              تفاصيل المناسبة والعميل
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {eventDetails.map((f) => (
                <div
                  key={f.label}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <p className="text-xs text-slate-500 font-medium">{f.label}</p>
                  <p className="font-bold text-slate-900 mt-1 text-sm" dir={f.dir}>
                    {f.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Customer General Notes */}
          {request.notes && (
            <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-2">
                ملاحظات وتفاصيل إضافية من العميل
              </h2>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {request.notes}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Admin Status & Notes Sidebar */}
        <div className="sticky top-6">
          <RequestUpdateForm
            id={request.id}
            status={request.status}
            adminNotes={request.adminNotes}
          />
        </div>
      </div>
    </div>
  );
}
