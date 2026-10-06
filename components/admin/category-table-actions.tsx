"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { Edit, Trash2, Power, Loader2, AlertTriangle } from "lucide-react";
import { toggleCategoryStatusAction, deleteCategoryAction } from "@/app/admin/portfolio/categories/actions";

interface CategoryTableActionsProps {
  categoryId: string;
  categoryName: string;
  isActive: boolean;
  itemsCount: number;
}

export function CategoryTableActions({
  categoryId,
  categoryName,
  isActive,
  itemsCount,
}: CategoryTableActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleToggleStatus = () => {
    setActionError(null);
    startTransition(async () => {
      const res = await toggleCategoryStatusAction(categoryId, isActive);
      if (!res.success) {
        setActionError(res.error || "حدث خطأ أثناء تغيير حالة التصنيف");
      }
    });
  };

  const handleDelete = () => {
    setActionError(null);
    startTransition(async () => {
      const res = await deleteCategoryAction(categoryId);
      if (!res.success) {
        setActionError(res.error || "حدث خطأ أثناء حذف التصنيف");
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
          title={isActive ? "تعطيل التصنيف" : "تفعيل التصنيف"}
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
          ) : (
            <Power className="w-4 h-4" />
          )}
        </button>

        {/* Edit Button */}
        <Link
          href={`/admin/portfolio/categories/${categoryId}/edit`}
          className="p-1.5 rounded-lg bg-sand-100 text-slate-700 border border-sand-200 hover:bg-secondary-50 hover:text-secondary-700 hover:border-secondary-200 transition-colors"
          title="تعديل التصنيف"
        >
          <Edit className="w-4 h-4" />
        </Link>

        {/* Delete Button */}
        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          disabled={isPending}
          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 hover:text-rose-700 transition-colors"
          title="حذف التصنيف"
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
                <h3 className="text-lg font-bold text-slate-900">تأكيد حذف التصنيف</h3>
                <p className="text-xs text-slate-500">إجراء أمان لقاعدة البيانات</p>
              </div>
            </div>

            {itemsCount > 0 ? (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm mb-6 leading-relaxed">
                تحذير: هذا التصنيف مرتبط بـ <strong>({itemsCount}) من الأعمال</strong> في المعرض.
                لا يمكن حذفه مباشرة لحماية البيانات من التلف أو اليتم. يرجى نقل أو حذف الأعمال أولاً.
              </div>
            ) : (
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                هل أنت متأكد من رغبتك في حذف تصنيف{" "}
                <strong className="text-slate-900 font-semibold">"{categoryName}"</strong>؟ سيتم
                حذفه نهائياً من قاعدة البيانات.
              </p>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isPending}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors"
              >
                إلغاء
              </button>
              {itemsCount === 0 && (
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
                      <span>نعم، احذف التصنيف</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
