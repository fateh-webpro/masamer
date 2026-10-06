"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { Edit, Trash2, Power, Loader2, AlertTriangle, X, Check } from "lucide-react";
import { toggleServiceStatusAction, deleteServiceAction } from "@/app/admin/services/actions";

interface ServiceTableActionsProps {
  serviceId: string;
  serviceTitle: string;
  isActive: boolean;
}

export function ServiceTableActions({
  serviceId,
  serviceTitle,
  isActive,
}: ServiceTableActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleToggleStatus = () => {
    setActionError(null);
    startTransition(async () => {
      const res = await toggleServiceStatusAction(serviceId, isActive);
      if (!res.success) {
        setActionError(res.error || "حدث خطأ أثناء تغيير الحالة");
      }
    });
  };

  const handleDelete = () => {
    setActionError(null);
    startTransition(async () => {
      const res = await deleteServiceAction(serviceId);
      if (!res.success) {
        setActionError(res.error || "حدث خطأ أثناء حذف الخدمة");
        setShowDeleteModal(false);
      } else {
        setShowDeleteModal(false);
      }
    });
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Toggle Active Button */}
        <button
          type="button"
          onClick={handleToggleStatus}
          disabled={isPending}
          className={`p-1.5 rounded-lg border transition-colors ${
            isActive
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
              : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
          }`}
          title={isActive ? "تعطيل الخدمة" : "تفعيل الخدمة"}
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
          ) : (
            <Power className="w-4 h-4" />
          )}
        </button>

        {/* Edit Button */}
        <Link
          href={`/admin/services/${serviceId}/edit`}
          className="p-1.5 rounded-lg bg-sand-100 text-slate-700 border border-sand-200 hover:bg-secondary-50 hover:text-secondary-700 hover:border-secondary-200 transition-colors"
          title="تعديل الخدمة"
        >
          <Edit className="w-4 h-4" />
        </Link>

        {/* Delete Button */}
        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          disabled={isPending}
          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 hover:text-rose-700 transition-colors"
          title="حذف الخدمة"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {actionError && (
        <div className="text-xs text-rose-600 mt-1 font-medium">{actionError}</div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => !isPending && setShowDeleteModal(false)}
          />
          <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 z-10">
            <div className="flex items-center gap-3 text-rose-600 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">تأكيد حذف الخدمة</h3>
                <p className="text-xs text-slate-500">إجراء غير قابل للتراجع</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              هل أنت متأكد من رغبتك في حذف خدمة{" "}
              <strong className="text-slate-900 font-semibold">"{serviceTitle}"</strong>؟ سيتم
              حذفها نهائياً من قاعدة البيانات ولن تظهر في الموقع العام.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isPending}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري الحذف...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>نعم، احذف الخدمة</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
