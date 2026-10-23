"use client";

import { useActionState, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Plus, Save, Search, X } from "lucide-react";
import { updateSeoPageSettingsAction } from "@/app/admin/site-settings/seo-actions";
import type { SeoPageTarget } from "@/lib/services/seo-page-setting-dal";

const MAX_SECONDARY_KEYWORDS = 150;
const MAX_LOCAL_KEYWORDS_PER_CITY = 100;

function TagEditor({ label, values, onChange, max = MAX_SECONDARY_KEYWORDS }: { label: string; values: string[]; onChange: (values: string[]) => void; max?: number }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const value = draft.trim().replace(/\s+/g, " ");
    if (!value || values.length >= max || values.some((item) => item.toLocaleLowerCase("ar") === value.toLocaleLowerCase("ar"))) return;
    onChange([...values, value]);
    setDraft("");
  };
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-800">{label}</label>
      <div className="flex gap-2">
        <input value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === ",") { event.preventDefault(); add(); } }} className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-secondary-500 focus:outline-none focus:ring-2 focus:ring-secondary-500/20" placeholder="اكتب العبارة ثم اضغط Enter" maxLength={100} />
        <button type="button" onClick={add} className="inline-flex items-center gap-1 rounded-xl border border-secondary-300 px-3 text-sm font-semibold text-secondary-700 hover:bg-secondary-50" aria-label={`إضافة إلى ${label}`}><Plus className="h-4 w-4" /> إضافة</button>
      </div>
      {values.length > 0 && <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto rounded-xl border border-slate-100 p-2">{values.map((value) => <span key={value} className="inline-flex items-center gap-1 rounded-full bg-secondary-50 px-3 py-1 text-xs font-medium text-secondary-800 ring-1 ring-secondary-200">{value}<button type="button" onClick={() => onChange(values.filter((item) => item !== value))} aria-label={`حذف ${value}`} className="rounded-full p-0.5 hover:bg-secondary-100"><X className="h-3 w-3" /></button></span>)}</div>}
      <p className="text-[11px] text-slate-500">{values.length}/{max}</p>
    </div>
  );
}

