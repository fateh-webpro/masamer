"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2, MessageCircle, Send } from "lucide-react";
import { createRequestAction } from "@/app/request/actions";
import { formatWhatsAppUrl } from "@/lib/utils";

type ServiceOption = { id: string; title: string; slug: string };
export function RequestForm({ services, selectedServiceId, whatsapp }: { services: ServiceOption[]; selectedServiceId?: string; whatsapp: string }) {
  const [state, action, pending] = useActionState(createRequestAction, null);
  if (state?.success) {
    const url = formatWhatsAppUrl(whatsapp, `مرحبًا مسامر، أود متابعة طلب ${state.success.reference} لخدمة ${state.success.serviceTitle}.`);
    return <div className="rounded-3xl bg-white border border-emerald-200 p-8 text-center shadow-sm"><CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto mb-4" /><h2 className="text-2xl font-bold text-primary-950">تم استلام طلبك بنجاح</h2><p className="text-slate-600 mt-2">الخدمة: {state.success.serviceTitle}</p><p className="font-mono text-lg font-bold mt-3" dir="ltr">{state.success.reference}</p><a href={url} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 text-white px-5 py-3 font-bold"><MessageCircle className="w-5 h-5" /> المتابعة عبر واتساب</a></div>;
  }
  const field = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-secondary-500/30";
  return <form action={action} className="bg-white rounded-3xl border border-sand-200 p-6 sm:p-8 shadow-sm space-y-5">
    {state?.error && <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">{state.error}</div>}
    <div><label className="block font-semibold text-sm mb-2">الخدمة *</label><select name="serviceId" required defaultValue={selectedServiceId || ""} className={field}><option value="" disabled>اختر الخدمة</option>{services.map((service) => <option key={service.id} value={service.id}>{service.title}</option>)}</select>{state?.fieldErrors?.serviceId && <p className="text-xs text-rose-600 mt-1">{state.fieldErrors.serviceId[0]}</p>}</div>
    <div className="grid sm:grid-cols-2 gap-5"><div><label className="block font-semibold text-sm mb-2">الاسم *</label><input name="customerName" required className={field} /></div><div><label className="block font-semibold text-sm mb-2">الجوال *</label><input name="phone" required inputMode="tel" dir="ltr" className={field} /></div></div>
    <div className="grid sm:grid-cols-2 gap-5"><div><label className="block font-semibold text-sm mb-2">تاريخ المناسبة</label><input name="eventDate" type="date" className={field} /></div><div><label className="block font-semibold text-sm mb-2">المدينة *</label><input name="city" required className={field} /></div></div>
    <div className="grid sm:grid-cols-2 gap-5"><div><label className="block font-semibold text-sm mb-2">الموقع / القاعة</label><input name="location" className={field} /></div><div><label className="block font-semibold text-sm mb-2">عدد الضيوف التقريبي</label><input name="guestCount" inputMode="numeric" className={field} /></div></div>
    <div><label className="block font-semibold text-sm mb-2">ملاحظات</label><textarea name="notes" rows={4} className={field} /></div>
    <button type="submit" disabled={pending} className="w-full rounded-xl bg-secondary-600 hover:bg-secondary-700 text-white px-5 py-3 font-bold disabled:opacity-60 inline-flex justify-center items-center gap-2">{pending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}{pending ? "جاري الإرسال..." : "إرسال طلب الخدمة"}</button>
  </form>;
}
