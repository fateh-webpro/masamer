"use client";

import React, { useActionState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, Tag, Hash, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { createCategoryAction, updateCategoryAction, type CategoryFormState } from "@/app/admin/portfolio/categories/actions";
import type { PortfolioCategoryData } from "@/lib/services/portfolio-dal";
import { Button } from "@/components/ui/button";

interface CategoryFormProps {
  initialData?: PortfolioCategoryData | null;
  mode: "create" | "edit";
}

export function CategoryForm({ initialData, mode }: CategoryFormProps) {
  const isEdit = mode === "edit" && !!initialData;

  const actionWithId = isEdit
    ? updateCategoryAction.bind(null, initialData.id)
    : createCategoryAction;

  const [state, formAction, isPending] = useActionState<CategoryFormState | null, FormData>(
    actionWithId,
    null
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden max-w-2xl mx-auto">
      {/* Form Header */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {isEdit ? `تعديل تصنيف: ${initialData.name}` : "إضافة تصنيف أعمال جديد"}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isEdit
              ? "قم بتحديث بيانات التصنيف وترتيبه وحالة ظهوره"
              : "أدخل بيانات التصنيف لتنظيم أعمال ومشاريع المعرض"}
          </p>
        </div>
        <Link
          href="/admin/portfolio/categories"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl transition-colors shadow-2xs"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>العودة للتصنيفات</span>
        </Link>
      </div>

      {/* Global Error Banner */}
      {state?.error && (
        <div className="m-6 mb-0 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
          <div>
            <p className="font-semibold">{state.error}</p>
          </div>
        </div>
      )}

      {/* Form Body */}
      <form action={formAction} className="p-6 sm:p-8 space-y-6">
        <div className="space-y-4">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-slate-800 mb-1.5">
              اسم التصنيف <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="name"
                name="name"
                type="text"
                required
                defaultValue={initialData?.name || ""}
                placeholder="مثال: الجلسات الشعبية"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                  state?.fieldErrors?.name
                    ? "border-rose-300 focus:ring-rose-200 bg-rose-50/30"
                    : "border-slate-200 focus:border-secondary-500 focus:ring-secondary-100 bg-white"
                }`}
              />
              <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </div>
            {state?.fieldErrors?.name && (
              <p className="text-xs text-rose-600 mt-1">{state.fieldErrors.name[0]}</p>
            )}
          </div>

          {/* Slug Field */}
          <div>
            <label htmlFor="slug" className="block text-sm font-semibold text-slate-800 mb-1.5">
              الاسم اللطيف (Slug) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="slug"
                name="slug"
                type="text"
                required
                dir="ltr"
                defaultValue={initialData?.slug || ""}
                placeholder="traditional-seating"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all text-left ${
                  state?.fieldErrors?.slug
                    ? "border-rose-300 focus:ring-rose-200 bg-rose-50/30"
                    : "border-slate-200 focus:border-secondary-500 focus:ring-secondary-100 bg-white"
                }`}
              />
              <Hash className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              يستخدم في روابط الفلاتر والتصنيفات (أحرف إنجليزية صغيرة وشرطات فقط).
            </p>
            {state?.fieldErrors?.slug && (
              <p className="text-xs text-rose-600 mt-1">{state.fieldErrors.slug[0]}</p>
            )}
          </div>

          {/* Description Field */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-slate-800 mb-1.5">
              وصف التصنيف <span className="text-xs font-normal text-slate-400">(اختياري)</span>
            </label>
            <div className="relative">
              <textarea
                id="description"
                name="description"
                rows={3}
                defaultValue={initialData?.description || ""}
                placeholder="نبذة موجزة عن هذا النوع من الأعمال والتجهيزات..."
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                  state?.fieldErrors?.description
                    ? "border-rose-300 focus:ring-rose-200 bg-rose-50/30"
                    : "border-slate-200 focus:border-secondary-500 focus:ring-secondary-100 bg-white"
                }`}
              />
            </div>
            {state?.fieldErrors?.description && (
              <p className="text-xs text-rose-600 mt-1">{state.fieldErrors.description[0]}</p>
            )}
          </div>

          {/* Sort Order & Active Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label htmlFor="sortOrder" className="block text-sm font-semibold text-slate-800 mb-1.5">
                ترتيب العرض
              </label>
              <input
                id="sortOrder"
                name="sortOrder"
                type="number"
                min="0"
                defaultValue={initialData?.sortOrder ?? 0}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-secondary-500 focus:ring-2 focus:ring-secondary-100 bg-white"
              />
              <p className="text-[11px] text-slate-400 mt-1">الأرقام الأصغر تظهر أولاً.</p>
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  name="isActive"
                  value="true"
                  defaultChecked={initialData ? initialData.isActive : true}
                  className="w-4 h-4 rounded text-secondary-600 focus:ring-secondary-500 border-slate-300"
                />
                <div>
                  <span className="text-sm font-semibold text-slate-800 block">تفعيل التصنيف</span>
                  <span className="text-[11px] text-slate-500 block">
                    يظهر في فلاتر المعرض بالموقع العام
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link
            href="/admin/portfolio/categories"
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors"
          >
            إلغاء
          </Link>
          <Button
            type="submit"
            disabled={isPending}
            variant="secondary"
            className="px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-sm"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري الحفظ...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{isEdit ? "حفظ التعديلات" : "إضافة التصنيف"}</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
