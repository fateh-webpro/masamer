"use client";

import React, { useState, useActionState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Upload,
  Image as ImageIcon,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Layers,
  Star,
} from "lucide-react";
import {
  createPortfolioItemAction,
  updatePortfolioItemAction,
  type PortfolioFormState,
} from "@/app/admin/portfolio/actions";
import type { PortfolioItemData, PortfolioCategoryData } from "@/lib/services/portfolio-dal";
import { Button } from "@/components/ui/button";
import { isRuntimeUploadPath } from "@/lib/utils";

interface PortfolioFormProps {
  initialData?: PortfolioItemData | null;
  categories: PortfolioCategoryData[];
  mode: "create" | "edit";
}

export function PortfolioForm({ initialData, categories, mode }: PortfolioFormProps) {
  const isEdit = mode === "edit" && !!initialData;

  const actionWithId = isEdit
    ? updatePortfolioItemAction.bind(null, initialData.id)
    : createPortfolioItemAction;

  const [state, formAction, isPending] = useActionState<PortfolioFormState | null, FormData>(
    actionWithId,
    null
  );

  // Cover image preview state
  const [coverPreview, setCoverPreview] = useState<string | null>(
    initialData?.coverImagePath || null
  );

  // Additional images: existing images vs deleted image IDs
  const [existingImages, setExistingImages] = useState(initialData?.images || []);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);

  // Newly selected additional images previews
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const additionalFileInputRef = useRef<HTMLInputElement>(null);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCoverPreview(url);
    }
  };

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        urls.push(URL.createObjectURL(files[i]));
      }
      setNewImagePreviews(urls);
    } else {
      setNewImagePreviews([]);
    }
  };

  const handleDeleteExistingImage = (imageId: string) => {
    setDeletedImageIds((prev) => [...prev, imageId]);
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {isEdit ? `تعديل عمل: ${initialData.title}` : "إضافة عمل جديد لمعرض الأعمال"}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isEdit
              ? "قم بتحديث صور وتفاصيل العمل وتصنيفه في المعرض"
              : "أدخل بيانات وصور العمل ليعرض في معرض أعمال مسامر"}
          </p>
        </div>
        <Link
          href="/admin/portfolio"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl transition-colors shadow-2xs"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>العودة للمعرض</span>
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

      {/* Form */}
      <form action={formAction} className="p-6 sm:p-8 space-y-8">
        {/* Hidden inputs for deleted images */}
        {deletedImageIds.map((id) => (
          <input key={id} type="hidden" name="deletedImageIds" value={id} />
        ))}

        {/* Section 1: Basic Information */}
        <div className="space-y-5">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Layers className="w-4 h-4 text-secondary-600" />
            <span>المعلومات الأساسية للعمل</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-slate-800 mb-1.5">
                عنوان العمل <span className="text-rose-500">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                defaultValue={initialData?.title || ""}
                placeholder="مثال: ضيافة القمة الاستثمارية بفندق الفيصلية"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                  state?.fieldErrors?.title
                    ? "border-rose-300 focus:ring-rose-200 bg-rose-50/30"
                    : "border-slate-200 focus:border-secondary-500 focus:ring-secondary-100 bg-white"
                }`}
              />
              {state?.fieldErrors?.title && (
                <p className="text-xs text-rose-600 mt-1">{state.fieldErrors.title[0]}</p>
              )}
            </div>

            {/* Slug */}
            <div>
              <label htmlFor="slug" className="block text-sm font-semibold text-slate-800 mb-1.5">
                الاسم اللطيف (Slug) <span className="text-rose-500">*</span>
              </label>
              <input
                id="slug"
                name="slug"
                type="text"
                required
                dir="ltr"
                defaultValue={initialData?.slug || ""}
                placeholder="investment-summit-hospitality"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all text-left ${
                  state?.fieldErrors?.slug
                    ? "border-rose-300 focus:ring-rose-200 bg-rose-50/30"
                    : "border-slate-200 focus:border-secondary-500 focus:ring-secondary-100 bg-white"
                }`}
              />
              {state?.fieldErrors?.slug && (
                <p className="text-xs text-rose-600 mt-1">{state.fieldErrors.slug[0]}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Category Selection */}
            <div>
              <label htmlFor="categoryId" className="block text-sm font-semibold text-slate-800 mb-1.5">
                تصنيف العمل <span className="text-rose-500">*</span>
              </label>
              <select
                id="categoryId"
                name="categoryId"
                required
                defaultValue={initialData?.categoryId || categories[0]?.id || ""}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none focus:ring-2 transition-all bg-white ${
                  state?.fieldErrors?.categoryId
                    ? "border-rose-300 focus:ring-rose-200 bg-rose-50/30"
                    : "border-slate-200 focus:border-secondary-500 focus:ring-secondary-100"
                }`}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} {!cat.isActive ? "(معطل)" : ""}
                  </option>
                ))}
              </select>
              {state?.fieldErrors?.categoryId && (
                <p className="text-xs text-rose-600 mt-1">{state.fieldErrors.categoryId[0]}</p>
              )}
            </div>

            {/* Sort Order */}
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
          </div>

          {/* Short Description */}
          <div>
            <label htmlFor="shortDescription" className="block text-sm font-semibold text-slate-800 mb-1.5">
              الوصف المختصر <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="shortDescription"
              name="shortDescription"
              required
              rows={2}
              defaultValue={initialData?.shortDescription || ""}
              placeholder="نبذة موجزة تظهر في بطاقة المعرض وبداية صفحة التفاصيل..."
              className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                state?.fieldErrors?.shortDescription
                  ? "border-rose-300 focus:ring-rose-200 bg-rose-50/30"
                  : "border-slate-200 focus:border-secondary-500 focus:ring-secondary-100 bg-white"
              }`}
            />
            {state?.fieldErrors?.shortDescription && (
              <p className="text-xs text-rose-600 mt-1">{state.fieldErrors.shortDescription[0]}</p>
            )}
          </div>

          {/* Full Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-slate-800 mb-1.5">
              الوصف الكامل والتفصيلي <span className="text-xs font-normal text-slate-400">(اختياري)</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={initialData?.description || ""}
              placeholder="شرح كامل لتفاصيل التجهيز، نوعية الأواني المستخدمة، عدد الضيوف، وطبيعة التنسيق..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-secondary-500 focus:ring-2 focus:ring-secondary-100 bg-white"
            />
          </div>
        </div>

        {/* Section 2: Cover Image */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-secondary-600" />
            <span>صورة الغلاف الرئيسية</span>
            {!isEdit && <span className="text-rose-500">*</span>}
          </h3>

          <div className="flex flex-col sm:flex-row items-start gap-6 p-4 rounded-xl border border-slate-200 bg-slate-50/30">
            {coverPreview ? (
              <div className="relative w-full sm:w-48 h-32 rounded-xl overflow-hidden border border-slate-200 shadow-xs bg-slate-900/10 shrink-0">
                <Image
                  src={coverPreview}
                  alt="معاينة صورة الغلاف"
                  fill
                  className="object-cover"
                  unoptimized={coverPreview.startsWith("blob:") || isRuntimeUploadPath(coverPreview)}
                />
                <span className="absolute top-2 right-2 rounded-full bg-[#1F294A]/85 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">الصورة الرئيسية</span>
              </div>
            ) : (
              <div className="w-full sm:w-48 h-32 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 shrink-0 bg-white">
                <ImageIcon className="w-8 h-8 mb-1 opacity-50" />
                <span className="text-xs font-medium">لم يتم اختيار صورة</span>
              </div>
            )}

            <div className="flex-1 space-y-2">
              <label
                htmlFor="coverImage"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer shadow-2xs transition-colors"
              >
                <Upload className="w-4 h-4 text-secondary-600" />
                <span>{coverPreview ? "تغيير صورة الغلاف" : "رفع صورة الغلاف"}</span>
              </label>
              <input
                id="coverImage"
                name="coverImage"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleCoverChange}
                className="sr-only"
              />
              <p className="text-[11px] text-slate-500 leading-relaxed">
                الصيغ المسموحة: (PNG, JPG, WEBP). الحجم الأقصى: 5 ميجابايت. يُفضل استخدام صورة أفقية بدقة عالية (16:9 أو 4:3).
              </p>
              {state?.fieldErrors?.coverImage && (
                <p className="text-xs text-rose-600 font-medium">{state.fieldErrors.coverImage[0]}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Additional Images Gallery */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-secondary-600" />
              <span>معرض الصور الإضافية للعمل</span>
              <span className="text-xs font-normal text-slate-400">(اختياري)</span>
            </h3>
            <label
              htmlFor="additionalImages"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sand-100 hover:bg-sand-200 text-secondary-800 text-xs font-semibold cursor-pointer border border-sand-200 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>إضافة صور جديدة</span>
            </label>
          </div>

          <input
            id="additionalImages"
            ref={additionalFileInputRef}
            name="additionalImages"
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp"
            onChange={handleAdditionalImagesChange}
            className="sr-only"
          />

          {/* Existing Gallery Images (In Edit Mode) */}
          {existingImages.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-2">الصور الحالية المرفوعة:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {existingImages.map((img) => (
                  <div
                    key={img.id}
                    className="relative group h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-100"
                  >
                    <Image
                      src={img.imagePath}
                      alt={img.altText || "صورة من المعرض"}
                      fill
                      className="object-cover"
                      unoptimized={isRuntimeUploadPath(img.imagePath)}
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                      <button
                        type="button"
                        onClick={() => handleDeleteExistingImage(img.id)}
                        className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 shadow-sm transition-colors text-xs flex items-center gap-1"
                        title="حذف الصورة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Newly Selected Images Preview */}
          {newImagePreviews.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-emerald-700 mb-2">
                صور جديدة محددة للرفع ({newImagePreviews.length}):
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {newImagePreviews.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative h-28 rounded-xl overflow-hidden border-2 border-emerald-300 bg-emerald-50"
                  >
                    <Image
                      src={url}
                      alt={`معاينة الصورة الجديدة ${idx + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px]">
                      جديد #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {existingImages.length === 0 && newImagePreviews.length === 0 && (
            <div className="p-6 rounded-xl border border-dashed border-slate-200 text-center bg-slate-50/50">
              <p className="text-xs text-slate-500">
                لا توجد صور إضافية. يمكنك اختيار عدة صور بدقة عالية لإنشاء معرض تفصيلي للعمل.
              </p>
            </div>
          )}
        </div>

        {/* Section 4: Display & Status Settings */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              name="isFeatured"
              value="true"
              defaultChecked={initialData ? initialData.isFeatured : false}
              className="w-4 h-4 rounded text-secondary-600 focus:ring-secondary-500 border-slate-300"
            />
            <div>
              <span className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>عمل مميز (Featured)</span>
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                يظهر العمل في قسم "أعمالنا" بالصفحة الرئيسية
              </span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              name="isActive"
              value="true"
              defaultChecked={initialData ? initialData.isActive : true}
              className="w-4 h-4 rounded text-secondary-600 focus:ring-secondary-500 border-slate-300"
            />
            <div>
              <span className="text-sm font-semibold text-slate-800 block">تفعيل العمل في المعرض</span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                يظهر للزوار في صفحة المعرض العامة /works
              </span>
            </div>
          </label>
        </div>

        {/* Form Actions */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link
            href="/admin/portfolio"
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
                <span>جاري حفظ العمل ورفع الصور...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{isEdit ? "حفظ التعديلات" : "نشر العمل في المعرض"}</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
