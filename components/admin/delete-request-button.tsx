"use client";

import React, { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle, Loader2, CheckCircle2, X } from "lucide-react";
import { deleteRequestAction } from "@/app/admin/requests/actions";

interface DeleteRequestButtonProps {
  requestId: string;
  customerName: string;
  reference?: string;
  variant?: "table" | "detail";
  className?: string;
}

export function DeleteRequestButton({
  requestId,
  customerName,
  reference,
  variant = "table",
  className = "",
}: DeleteRequestButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const handleDelete = () => {
    setActionError(null);
    startTransition(async () => {
      const res = await deleteRequestAction(requestId);
      if (!res.success) {
        setActionError(res.error || "تعذر حذف الطلب، يرجى المحاولة لاحقاً");
      } else {
        setShowDeleteModal(false);
        if (variant === "detail") {
          router.push("/admin/requests?deleted=true");
        } else {
          setToastMessage("تم حذف الطلب بنجاح");
        }
      }
    });
  };

  const isTable = variant === "table";

  return (
    <>
      {isTable ? (
        <button
          type="button"
          onClick={() => {
            setActionError(null);
            setShowDeleteModal(true);
          }}
          disabled={isPending}
          className={`p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 hover:text-rose-700 transition-colors disabled:opacity-50 ${className}`}
          title="حذف الطلب"
          aria-label={`حذف طلب العميل ${customerName}`}
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            setActionError(null);
            setShowDeleteModal(true);
          }}
          disabled={isPending}
          className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 font-bold text-xs transition-colors disabled:opacity-50 ${className}`}
          title="حذف الطلب"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
          <span>حذف الطلب</span>
        </button>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => !isPending && setShowDeleteModal(false)}
          />

          {/* Modal Container */}
          <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 z-10 text-right">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3 text-rose-600">
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0 border border-rose-100">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 id="delete-dialog-title" className="text-lg font-bold text-slate-900">
                    تأكيد حذف الطلب
                  </h3>
                  <p className="text-xs text-slate-500">إجراء نهائي غير قابل للتراجع</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !isPending && setShowDeleteModal(false)}
                disabled={isPending}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
                aria-label="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Request Summary */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 mb-4 text-xs space-y-1.5">
              {reference && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">الرقم المرجعي:</span>
                  <span className="font-mono font-bold text-slate-900" dir="ltr">
                    {reference}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-slate-500">اسم العميل:</span>
                <span className="font-bold text-slate-900">{customerName}</span>
              </div>
            </div>

            {/* Confirmation Message */}
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              هل أنت متأكد من حذف هذا الطلب؟ سيتم حذف الطلب وجميع عناصره المرتبطة نهائيًا، ولا يمكن التراجع عن العملية.
            </p>

            {/* Error Message inside modal if failed */}
            {actionError && (
              <div
                role="alert"
                className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium"
              >
                {actionError}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isPending}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري الحذف...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>حذف الطلب</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Success Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900/95 text-white rounded-2xl shadow-xl border border-slate-800 text-xs font-semibold backdrop-blur-sm animate-in fade-in duration-200"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors mr-1"
            aria-label="إغلاق التنبيه"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </>
  );
}