function SeoEditor({ target }: { target: SeoPageTarget }) {
  const [state, action, pending] = useActionState(updateSeoPageSettingsAction, null);
  const [title, setTitle] = useState(target.seoTitle);
  const [description, setDescription] = useState(target.seoDescription);
  const [secondary, setSecondary] = useState(target.secondaryKeywords);
  const [local, setLocal] = useState(target.localKeywords);
  const canonical = `https://masamersa.com${target.canonicalPath === "/" ? "" : target.canonicalPath}`;
  const shownTitle = title || target.fallbackTitle;
  const shownDescription = description || target.fallbackDescription;

  return (
    <form action={action} className="space-y-6" noValidate>
      <input type="hidden" name="pageKey" value={target.pageKey} />
      <input type="hidden" name="secondaryKeywords" value={JSON.stringify(secondary)} />
      <input type="hidden" name="localKeywordsRiyadh" value={JSON.stringify(local.الرياض)} />
      <input type="hidden" name="localKeywordsJeddah" value={JSON.stringify(local.جدة)} />
      <input type="hidden" name="localKeywordsDammam" value={JSON.stringify(local.الدمام)} />
      {state?.success && state.pageKey === target.pageKey && <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800"><CheckCircle2 className="h-4 w-4" />{state.message}</div>}
      {state?.error && state.pageKey === target.pageKey && <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-800"><AlertCircle className="h-4 w-4" />{state.error}</div>}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><span className="text-xs text-slate-500">الرابط المعتمد (غير قابل للتعديل)</span><p dir="ltr" className="mt-1 break-all text-left font-mono text-sm text-primary-900">{canonical}</p></div>
      <div className="grid gap-5 lg:grid-cols-2">
        <div><div className="mb-2 flex items-center justify-between"><label htmlFor={`seoTitle-${target.pageKey}`} className="text-sm font-semibold text-slate-800">عنوان SEO <span className="font-normal text-slate-400">اختياري</span></label><span className="text-xs text-slate-400">{title.length}/200</span></div><input id={`seoTitle-${target.pageKey}`} name="seoTitle" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={200} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-secondary-500 focus:outline-none focus:ring-2 focus:ring-secondary-500/20" /><p className="mt-1 text-xs text-slate-500">يؤثر على عنوان الصفحة في نتائج البحث، ويختلف عن عنوان المحتوى الظاهر.</p></div>
        <div><label htmlFor={`primary-${target.pageKey}`} className="mb-2 block text-sm font-semibold text-slate-800">الكلمة المفتاحية الرئيسية <span className="font-normal text-slate-400">اختياري</span></label><input id={`primary-${target.pageKey}`} name="primaryKeyword" defaultValue={target.primaryKeyword} maxLength={160} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-secondary-500 focus:outline-none focus:ring-2 focus:ring-secondary-500/20" /><p className="mt-1 text-xs text-slate-500">للتخطيط ومراجعة توافق المحتوى، وليست ضمانًا للترتيب.</p></div>
      </div>
      <div><div className="mb-2 flex items-center justify-between"><label htmlFor={`description-${target.pageKey}`} className="text-sm font-semibold text-slate-800">وصف SEO <span className="font-normal text-slate-400">اختياري</span></label><span className="text-xs text-slate-400">{description.length}/400</span></div><textarea id={`description-${target.pageKey}`} name="seoDescription" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={400} rows={4} className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-secondary-500 focus:outline-none focus:ring-2 focus:ring-secondary-500/20" /><p className="mt-1 text-xs text-slate-500">وصف مقترح لمحركات البحث؛ وقد تختار Google نصًا مختلفًا حسب الاستعلام.</p></div>
      <TagEditor label="الكلمات المفتاحية الثانوية" values={secondary} onChange={setSecondary} />
      <div className="space-y-4 rounded-2xl border border-sand-200 bg-sand-50/50 p-5"><div><h3 className="font-bold text-primary-950">الكلمات المحلية</h3><p className="text-xs text-slate-500">عبارات استهداف تسويقي فقط، ولا تعني وجود فرع أو تغطية تلقائية للمدينة.</p></div><div className="grid gap-5 lg:grid-cols-3">{(["الرياض", "جدة", "الدمام"] as const).map((city) => <TagEditor key={city} label={city} max={MAX_LOCAL_KEYWORDS_PER_CITY} values={local[city]} onChange={(values) => setLocal((current) => ({ ...current, [city]: values }))} />)}</div></div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><span className="text-xs text-emerald-700">{canonical}</span><h3 className="mt-1 text-xl font-medium text-[#1a0dab]">{shownTitle}</h3><p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">{shownDescription}</p><p className="mt-3 text-[11px] text-slate-400">معاينة تقريبية؛ قد تعرض Google عنوانًا أو وصفًا مختلفًا.</p></div>
      <button type="submit" disabled={pending} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-950 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-900 disabled:cursor-not-allowed disabled:opacity-60"><Save className="h-4 w-4" />{pending ? "جاري الحفظ..." : "حفظ إعدادات الصفحة"}</button>
    </form>
  );
}

export function SeoSettingsManager({ targets }: { targets: SeoPageTarget[] }) {
  const [selectedKey, setSelectedKey] = useState(targets[0]?.pageKey ?? "");
  const selected = targets.find((target) => target.pageKey === selectedKey) ?? targets[0];
  useEffect(() => { if (!selected && targets[0]) setSelectedKey(targets[0].pageKey); }, [selected, targets]);
  if (!selected) return <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">تعذر تحميل صفحات SEO. يلزم تطبيق Migration الجديدة محليًا قبل الاختبار الوظيفي.</section>;
  return <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"><header className="flex items-start gap-3"><span className="rounded-xl bg-secondary-50 p-2 text-secondary-700"><Search className="h-5 w-5" /></span><div><h2 className="text-xl font-bold text-primary-950">تحسين محركات البحث (SEO)</h2><p className="mt-1 text-sm leading-6 text-slate-500">حرر بيانات الصفحة المختارة فقط. الكلمات المفتاحية أداة تخطيط للمحتوى وليست عامل ترتيب مباشرًا أو ضمانًا للظهور.</p></div></header><div><label htmlFor="seo-page" className="mb-2 block text-sm font-semibold text-slate-800">الصفحة</label><select id="seo-page" value={selectedKey} onChange={(event) => setSelectedKey(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-primary-950 focus:border-secondary-500 focus:outline-none focus:ring-2 focus:ring-secondary-500/20"><optgroup label="الصفحات الأساسية">{targets.filter((item) => item.pageType === "static").map((item) => <option key={item.pageKey} value={item.pageKey}>{item.label}</option>)}</optgroup><optgroup label="صفحات الخدمات">{targets.filter((item) => item.pageType === "service").map((item) => <option key={item.pageKey} value={item.pageKey}>{item.label}</option>)}</optgroup><optgroup label="الأعمال المنشورة">{targets.filter((item) => item.pageType === "portfolio").map((item) => <option key={item.pageKey} value={item.pageKey}>{item.label}</option>)}</optgroup></select></div><SeoEditor key={selected.pageKey} target={selected} /></section>;
}
