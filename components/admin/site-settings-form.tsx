"use client";

import React, { useActionState, useState } from "react";
import Image from "next/image";
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Upload,
  Globe,
  Phone,
  Share2,
  Sparkles,
  LayoutTemplate,
  Search,
  ImageIcon,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateSiteSettingsAction, SiteSettingsFormState } from "@/app/admin/site-settings/actions";
import type { SiteSettingsData } from "@/lib/services/site-setting-dal";

interface SiteSettingsFormProps {
  initialData: SiteSettingsData;
}

interface BackgroundUploadCardProps {
  id: string;
  title: string;
  description: string;
  preview: string | null;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function BackgroundUploadCard({ id, title, description, preview, onChange }: BackgroundUploadCardProps) {
  return (
    <div className="p-5 rounded-2xl bg-sand-50/50 border border-sand-200/80 space-y-4">
      <div>
        <span className="text-sm font-bold text-slate-900 block">{title}</span>
        <p className="text-xs text-slate-500 mt-1">{description}</p>
      </div>
      <div className="relative aspect-video rounded-xl overflow-hidden bg-white border border-slate-200">
        {preview ? (
          <Image src={preview} alt={`معاينة ${title}`} fill sizes="(min-width: 768px) 420px, 90vw" className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
            <ImageIcon className="w-7 h-7 mb-2" />
            <span className="text-xs">لا توجد صورة حالية</span>
          </div>
        )}
      </div>
      <div>
        <label
          htmlFor={id}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer shadow-2xs transition-colors"
        >
          <Upload className="w-3.5 h-3.5 text-secondary-600" />
          <span>{preview ? "استبدال الصورة" : "رفع صورة"}</span>
        </label>
        <input
          type="file"
          id={id}
          name={id}
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={onChange}
        />
        <p className="text-[11px] text-slate-500 mt-2">JPEG أو PNG أو WEBP، بحد أقصى 5 ميجابايت. يفضّل WEBP.</p>
      </div>
    </div>
  );
}

export function SiteSettingsForm({ initialData }: SiteSettingsFormProps) {
  const [state, action, isPending] = useActionState(updateSiteSettingsAction, null);
  const [activeTab, setActiveTab] = useState<string>("identity");

  // Local state for instant image preview before saving
  const [logoPreview, setLogoPreview] = useState<string | null>(initialData.logoPath);
  const [logoDarkPreview, setLogoDarkPreview] = useState<string | null>(initialData.logoDarkPath);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(initialData.faviconPath);
  const [seoImagePreview, setSeoImagePreview] = useState<string | null>(initialData.seoImagePath);
  const [homeHeroBackgroundPreview, setHomeHeroBackgroundPreview] = useState<string | null>(initialData.homeHeroBackgroundPath);
  const [homeHeroCardBackgroundPreview, setHomeHeroCardBackgroundPreview] = useState<string | null>(initialData.homeHeroCardBackgroundPath);
  const [homeStandardsBackgroundPreview, setHomeStandardsBackgroundPreview] = useState<string | null>(initialData.homeStandardsBackgroundPath);
  const [worksCtaBackgroundPreview, setWorksCtaBackgroundPreview] = useState<string | null>(initialData.worksCtaBackgroundPath);
  const [aboutBackgroundPreview, setAboutBackgroundPreview] = useState<string | null>(initialData.aboutBackgroundPath);
  const [contactBackgroundPreview, setContactBackgroundPreview] = useState<string | null>(initialData.contactBackgroundPath);
  const [requestBackgroundPreview, setRequestBackgroundPreview] = useState<string | null>(initialData.requestBackgroundPath);
  const [ctaBackgroundPreview, setCtaBackgroundPreview] = useState<string | null>(initialData.ctaBackgroundPath);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setPreview: (url: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    }
  };

  const tabs = [
    { id: "identity", label: "الهوية والشعار", icon: Building2 },
    { id: "backgrounds", label: "صور وخلفيات الواجهة", icon: ImageIcon },
    { id: "contact", label: "بيانات التواصل", icon: Phone },
    { id: "social", label: "الشبكات الاجتماعية", icon: Share2 },
    { id: "hero", label: "واجهة البداية (Hero)", icon: Sparkles },
    { id: "footer", label: "التذييل والحقوق", icon: LayoutTemplate },
    { id: "seo", label: "محركات البحث (SEO)", icon: Search },
  ];

