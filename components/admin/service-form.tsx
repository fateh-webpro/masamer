"use client";

import React, { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Save,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Sparkles,
  ImageIcon,
  Trash2,
  Upload,
  Search,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServiceIcon, SERVICE_ICONS } from "@/components/shared/service-icon";
import { ServiceFormState } from "@/app/admin/services/actions";
import type { ServiceItem } from "@/lib/services/service-dal";
import { isRuntimeUploadPath } from "@/lib/utils";

interface ServiceFormProps {
  initialData?: ServiceItem | null;
  categories?: Array<{ id: string; name: string }>;
  formAction: (
    prevState: ServiceFormState | null,
    formData: FormData
  ) => Promise<ServiceFormState>;
  mode: "create" | "edit";
}

const ICON_LABELS: Record<string, string> = {
  Coffee: "قهوة وضيافة عربية (Coffee)",
  Flame: "شعلة وبخور أصيل (Flame)",
  Sparkles: "تألق وفخامة (Sparkles)",
  ShieldCheck: "جودة وضمان معتمد (ShieldCheck)",
  Utensils: "أطعمة ومقبلات فاخرة (Utensils)",
  Award: "خدمة VIP متميزة (Award)",
  Users: "استقبال وإدارة وفود (Users)",
  CheckCircle2: "احترافية وإتقان (CheckCircle2)",
  Clock: "التزام فائق بالمواعيد (Clock)",
  Star: "تجربة استثنائية (Star)",
  Crown: "ضيافة ملكية خاصة (Crown)",
  HeartHandshake: "عناية ولباقة بالضيوف (HeartHandshake)",
};

