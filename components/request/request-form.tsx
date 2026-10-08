"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2, MessageCircle, Send } from "lucide-react";
import { createRequestAction } from "@/app/actions/request";
import { formatWhatsAppUrl } from "@/lib/utils";

type ServiceOption = { id: string; title: string; slug: string };
export function RequestForm({ services, selectedServiceId, whatsapp }: { services: ServiceOption[]; selectedServiceId?: string; whatsapp: string }) {
  const [state, action, pending] = useActionState(createRequestAction, null);
  if (state?.success) {
    const url = formatWhatsAppUrl(whatsapp, `مرحبًا مسامر، أود متابعة طلب ${state.success.reference} لخدمة ${state.success.serviceTitle}.`);
    return <div className="rounded-3xl bg-white border border-emerald-200 p-8 text-center shadow-sm"><CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto mb-4" /><h2 className="text-2xl font-bold text-primary-950">تم استلام طلبك بنجاح</h2><p className="text-slate-600 mt-2">الخدمة: {state.success.serviceTitle}</p><p className="font-mono text-lg font-bold mt-3" dir="ltr">{state.success.reference}</p><a href={url} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 text-white px-5 py-3 font-bold"><MessageCircle className="w-5 h-5" /> المتابعة عبر واتساب</a></div>;
  }
  const field = "h-12 w-full rounded-xl border border-[#E8E3DE] bg-white px-4 text-sm text-[#252A35] outline-none transition-colors placeholder:text-[#747986]/70 focus:border-[#C2704B] focus:ring-2 focus:ring-[#C2704B]/15";
  const optional = <span className="text-xs font-normal text-[#747986]">اختياري</span>;
  const fieldError = (name: string) => state?.fieldErrors?.[name]?.[0] ? <p className="mt-1.5 text-xs text-rose-600">{state.fieldErrors[name][0]}</p> : null;

  return <form action={action} className="space-y-6 rounded-3xl border border-[#E8E3DE] bg-white p-5 shadow-sm sm:p-7">
    <div className="border-b border-[#E8E3DE] pb-5">
      <h3 className="text-xl font-bold text-[#1F294A]">بيانات المناسبة</h3>
      <p className="mt-1.5 text-sm leading-6 text-[#747986]">ساعدنا بهذه التفاصيل لنجهز الخدمة الأنسب لمناسبتك.</p>
    </div>

    {state?.error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{state.error}</div>}

    <div className="space-y-5">
      <div>
        <label htmlFor="request-service" className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-[#1F294A]">الخدمة <span className="text-[#C2704B]" aria-hidden="true">*</span></label>
        <select id="request-service" name="serviceId" required defaultValue={selectedServiceId || ""} className={field}><option value="" disabled>اختر الخدمة</option>{services.map((service) => <option key={service.id} value={service.id}>{service.title}</option>)}</select>
        {fieldError("serviceId")}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="request-name" className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-[#1F294A]">الاسم الكريم <span className="text-[#C2704B]" aria-hidden="true">*</span></label>
          <input id="request-name" name="customerName" required autoComplete="name" placeholder="اكتب الاسم الكريم" className={field} />
          {fieldError("customerName")}
        </div>
        <div>
          <label htmlFor="request-phone" className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-[#1F294A]">رقم التواصل <span className="text-[#C2704B]" aria-hidden="true">*</span></label>
          <input id="request-phone" name="phone" required inputMode="tel" autoComplete="tel" dir="ltr" placeholder="05xxxxxxxx" className={field} />
          {fieldError("phone")}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="request-date" className="mb-2 flex items-center justify-between gap-2 text-sm font-semibold text-[#1F294A]"><span>تاريخ المناسبة</span>{optional}</label>
          <input id="request-date" name="eventDate" type="date" className={field} />
          {fieldError("eventDate")}
        </div>
        <div>
          <label htmlFor="request-city" className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-[#1F294A]">المدينة <span className="text-[#C2704B]" aria-hidden="true">*</span></label>
          <input id="request-city" name="city" required autoComplete="address-level2" placeholder="مثال: الرياض" className={field} />
          {fieldError("city")}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="request-location" className="mb-2 flex items-center justify-between gap-2 text-sm font-semibold text-[#1F294A]"><span>الموقع / القاعة</span>{optional}</label>
          <input id="request-location" name="location" placeholder="اسم القاعة أو موقع المناسبة" className={field} />
          {fieldError("location")}
        </div>
        <div>
          <label htmlFor="request-guests" className="mb-2 flex items-center justify-between gap-2 text-sm font-semibold text-[#1F294A]"><span>عدد الضيوف التقريبي</span>{optional}</label>
          <input id="request-guests" name="guestCount" inputMode="numeric" placeholder="مثال: 150" className={field} />
          {fieldError("guestCount")}
        </div>
      </div>
    </div>

    <div className="border-t border-[#E8E3DE] pt-5">
      <label htmlFor="request-notes" className="mb-2 flex items-center justify-between gap-2 text-sm font-semibold text-[#1F294A]"><span>ملاحظات</span>{optional}</label>
      <textarea id="request-notes" name="notes" rows={4} placeholder="بوابة الدخول، وقت الوصول، أو أي تفصيل مهم..." className={`${field} h-auto min-h-28 resize-y py-3`} />
      {fieldError("notes")}
    </div>

    <div className="space-y-3 border-t border-[#E8E3DE] pt-5 pb-1">
      <button type="submit" disabled={pending} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-(--secondary) px-5 font-bold text-white shadow-sm transition-colors hover:bg-(--secondary-light) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2704B] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">{pending ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Send className="h-5 w-5" aria-hidden="true" />}{pending ? "جاري الإرسال..." : "إرسال طلب الخدمة"}</button>
      <p className="text-center text-xs leading-5 text-[#747986]">إرسال الطلب مخصص للتنسيق مع فريق مسامر ولا يتضمن دفعًا إلكترونيًا.</p>
    </div>
  </form>;
}