  const FieldError = ({ name }: { name: string }) => {
    const message = state?.fieldErrors?.[name]?.[0];
    return message ? <p className="mt-1 text-xs text-rose-600">{message}</p> : null;
  };

  return (
    <form action={action} className="space-y-6" noValidate>
      {/* Feedback Messages */}
      {state?.success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-bold">{state.message || "تم حفظ الإعدادات بنجاح"}</span>
        </div>
      )}

      {state?.error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">{state.error}</p>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-secondary-400" : "text-slate-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Identity & Logos */}
      {activeTab === "identity" && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-secondary-600" />
            <span>هوية المؤسسة والشعار</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="siteName" className="block text-sm font-semibold text-slate-800 mb-2">
                اسم الموقع بالعربية <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="siteName"
                name="siteName"
                required
                defaultValue={initialData.siteName}
                placeholder="مسامر"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500"
              />
              {state?.fieldErrors?.siteName && (
                <p className="mt-1 text-xs text-rose-600">{state.fieldErrors.siteName[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="siteNameEn" className="block text-sm font-semibold text-slate-800 mb-2">
                الاسم بالإنجليزية
              </label>
              <input
                type="text"
                id="siteNameEn"
                name="siteNameEn"
                dir="ltr"
                defaultValue={initialData.siteNameEn}
                placeholder="MASAMER"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm text-left focus:outline-none focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500 font-mono"
              />
              <FieldError name="siteNameEn" />
            </div>
          </div>

          <div>
            <label htmlFor="shortDescription" className="block text-sm font-semibold text-slate-800 mb-2">
              الوصف الموجز للمؤسسة
            </label>
            <input
              type="text"
              id="shortDescription"
              name="shortDescription"
              defaultValue={initialData.shortDescription}
              placeholder="خدمات الضيافة الفاخرة والقهوجيين وتجهيز المناسبات في المملكة العربية السعودية"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500"
            />
            <FieldError name="shortDescription" />
          </div>

          {/* Logo & Favicon Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
            {/* Logo File */}
            <div className="p-5 rounded-2xl bg-sand-50/50 border border-sand-200/80 space-y-4">
              <span className="text-sm font-bold text-slate-900 block">الشعار الرسمي (Logo)</span>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-xs relative">
                  {logoPreview ? (
                    <Image
                      src={logoPreview}
                      alt="شعار الموقع"
                      width={70}
                      height={70}
                      className="object-contain max-h-16 max-w-16"
                    />
                  ) : (
                    <div className="text-center p-2">
                      <ImageIcon className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                      <span className="text-[10px] text-slate-400 block leading-tight">لا يوجد شعار</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-1.5">
                  <label
                    htmlFor="logoFile"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer shadow-2xs transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-secondary-600" />
                    <span>{logoPreview ? "تغيير الشعار" : "رفع شعار جديد"}</span>
                  </label>
                  <input
                    type="file"
                    id="logoFile"
                    name="logoFile"
                    accept=".png,.webp,image/png,image/webp"
                    className="sr-only"
                    onChange={(e) => handleFileChange(e, setLogoPreview)}
                  />
                  <p className="text-[11px] text-slate-500 leading-normal">
                    الصيغ المسموحة: PNG, WEBP (شفاف أو بخلفية)، الحد الأقصى: 2 ميجابايت.
                  </p>
                </div>
              </div>
            </div>

            {/* Dark Background Logo File */}
            <div className="p-5 rounded-2xl bg-sand-50/50 border border-sand-200/80 space-y-4">
              <span className="text-sm font-bold text-slate-900 block">شعار الخلفيات الداكنة</span>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-primary-950 border border-primary-900 flex items-center justify-center overflow-hidden shrink-0 shadow-xs relative">
                  {logoDarkPreview ? (
                    <Image
                      src={logoDarkPreview}
                      alt="شعار الخلفيات الداكنة"
                      width={70}
                      height={70}
                      className="object-contain max-h-16 max-w-16"
                    />
                  ) : (
                    <div className="text-center p-2">
                      <ImageIcon className="w-6 h-6 text-white/60 mx-auto mb-1" />
                      <span className="text-[10px] text-white/60 block leading-tight">لا يوجد شعار داكن</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-1.5">
                  <label
                    htmlFor="logoDarkFile"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer shadow-2xs transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-secondary-600" />
                    <span>{logoDarkPreview ? "تغيير الشعار الداكن" : "رفع شعار داكن"}</span>
                  </label>
                  <input
                    type="file"
                    id="logoDarkFile"
                    name="logoDarkFile"
                    accept=".png,.webp,image/png,image/webp"
                    className="sr-only"
                    onChange={(e) => handleFileChange(e, setLogoDarkPreview)}
                  />
                  <p className="text-[11px] text-slate-500 leading-normal">
                    يُستخدم في الفوتر وأي موضع بخلفية كحلية أو داكنة. PNG أو WEBP، بحد أقصى 2 ميجابايت، ويفضل بخلفية شفافة.
                  </p>
                </div>
              </div>
            </div>

            {/* Favicon File */}
            <div className="p-5 rounded-2xl bg-sand-50/50 border border-sand-200/80 space-y-4">
              <span className="text-sm font-bold text-slate-900 block">أيقونة المتصفح (Favicon)</span>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                  {faviconPreview ? (
                    <Image
                      src={faviconPreview}
                      alt="Favicon"
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                  ) : (
                    <Globe className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 space-y-1.5">
                  <label
                    htmlFor="faviconFile"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer shadow-2xs transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-secondary-600" />
                    <span>{faviconPreview ? "تغيير الأيقونة" : "رفع Favicon"}</span>
                  </label>
                  <input
                    type="file"
                    id="faviconFile"
                    name="faviconFile"
                    accept=".png,.webp,.ico,image/png,image/webp,image/x-icon"
                    className="sr-only"
                    onChange={(e) => handleFileChange(e, setFaviconPreview)}
                  />
                  <p className="text-[11px] text-slate-500 leading-normal">
                    تظهر في تبويب المتصفح. الصيغ: PNG, ICO, WEBP (مربعة).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interface Backgrounds */}
      {activeTab === "backgrounds" && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-secondary-600" />
            <span>صور وخلفيات الواجهة</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BackgroundUploadCard
              id="homeHeroBackgroundFile"
              title="خلفية الواجهة الرئيسية"
              description="تظهر كخلفية باهتة خلف محتوى Hero في الصفحة الرئيسية."
              preview={homeHeroBackgroundPreview}
              onChange={(event) => handleFileChange(event, setHomeHeroBackgroundPreview)}
            />
            <BackgroundUploadCard
              id="homeHeroCardBackgroundFile"
              title="خلفية بطاقة Hero الجانبية"
              description="تستخدم داخل البطاقة الجانبية، ويفضل اختيار صورة غامقة حتى يظهر النص الأبيض بوضوح."
              preview={homeHeroCardBackgroundPreview}
              onChange={(event) => handleFileChange(event, setHomeHeroCardBackgroundPreview)}
            />
            <BackgroundUploadCard
              id="homeStandardsBackgroundFile"
              title="خلفية قسم معاييرنا"
              description="تظهر كخلفية متحركة بتأثير Parallax في قسم معايير نلتزم بها في كل مناسبة. يفضل مشهد عريض بنسبة 21:9."
              preview={homeStandardsBackgroundPreview}
              onChange={(event) => handleFileChange(event, setHomeStandardsBackgroundPreview)}
            />
            <BackgroundUploadCard
              id="worksCtaBackgroundFile"
              title="خلفية قسم تجهيز مخصص لمناسبتك"
              description="تظهر خلف CTA في صفحة أعمالنا. يفضل مقاس 1920×900 أو 1920×1080 بنسبة من 16:9 إلى 21:9، مع مساحة هادئة في المنتصف وبدون نصوص أو شعارات."
              preview={worksCtaBackgroundPreview}
              onChange={(event) => handleFileChange(event, setWorksCtaBackgroundPreview)}
            />
            <BackgroundUploadCard
              id="aboutBackgroundFile"
              title="خلفية صفحة من نحن"
              description="تظهر في رأس صفحة من نحن فقط."
              preview={aboutBackgroundPreview}
              onChange={(event) => handleFileChange(event, setAboutBackgroundPreview)}
            />
            <BackgroundUploadCard
              id="contactBackgroundFile"
              title="خلفية صفحة تواصل معنا"
              description="تظهر في رأس صفحة التواصل فقط."
              preview={contactBackgroundPreview}
              onChange={(event) => handleFileChange(event, setContactBackgroundPreview)}
            />
            <BackgroundUploadCard
              id="requestBackgroundFile"
              title="خلفية صفحة طلب الخدمة"
              description="تظهر في رأس صفحة الطلب دون خلفية النموذج."
              preview={requestBackgroundPreview}
              onChange={(event) => handleFileChange(event, setRequestBackgroundPreview)}
            />
            <BackgroundUploadCard
              id="ctaBackgroundFile"
              title="خلفية CTA"
              description="تظهر داخل دعوة التواصل في الصفحة الرئيسية."
              preview={ctaBackgroundPreview}
              onChange={(event) => handleFileChange(event, setCtaBackgroundPreview)}
            />
          </div>
        </div>
      )}

      {/* Tab 2: Contact Details */}
      {activeTab === "contact" && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Phone className="w-5 h-5 text-secondary-600" />
            <span>بيانات وقنوات التواصل الرسمية</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-slate-800 mb-2">
                رقم الهاتف المباشر
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                dir="ltr"
                defaultValue={initialData.phone}
                placeholder="0539691477"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm text-left focus:outline-none focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500 font-mono"
              />
              <FieldError name="phone" />
              <p className="mt-1 text-[11px] text-slate-500">يستخدم في زر الاتصال في الهيدر والفوتر</p>
            </div>

            <div>
              <label htmlFor="whatsapp" className="block text-sm font-semibold text-slate-800 mb-2">
                رقم الواتساب
              </label>
              <input
                type="text"
                id="whatsapp"
                name="whatsapp"
                dir="ltr"
                defaultValue={initialData.whatsapp}
                placeholder="0539691477"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm text-left focus:outline-none focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500 font-mono"
              />
              <FieldError name="whatsapp" />
              <p className="mt-1 text-[11px] text-slate-500">يستخدم لإنشاء رابط محادثة واتساب الفورية</p>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-800 mb-2">
                البريد الإلكتروني الرسمي
              </label>
              <input
                type="email"
                id="email"
                name="email"
                dir="ltr"
                defaultValue={initialData.email}
                placeholder="info@masamer.sa"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm text-left focus:outline-none focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500"
              />
              {state?.fieldErrors?.email && (
                <p className="mt-1 text-xs text-rose-600">{state.fieldErrors.email[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-semibold text-slate-800 mb-2">
                العنوان والموقع الجغرافي
              </label>
              <input
                type="text"
                id="address"
                name="address"
                defaultValue={initialData.address}
                placeholder="المملكة العربية السعودية - الرياض"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500"
              />
              <FieldError name="address" />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Social Media Links */}
      {activeTab === "social" && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-secondary-600" />
            <span>روابط الشبكات الاجتماعية</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="facebookUrl" className="block text-sm font-semibold text-slate-800 mb-2">
                رابط فيسبوك
              </label>
              <input
                type="url"
                id="facebookUrl"
                name="facebookUrl"
                dir="ltr"
                defaultValue={initialData.facebookUrl || ""}
                placeholder="https://facebook.com/masamer"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm text-left focus:outline-none focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500"
              />
              {state?.fieldErrors?.facebookUrl && (
                <p className="mt-1 text-xs text-rose-600">{state.fieldErrors.facebookUrl[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="xUrl" className="block text-sm font-semibold text-slate-800 mb-2">
                رابط تويتر
              </label>
              <input
                type="url"
                id="xUrl"
                name="xUrl"
                dir="ltr"
                defaultValue={initialData.xUrl || ""}
                placeholder="https://twitter.com/masamer أو https://x.com/masamer"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm text-left focus:outline-none focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500"
              />
              {state?.fieldErrors?.xUrl && (
                <p className="mt-1 text-xs text-rose-600">{state.fieldErrors.xUrl[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="instagramUrl" className="block text-sm font-semibold text-slate-800 mb-2">
                رابط إنستغرام
              </label>
              <input
                type="url"
                id="instagramUrl"
                name="instagramUrl"
                dir="ltr"
                defaultValue={initialData.instagramUrl || ""}
                placeholder="https://instagram.com/masamer"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm text-left focus:outline-none focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500"
              />
              {state?.fieldErrors?.instagramUrl && (
                <p className="mt-1 text-xs text-rose-600">{state.fieldErrors.instagramUrl[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="snapchatUrl" className="block text-sm font-semibold text-slate-800 mb-2">
                رابط سناب شات
              </label>
              <input
                type="url"
                id="snapchatUrl"
                name="snapchatUrl"
                dir="ltr"
                defaultValue={initialData.snapchatUrl || ""}
                placeholder="https://snapchat.com/add/masamer"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm text-left focus:outline-none focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500"
              />
              {state?.fieldErrors?.snapchatUrl && (
                <p className="mt-1 text-xs text-rose-600">{state.fieldErrors.snapchatUrl[0]}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Hero Section */}
      {activeTab === "hero" && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-secondary-600" />
            <span>نصوص وعناوين الواجهة الرئيسية (Hero Section)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="heroBadge" className="block text-sm font-semibold text-slate-800 mb-2">
                شارة البداية العلوية (Badge)
              </label>
              <input
                type="text"
                id="heroBadge"
                name="heroBadge"
                defaultValue={initialData.heroBadge}
                placeholder="أصالة الضيافة برؤية معاصرة"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500"
              />
              <FieldError name="heroBadge" />
            </div>

            <div>
              <label htmlFor="heroTitle" className="block text-sm font-semibold text-slate-800 mb-2">
                العنوان الرئيسي
              </label>
              <input
                type="text"
                id="heroTitle"
                name="heroTitle"
                defaultValue={initialData.heroTitle}
                placeholder="مسـامر لخدمات الضيافة"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500"
              />
              <FieldError name="heroTitle" />
            </div>
          </div>

          <div>
            <label htmlFor="heroHighlightedText" className="block text-sm font-semibold text-slate-800 mb-2">
              الجزء المميز من العنوان (بلون النحاسي المميز)
            </label>
            <input
              type="text"
              id="heroHighlightedText"
              name="heroHighlightedText"
              defaultValue={initialData.heroHighlightedText}
              placeholder="فخامة تليق بضيوفك ومناسباتك"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500"
            />
            <FieldError name="heroHighlightedText" />
          </div>

          <div>
            <label htmlFor="heroDescription" className="block text-sm font-semibold text-slate-800 mb-2">
              الوصف التفصيلي للواجهة
            </label>
            <textarea
              id="heroDescription"
              name="heroDescription"
              rows={3}
              defaultValue={initialData.heroDescription}
              placeholder="نقدم أرقى خدمات القهوجيين والصبابين المدربين..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500 resize-y"
            />
            <FieldError name="heroDescription" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <div>
              <label htmlFor="heroPrimaryButtonText" className="block text-sm font-semibold text-slate-800 mb-2">
                نص الزر الرئيسي (CTA Primary)
              </label>
              <input
                type="text"
                id="heroPrimaryButtonText"
                name="heroPrimaryButtonText"
                defaultValue={initialData.heroPrimaryButtonText}
                placeholder="اطلب الخدمة"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500"
              />
              <FieldError name="heroPrimaryButtonText" />
            </div>

            <div>
              <label htmlFor="heroSecondaryButtonText" className="block text-sm font-semibold text-slate-800 mb-2">
                نص الزر الثانوي (CTA Secondary)
              </label>
              <input
                type="text"
                id="heroSecondaryButtonText"
                name="heroSecondaryButtonText"
                defaultValue={initialData.heroSecondaryButtonText}
                placeholder="استكشف خدماتنا"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500"
              />
              <FieldError name="heroSecondaryButtonText" />
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Footer & Copyright */}
      {activeTab === "footer" && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 text-secondary-600" />
            <span>محتوى التذييل والحقوق (Footer)</span>
          </h2>

          <div>
            <label htmlFor="footerDescription" className="block text-sm font-semibold text-slate-800 mb-2">
              الوصف المعروض في تذييل الصفحة
            </label>
            <textarea
              id="footerDescription"
              name="footerDescription"
              rows={3}
              defaultValue={initialData.footerDescription}
              placeholder="المنصة الرائدة في تقديم أرقى خدمات القهوجيين والصبابين..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500 resize-y"
            />
            <FieldError name="footerDescription" />
          </div>

          <div>
            <label htmlFor="copyrightText" className="block text-sm font-semibold text-slate-800 mb-2">
              نص حقوق الملكية (Copyright)
            </label>
            <input
              type="text"
              id="copyrightText"
              name="copyrightText"
              defaultValue={initialData.copyrightText}
              placeholder="مسامر لخدمات الضيافة. جميع الحقوق محفوظة."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500"
            />
            <FieldError name="copyrightText" />
          </div>
        </div>
      )}

      {/* Tab 6: SEO & Sharing */}
      {activeTab === "seo" && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Search className="w-5 h-5 text-secondary-600" />
            <span>محركات البحث والمشاركة (SEO / Open Graph)</span>
          </h2>

          <div>
            <label htmlFor="seoTitle" className="block text-sm font-semibold text-slate-800 mb-2">
              عنوان SEO للموقع (Title Tag)
            </label>
            <input
              type="text"
              id="seoTitle"
              name="seoTitle"
              defaultValue={initialData.seoTitle}
              placeholder="مسامر | خدمات الضيافة والقهوجيين وتجهيز المناسبات"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500"
            />
            <FieldError name="seoTitle" />
          </div>

          <div>
            <label htmlFor="seoDescription" className="block text-sm font-semibold text-slate-800 mb-2">
              وصف SEO لمحركات البحث (Meta Description)
            </label>
            <textarea
              id="seoDescription"
              name="seoDescription"
              rows={3}
              defaultValue={initialData.seoDescription}
              placeholder="المنصة الرائدة في تقديم خدمات القهوجيين والصبابين المحترفين في المملكة العربية السعودية..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500 resize-y"
            />
            <FieldError name="seoDescription" />
          </div>

          {/* SEO Social Share Image */}
          <div className="pt-4 border-t border-slate-100">
            <div className="p-5 rounded-2xl bg-sand-50/50 border border-sand-200/80 space-y-4">
              <span className="text-sm font-bold text-slate-900 block">صورة المشاركة (Social Share / OG Image)</span>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-48 h-28 rounded-2xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-xs relative">
                  {seoImagePreview ? (
                    <Image
                      src={seoImagePreview}
                      alt="SEO Share Preview"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="text-center p-2">
                      <ImageIcon className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                      <span className="text-[10px] text-slate-400 block">لا توجد صورة مشاركة</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <label
                    htmlFor="seoImageFile"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer shadow-2xs transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-secondary-600" />
                    <span>{seoImagePreview ? "تغيير صورة المشاركة" : "رفع صورة للمشاركة"}</span>
                  </label>
                  <input
                    type="file"
                    id="seoImageFile"
                    name="seoImageFile"
                    accept=".png,.webp,.jpg,.jpeg,image/png,image/webp,image/jpeg"
                    className="sr-only"
                    onChange={(e) => handleFileChange(e, setSeoImagePreview)}
                  />
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    تظهر عند مشاركة رابط الموقع في واتساب وتويتر وفيسبوك. الحجم المثالي الموصى به: 1200x630 بكسل.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Sticky Action Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <p className="text-xs text-slate-500">
          يتم تطبيق التعديلات فورياً على الموقع العام ولوحة الإدارة عند الحفظ.
        </p>

        <Button
          type="submit"
          variant="secondary"
          size="lg"
          disabled={isPending}
          className="gap-2 font-bold shadow-md shadow-secondary-900/10 min-w-[180px]"
        >
          <Save className="w-4 h-4" />
          <span>{isPending ? "جاري الحفظ والرفع..." : "حفظ إعدادات الموقع"}</span>
        </Button>
      </div>
    </form>
  );
}