export function ServiceForm({ initialData, categories = [], formAction, mode }: ServiceFormProps) {
  const [state, action, isPending] = useActionState(formAction, null);

  const [title, setTitle] = useState<string>(initialData?.title || "");
  const [shortDescription, setShortDescription] = useState<string>(
    initialData?.shortDescription || ""
  );
  const [seoTitle, setSeoTitle] = useState<string>(initialData?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState<string>(
    initialData?.seoDescription || ""
  );

  const [selectedIcon, setSelectedIcon] = useState<string>(
    initialData?.icon || "Coffee"
  );
  const [slug, setSlug] = useState<string>(initialData?.slug || "");
  const [isAutoSlug, setIsAutoSlug] = useState<boolean>(!initialData);

  // Convert initial features array to multiline string
  const initialFeaturesString = initialData?.features
    ? initialData.features.join("\n")
    : "";
  const [featuresText, setFeaturesText] = useState<string>(
    initialFeaturesString
  );
  const [coverPreview, setCoverPreview] = useState(initialData?.coverImagePath || "");
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
  useEffect(() => () => { newPreviews.forEach((url) => URL.revokeObjectURL(url)); }, [newPreviews]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (isAutoSlug && mode === "create") {
      // Generate clean english slug fallback or keep user choice
      const auto = val
        .trim()
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      if (auto) {
        setSlug(auto);
      }
    }
  };

  return (
    <form action={action} className="space-y-8">
      {deletedImageIds.map((id) => <input key={id} type="hidden" name="deletedImageIds" value={id} />)}
      {state?.error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">{state.error}</p>
            {state.fieldErrors && (
              <ul className="list-disc list-inside mt-2 space-y-1 text-xs text-rose-700">
                {Object.entries(state.fieldErrors).map(([field, errs]) => (
                  <li key={field}>{errs.join("، ")}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">
          المعلومات الأساسية للخدمة
        </h2>

        {/* Title and Slug */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-semibold text-slate-800 mb-2"
            >
              عنوان الخدمة <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={title}
              onChange={handleTitleChange}
              placeholder="مثال: الضيافة النجدية الملكية"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500"
            />
            {state?.fieldErrors?.title && (
              <p className="mt-1.5 text-xs text-rose-600 font-medium">
                {state.fieldErrors.title[0]}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="slug"
              className="block text-sm font-semibold text-slate-800 mb-2"
            >
              الاسم اللطيف في الرابط (Slug) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              required
              dir="ltr"
              value={slug}
              onChange={(e) => {
                setIsAutoSlug(false);
                setSlug(e.target.value);
              }}
              placeholder="royal-najdi-hospitality"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500 text-left font-mono"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              يستخدم في رابط الصفحة: /services/{"{slug}"} (أحرف إنجليزية وأرقام وشرطات فقط)
            </p>
            {state?.fieldErrors?.slug && (
              <p className="mt-1.5 text-xs text-rose-600 font-medium">
                {state.fieldErrors.slug[0]}
              </p>
            )}
          </div>
        </div>

        {/* Service Category */}
        <div>
          <label
            htmlFor="categoryId"
            className="block text-sm font-semibold text-slate-800 mb-2"
          >
            تصنيف الخدمة <span className="text-xs font-normal text-slate-400">(اختياري - يحدد الفئة الرئيسية للخدمة)</span>
          </label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={initialData?.categoryId || ""}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500"
          >
            <option value="">بدون تصنيف (خدمة عامة)</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-slate-500">
            يمكنك إضافة أو تعديل الفئات من صفحة{" "}
            <Link href="/admin/services/categories" target="_blank" className="text-secondary-600 underline font-semibold">
              تصنيفات الخدمات
            </Link>.
          </p>
        </div>

        {/* Short Description */}
        <div>
          <label
            htmlFor="shortDescription"
            className="block text-sm font-semibold text-slate-800 mb-2"
          >
            الوصف المختصر (يظهر في البطاقات والمقدمات) <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="shortDescription"
            name="shortDescription"
            required
            rows={2}
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="موجز جذاب لا يتجاوز سطرين يشرح جوهر الخدمة للعميل..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500 resize-y"
          />
          {state?.fieldErrors?.shortDescription && (
            <p className="mt-1.5 text-xs text-rose-600 font-medium">
              {state.fieldErrors.shortDescription[0]}
            </p>
          )}
        </div>

        {/* Full Description */}
        <div>
          <label
            htmlFor="fullDescription"
            className="block text-sm font-semibold text-slate-800 mb-2"
          >
            الوصف التفصيلي الكامل <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="fullDescription"
            name="fullDescription"
            required
            rows={5}
            defaultValue={initialData?.fullDescription || ""}
            placeholder="شرح شامل ومفصل لتفاصيل الخدمة، كرم الضيافة، طاقم العمل، والأجواء المميزة المقدمة..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500 resize-y"
          />
          {state?.fieldErrors?.fullDescription && (
            <p className="mt-1.5 text-xs text-rose-600 font-medium">
              {state.fieldErrors.fullDescription[0]}
            </p>
          )}
        </div>

        {/* Features list (multiline UX) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="features"
              className="block text-sm font-semibold text-slate-800"
            >
              مميزات وعناصر الخدمة (ميزة واحدة في كل سطر) <span className="text-rose-500">*</span>
            </label>
            <span className="text-xs text-secondary-700 bg-secondary-50 px-2 py-0.5 rounded border border-secondary-200">
              سطر جديد لكل نقطة
            </span>
          </div>
          <textarea
            id="features"
            name="features"
            required
            rows={4}
            value={featuresText}
            onChange={(e) => setFeaturesText(e.target.value)}
            placeholder={"طاقم ضيافة سعودي متخصص ومدرب بالزي التراثي\nتقديم القهوة السعودية الفاخرة بأنواع التمور المحشوة\nتجهيز أواني التقديم النحاسية المذهبة\nبخور وعطور فاخرة في الاستقبال"}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500 font-sans"
          />
          <p className="mt-1.5 text-xs text-slate-500">
            اكتب كل ميزة في سطر منفصل؛ سيتم تحويلها تلقائياً إلى قائمة نقاط أنيقة في صفحة الخدمة.
          </p>
          {state?.fieldErrors?.features && (
            <p className="mt-1.5 text-xs text-rose-600 font-medium">
              {state.fieldErrors.features[0]}
            </p>
          )}
        </div>

        <div className="pt-4 border-t border-slate-100 space-y-5">
          <h3 className="font-bold text-slate-900 flex items-center gap-2"><ImageIcon className="w-5 h-5 text-secondary-600" /> صور الخدمة</h3>
          <div className="grid sm:grid-cols-[220px_1fr] gap-5 items-start">
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-sand-50">
              {coverPreview ? <Image src={coverPreview} alt="معاينة غلاف الخدمة" fill className="object-cover" unoptimized={coverPreview.startsWith("blob:") || isRuntimeUploadPath(coverPreview)} /> : <div className="h-full flex items-center justify-center text-slate-400"><ImageIcon className="w-9 h-9" /></div>}
              <span className="absolute top-2 right-2 rounded-full bg-[#1F294A]/85 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">الصورة الرئيسية</span>
            </div>
            <div><label htmlFor="coverImage" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 cursor-pointer font-semibold text-sm"><Upload className="w-4 h-4" />{coverPreview ? "استبدال الغلاف" : "رفع غلاف"}</label><input id="coverImage" name="coverImage" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) setCoverPreview(URL.createObjectURL(file)); }} /><p className="text-xs text-slate-500 mt-2">JPEG أو PNG أو WEBP، بحد أقصى 5MB. الغلاف اختياري، ولا يلزم رفعه مجددًا عند التعديل.</p></div>
          </div>
          {initialData?.images.filter((image) => !deletedImageIds.includes(image.id)).length ? <div><p className="mb-2 text-xs font-semibold text-[#747986]">الصور الإضافية الحالية</p><div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{initialData.images.filter((image) => !deletedImageIds.includes(image.id)).map((image, index) => <div key={image.id} className="relative aspect-4/3 rounded-xl overflow-hidden border border-[#E8E3DE] group"><Image src={image.imagePath} alt={image.altText || initialData.title} fill className="object-cover" unoptimized={isRuntimeUploadPath(image.imagePath)} />{!initialData.coverImagePath && index === 0 && <span className="absolute bottom-2 right-2 rounded-full bg-[#1F294A]/85 px-2 py-1 text-[10px] font-bold text-white">بديل الغلاف</span>}<button type="button" onClick={() => setDeletedImageIds((ids) => [...ids, image.id])} className="absolute top-2 left-2 p-2 rounded-lg bg-rose-600 text-white focus-visible:ring-2 focus-visible:ring-white" aria-label="حذف الصورة"><Trash2 className="w-4 h-4" /></button></div>)}</div></div> : null}
          {newPreviews.length > 0 && <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{newPreviews.map((url, index) => <div key={url} className="relative aspect-4/3 rounded-xl overflow-hidden border-2 border-emerald-300"><Image src={url} alt={`معاينة ${index + 1}`} fill className="object-cover" unoptimized /></div>)}</div>}
          <label htmlFor="additionalImages" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sand-100 border border-sand-200 cursor-pointer font-semibold text-sm"><Upload className="w-4 h-4" /> إضافة صور متعددة</label>
          <input id="additionalImages" name="additionalImages" type="file" multiple accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => setNewPreviews(Array.from(event.target.files || []).map((file) => URL.createObjectURL(file)))} />
        </div>

        {/* Icon & Sort Order */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          <div>
            <label
              htmlFor="icon"
              className="block text-sm font-semibold text-slate-800 mb-2"
            >
              أيقونة الخدمة
            </label>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-sand-100 border border-sand-200 flex items-center justify-center text-secondary-700 shrink-0 shadow-xs">
                <ServiceIcon name={selectedIcon} className="w-6 h-6" />
              </div>
              <select
                id="icon"
                name="icon"
                value={selectedIcon}
                onChange={(e) => setSelectedIcon(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500"
              >
                {Object.keys(SERVICE_ICONS).map((iconKey) => (
                  <option key={iconKey} value={iconKey}>
                    {ICON_LABELS[iconKey] || iconKey}
                  </option>
                ))}
              </select>
            </div>
            {state?.fieldErrors?.icon && (
              <p className="mt-1.5 text-xs text-rose-600 font-medium">
                {state.fieldErrors.icon[0]}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="sortOrder"
              className="block text-sm font-semibold text-slate-800 mb-2"
            >
              ترتيب العرض (Sort Order)
            </label>
            <input
              type="number"
              id="sortOrder"
              name="sortOrder"
              defaultValue={initialData?.sortOrder ?? 0}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              الأرقام الأقل تظهر أولاً (مثال: 1 يسبق 2).
            </p>
            {state?.fieldErrors?.sortOrder && (
              <p className="mt-1.5 text-xs text-rose-600 font-medium">
                {state.fieldErrors.sortOrder[0]}
              </p>
            )}
          </div>
        </div>

        {/* Is Active Status Switch */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <label
              htmlFor="isActive"
              className="text-sm font-bold text-slate-900 block cursor-pointer"
            >
              تفعيل الخدمة ونشرها
            </label>
            <p className="text-xs text-slate-500 mt-0.5">
              عند التفعيل، ستظهر الخدمة مباشرة لزوار الموقع العام وتكون متاحة للحجز.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              value="true"
              defaultChecked={initialData ? initialData.isActive : true}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>
      </div>

      {/* SEO Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-secondary-100 text-secondary-700 flex items-center justify-center shrink-0">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                تحسين محركات البحث (SEO)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                تخصيص عنوان ووصف الخدمة في نتائج محركات البحث ومشاركات التواصل الاجتماعي.
              </p>
            </div>
          </div>
        </div>

        {/* SEO Title Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="seoTitle"
              className="block text-sm font-semibold text-slate-800"
            >
              عنوان SEO المخصص (Title Tag){" "}
              <span className="text-xs font-normal text-slate-400">(اختياري)</span>
            </label>
            <span
              className={`text-xs font-mono font-medium ${
                seoTitle.length > 200
                  ? "text-rose-600 font-bold"
                  : seoTitle.length > 60
                  ? "text-amber-600"
                  : "text-slate-400"
              }`}
            >
              {seoTitle.length} / 200 حرف
            </span>
          </div>
          <input
            type="text"
            id="seoTitle"
            name="seoTitle"
            maxLength={200}
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            placeholder={`مثال: ${title || "خدمات الضيافة البشرية والقهوجيين"} في الرياض وجدة`}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500"
          />
          <div className="mt-1.5 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 gap-1">
            <p>
              يحدد العنوان الذي يظهر في نتائج Google ومشاركات الروابط. في حال تركه فارغًا، سيتم استخدام عنوان الخدمة تلقائيًا.
            </p>
            <p className="text-slate-400 shrink-0">
              المعدل المثالي الاسترشادي: 40 - 60 حرفًا
            </p>
          </div>
          {state?.fieldErrors?.seoTitle && (
            <p className="mt-1.5 text-xs text-rose-600 font-medium">
              {state.fieldErrors.seoTitle[0]}
            </p>
          )}
        </div>

        {/* SEO Description Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="seoDescription"
              className="block text-sm font-semibold text-slate-800"
            >
              وصف SEO المخصص (Meta Description){" "}
              <span className="text-xs font-normal text-slate-400">(اختياري)</span>
            </label>
            <span
              className={`text-xs font-mono font-medium ${
                seoDescription.length > 400
                  ? "text-rose-600 font-bold"
                  : seoDescription.length > 160
                  ? "text-amber-600"
                  : "text-slate-400"
              }`}
            >
              {seoDescription.length} / 400 حرف
            </span>
          </div>
          <textarea
            id="seoDescription"
            name="seoDescription"
            rows={3}
            maxLength={400}
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
            placeholder="مقتطف تسويقي واضح ومحدد يظهر في محركات البحث لجذب العملاء لمناسباتهم..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500 resize-y"
          />
          <div className="mt-1.5 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 gap-1">
            <p>
              وصف جذاب يوضح قيمة الخدمة للباحث. في حال تركه فارغًا، سيتم استخدام الوصف المختصر للخدمة تلقائيًا.
            </p>
            <p className="text-slate-400 shrink-0">
              المعدل المثالي الاسترشادي: 120 - 160 حرفًا
            </p>
          </div>
          {state?.fieldErrors?.seoDescription && (
            <p className="mt-1.5 text-xs text-rose-600 font-medium">
              {state.fieldErrors.seoDescription[0]}
            </p>
          )}
        </div>

        {/* Live Search Engine Result Preview */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-secondary-600" />
              <span>معاينة تقريبية لنتيجة محرك البحث (Google Preview)</span>
            </span>
            <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
              معاينة توضيحية مباشرة
            </span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            {/* Google Result URL Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-slate-600" dir="ltr">
              <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700">
                M
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[11px] font-medium text-slate-800">مسامر | MASAMER</span>
                <span className="text-[10px] text-slate-500 truncate max-w-xs sm:max-w-md">
                  https://masamersa.com/services/{slug.trim() || "service-slug"}
                </span>
              </div>
            </div>

            {/* Google Result Title */}
            <h3 className="text-base sm:text-lg font-semibold text-[#1a0dab] hover:underline cursor-pointer leading-snug">
              {(seoTitle.trim() || title.trim() || "عنوان الخدمة") + " | مسامر"}
            </h3>

            {/* Google Result Snippet */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2">
              {seoDescription.trim() ||
                shortDescription.trim() ||
                "وصف الخدمة الذي سيظهر في نتائج محركات البحث لتقديم لمحة سريعة لزوار الموقع والباحثين في Google..."}
            </p>
          </div>

          <p className="mt-2 text-[10px] text-slate-400 leading-relaxed">
            * تنبيه توضيحي: هذه المعاينة تحاكي الشكل المتوقع استرشاديًا فقط؛ تقوم خوارزميات محركات البحث بتحديد العرض النهائي للعنوان والوصف وفق سياق بحث المستخدم وطول الشاشة.
          </p>
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="flex items-center justify-between gap-4">
        <Button asChild variant="outline">
          <Link href="/admin/services" className="gap-2">
            <ArrowRight className="w-4 h-4" />
            <span>إلغاء والعودة</span>
          </Link>
        </Button>

        <Button
          type="submit"
          variant="secondary"
          size="lg"
          disabled={isPending}
          className="gap-2 font-bold shadow-md shadow-secondary-900/10 min-w-[160px]"
        >
          <Save className="w-4 h-4" />
          <span>{isPending ? "جاري الحفظ..." : mode === "create" ? "إنشاء الخدمة" : "حفظ التعديلات"}</span>
        </Button>
      </div>
    </form>
  );
}
