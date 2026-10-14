"use client";

import { useActionState, useState, useMemo, useEffect } from "react";
import {
  CheckCircle2,
  Loader2,
  MessageCircle,
  Send,
  Plus,
  Trash2,
  ShoppingBag,
  Layers,
  Sparkles,
  MapPin,
  Calendar,
  User,
  Phone,
  FileText,
} from "lucide-react";
import { createRequestAction } from "@/app/actions/request";
import { formatWhatsAppUrl } from "@/lib/utils";

export type ServiceOption = {
  id: string;
  title: string;
  slug: string;
  categoryId?: string | null;
  categoryName?: string | null;
};

export type CategoryOption = {
  id: string;
  name: string;
};

export interface SelectedServiceItem {
  key: string;
  serviceId?: string;
  serviceName: string;
  categoryName?: string;
  quantity: number;
}

interface RequestFormProps {
  services: ServiceOption[];
  categories?: CategoryOption[];
  selectedServiceId?: string;
  whatsapp: string;
}

const DEFAULT_CATEGORIES: CategoryOption[] = [
  { id: "hospitality", name: "خدمات الضيافة البشرية" },
  { id: "tents", name: "الخيام وبيوت الشعر" },
  { id: "furniture", name: "الأثاث والجلسات" },
  { id: "decor", name: "ديكورات وتنسيق المناسبات" },
];

export function RequestForm({
  services,
  categories = DEFAULT_CATEGORIES,
  selectedServiceId,
  whatsapp,
}: RequestFormProps) {
  const [state, action, pending] = useActionState(createRequestAction, null);

  // Available categories list
  const activeCategories = useMemo(() => {
    if (categories && categories.length > 0) return categories;
    return DEFAULT_CATEGORIES;
  }, [categories]);

  // Find initial service if opened from a specific service page
  const initialService = useMemo(() => {
    if (!selectedServiceId) return null;
    return services.find((s) => s.id === selectedServiceId) || null;
  }, [selectedServiceId, services]);

  // Selected Category filter in selector
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(() => {
    if (initialService?.categoryId) return initialService.categoryId;
    return activeCategories[0]?.id || "";
  });

  // Services available for currently selected category
  const filteredServices = useMemo(() => {
    if (!selectedCategoryId) return services;
    const matching = services.filter((s) => s.categoryId === selectedCategoryId);
    // If no services explicitly matched this category, show all so user can always pick
    return matching.length > 0 ? matching : services;
  }, [selectedCategoryId, services]);

  // Currently picked sub-service in dropdown
  const [pickedServiceId, setPickedServiceId] = useState<string>(() => {
    if (initialService) return initialService.id;
    return filteredServices[0]?.id || "";
  });

  // Keep picked service in sync when category changes
  useEffect(() => {
    if (filteredServices.length > 0 && !filteredServices.some((s) => s.id === pickedServiceId)) {
      setPickedServiceId(filteredServices[0].id);
    }
  }, [filteredServices, pickedServiceId]);

  // Quantity input for the service being added
  const [itemQuantity, setItemQuantity] = useState<number>(1);

  // Order items state
  const [selectedItems, setSelectedItems] = useState<SelectedServiceItem[]>(() => {
    if (initialService) {
      return [
        {
          key: `${initialService.id}-${Date.now()}`,
          serviceId: initialService.id,
          serviceName: initialService.title,
          categoryName: initialService.categoryName || activeCategories.find((c) => c.id === initialService.categoryId)?.name || undefined,
          quantity: 1,
        },
      ];
    }
    return [];
  });

  // Custom request text
  const [customRequest, setCustomRequest] = useState<string>("");

  // City selection: Riyadh, Jeddah, Dammam, or other
  const [citySelect, setCitySelect] = useState<string>("الرياض");
  const [customCity, setCustomCity] = useState<string>("");

  // Min selectable date (today in local format YYYY-MM-DD)
  const todayString = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  // Handler to add chosen service to the order
  const handleAddService = () => {
    const serviceToAdd = services.find((s) => s.id === pickedServiceId);
    if (!serviceToAdd) return;

    const qty = Math.max(1, Math.floor(itemQuantity || 1));
    const currentCategory = activeCategories.find((c) => c.id === selectedCategoryId);

    setSelectedItems((prev) => {
      // Check if already in order
      const existingIdx = prev.findIndex((item) => item.serviceId === serviceToAdd.id);
      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + qty,
        };
        return updated;
      }
      return [
        ...prev,
        {
          key: `${serviceToAdd.id}-${Date.now()}`,
          serviceId: serviceToAdd.id,
          serviceName: serviceToAdd.title,
          categoryName: serviceToAdd.categoryName || currentCategory?.name || undefined,
          quantity: qty,
        },
      ];
    });

    // Reset quantity input to 1
    setItemQuantity(1);
  };

  // Handler to remove a service item
  const handleRemoveItem = (keyToRemove: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.key !== keyToRemove));
  };

  // Order totals
  const totalItemsCount = selectedItems.length;
  const totalQuantitySum = selectedItems.reduce((acc, curr) => acc + curr.quantity, 0);

  // Success view
  if (state?.success) {
    const url = formatWhatsAppUrl(
      whatsapp,
      `مرحبًا مسامر، أود متابعة طلب الخدمة رقم (${state.success.reference}) - تفاصيل الطلب: ${state.success.serviceTitle}.`
    );
    return (
      <div className="rounded-3xl bg-white border border-emerald-200 p-8 text-center shadow-sm">
        <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-primary-950">تم استلام طلبك بنجاح</h2>
        <p className="text-slate-600 mt-2 font-medium">الخدمات: {state.success.serviceTitle}</p>
        <p className="font-mono text-xl font-bold mt-3 text-secondary-800" dir="ltr">
          {state.success.reference}
        </p>
        <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto">
          تم توثيق كافة تفاصيل مناسبتك، وسيتواصل معك منسق مسامر لتأكيد الحجز.
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 font-bold transition-colors shadow-sm"
        >
          <MessageCircle className="w-5 h-5" />
          <span>المتابعة الفورية عبر واتساب</span>
        </a>
      </div>
    );
  }

  const field =
    "h-12 w-full rounded-xl border border-[#E8E3DE] bg-white px-4 text-sm text-[#252A35] outline-none transition-colors placeholder:text-[#747986]/70 focus:border-[#C2704B] focus:ring-2 focus:ring-[#C2704B]/15";
  const optional = <span className="text-xs font-normal text-[#747986]">اختياري</span>;
  const fieldError = (name: string) =>
    state?.fieldErrors?.[name]?.[0] ? (
      <p className="mt-1.5 text-xs text-rose-600 font-medium">{state.fieldErrors[name][0]}</p>
    ) : null;

  const isOrderEmpty = selectedItems.length === 0 && !customRequest.trim();

  return (
    <form action={action} className="space-y-6 rounded-3xl border border-[#E8E3DE] bg-white p-5 shadow-sm sm:p-7">
      {/* Hidden inputs to pass structured data */}
      <input type="hidden" name="items" value={JSON.stringify(selectedItems)} />
      <input type="hidden" name="city" value={citySelect === "أخرى" ? customCity : citySelect} />
      {citySelect === "أخرى" && <input type="hidden" name="customCity" value={customCity} />}

      {/* Form Header */}
      <div className="border-b border-[#E8E3DE] pb-5">
        <h3 className="text-xl font-bold text-[#1F294A]">طلب خدمات وتجهيز المناسبات</h3>
        <p className="mt-1.5 text-sm leading-6 text-[#747986]">
          حدد الخدمات المطلوبة والكميات وسيقوم فريق مسامر بالتنسيق المباشر معك.
        </p>
      </div>

      {state?.error && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {state.error}
        </div>
      )}

      {/* SECTION 1: Service Categories & Items Selection */}
      <div className="space-y-4 rounded-2xl bg-sand-50/60 p-4 sm:p-5 border border-sand-200/70">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-secondary-600" />
          <h4 className="font-bold text-[#1F294A] text-base">اختيار الخدمات والكميات</h4>
        </div>

        {/* Categories & Services Grid */}
        <div className="grid gap-4 sm:grid-cols-12">
          {/* Main Category */}
          <div className="sm:col-span-5">
            <label htmlFor="request-category" className="mb-1.5 block text-xs font-semibold text-[#1F294A]">
              الفئة الرئيسية
            </label>
            <select
              id="request-category"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className={field}
            >
              {activeCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sub Service */}
          <div className="sm:col-span-5">
            <label htmlFor="request-subservice" className="mb-1.5 block text-xs font-semibold text-[#1F294A]">
              الخدمة الفرعية
            </label>
            <select
              id="request-subservice"
              value={pickedServiceId}
              onChange={(e) => setPickedServiceId(e.target.value)}
              className={field}
            >
              {filteredServices.length === 0 ? (
                <option value="" disabled>لا توجد خدمات متاحة</option>
              ) : (
                filteredServices.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.title}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Quantity */}
          <div className="sm:col-span-2">
            <label htmlFor="request-quantity" className="mb-1.5 block text-xs font-semibold text-[#1F294A]">
              الكمية
            </label>
            <input
              id="request-quantity"
              type="number"
              min={1}
              value={itemQuantity}
              onChange={(e) => setItemQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className={`${field} text-center font-bold`}
            />
          </div>
        </div>

        {/* Add Service Button */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={handleAddService}
            disabled={!pickedServiceId}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary-900 hover:bg-primary-950 text-white px-4 py-2.5 text-xs font-bold transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة الخدمة إلى الطلب</span>
          </button>
        </div>

        {/* Selected Services Summary Box */}
        {selectedItems.length > 0 && (
          <div className="space-y-2.5 pt-3 border-t border-sand-200/80">
            <div className="flex items-center justify-between text-xs font-semibold text-[#1F294A]">
              <span>الخدمات المختارة في هذا الطلب:</span>
              <span className="text-secondary-700 bg-sand-100 px-2.5 py-0.5 rounded-full border border-sand-200">
                {totalItemsCount} خدمات | إجمالي الكميات: {totalQuantitySum}
              </span>
            </div>

            <div className="space-y-2">
              {selectedItems.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white border border-[#E8E3DE] shadow-2xs"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#1F294A] truncate">{item.serviceName}</p>
                    {item.categoryName && (
                      <span className="text-[11px] text-slate-500 block">{item.categoryName}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="px-2.5 py-1 rounded-lg bg-sand-100 text-secondary-800 text-xs font-bold border border-sand-200">
                      الكمية: {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.key)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                      title="حذف الخدمة من الطلب"
                      aria-label={`حذف ${item.serviceName}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {fieldError("items")}

        {/* Special Request Input */}
        <div className="pt-2">
          <label
            htmlFor="request-custom"
            className="mb-1.5 flex items-center justify-between text-xs font-semibold text-[#1F294A]"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-secondary-600" />
              <span>طلب خاص أو خدمات غير مدرجة في القائمة</span>
            </span>
            {optional}
          </label>
          <textarea
            id="request-custom"
            name="customRequest"
            rows={2}
            value={customRequest}
            onChange={(e) => setCustomRequest(e.target.value)}
            placeholder="اكتب أي خدمة خاصة، متطلبات ضيافة إضافية، أو تفاصيل تحتاجها ولم تجدها أعلاه..."
            className={`${field} h-auto min-h-20 resize-y py-2.5 text-xs`}
          />
          {fieldError("customRequest")}
        </div>
      </div>

      {/* SECTION 2: Customer Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-secondary-600" />
          <h4 className="font-bold text-[#1F294A] text-sm">بيانات العميل للتواصل</h4>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="request-name" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#1F294A]">
              الاسم الكريم <span className="text-[#C2704B]" aria-hidden="true">*</span>
            </label>
            <input
              id="request-name"
              name="customerName"
              required
              autoComplete="name"
              placeholder="اكتب الاسم الكريم"
              className={field}
            />
            {fieldError("customerName")}
          </div>

          <div>
            <label htmlFor="request-phone" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#1F294A]">
              رقم التواصل <span className="text-[#C2704B]" aria-hidden="true">*</span>
            </label>
            <input
              id="request-phone"
              name="phone"
              required
              inputMode="tel"
              autoComplete="tel"
              dir="ltr"
              placeholder="05xxxxxxxx"
              className={field}
            />
            {fieldError("phone")}
          </div>
        </div>
      </div>

      {/* SECTION 3: Event Details */}
      <div className="space-y-4 border-t border-[#E8E3DE] pt-5">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-secondary-600" />
          <h4 className="font-bold text-[#1F294A] text-sm">تفاصيل وموقع المناسبة</h4>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Event Date (Mandatory & Reject Past) */}
          <div>
            <label htmlFor="request-date" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#1F294A]">
              تاريخ المناسبة <span className="text-[#C2704B]" aria-hidden="true">*</span>
            </label>
            <input
              id="request-date"
              name="eventDate"
              type="date"
              required
              min={todayString}
              className={field}
            />
            {fieldError("eventDate")}
          </div>

          {/* City Selection (Mandatory: Riyadh, Jeddah, Dammam, Other) */}
          <div>
            <label htmlFor="request-city-select" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#1F294A]">
              المدينة <span className="text-[#C2704B]" aria-hidden="true">*</span>
            </label>
            <select
              id="request-city-select"
              value={citySelect}
              onChange={(e) => setCitySelect(e.target.value)}
              className={field}
            >
              <option value="الرياض">الرياض</option>
              <option value="جدة">جدة</option>
              <option value="الدمام">الدمام</option>
              <option value="أخرى">أخرى (إدخال اسم المدينة)</option>
            </select>
            {fieldError("city")}
          </div>
        </div>

        {/* Custom City input if "أخرى" selected */}
        {citySelect === "أخرى" && (
          <div>
            <label htmlFor="request-custom-city" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#1F294A]">
              اسم المدينة <span className="text-[#C2704B]" aria-hidden="true">*</span>
            </label>
            <input
              id="request-custom-city"
              value={customCity}
              onChange={(e) => setCustomCity(e.target.value)}
              required
              placeholder="اكتب اسم مدينتك (مثال: مكة المكرمة، الخبر، القصيم...)"
              className={field}
            />
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          {/* District (Optional) */}
          <div>
            <label htmlFor="request-district" className="mb-1.5 flex items-center justify-between text-xs font-semibold text-[#1F294A]">
              <span>الحي</span>
              {optional}
            </label>
            <input
              id="request-district"
              name="district"
              placeholder="اسم الحي (مثال: حطين، النرجس...)"
              className={field}
            />
            {fieldError("district")}
          </div>

          {/* Location / Venue (Optional) */}
          <div>
            <label htmlFor="request-location" className="mb-1.5 flex items-center justify-between text-xs font-semibold text-[#1F294A]">
              <span>الموقع / القاعة</span>
              {optional}
            </label>
            <input
              id="request-location"
              name="location"
              placeholder="اسم القاعة أو الاستراحة"
              className={field}
            />
            {fieldError("location")}
          </div>

          {/* Guest Count (Optional) */}
          <div>
            <label htmlFor="request-guests" className="mb-1.5 flex items-center justify-between text-xs font-semibold text-[#1F294A]">
              <span>عدد الضيوف التقريبي</span>
              {optional}
            </label>
            <input
              id="request-guests"
              name="guestCount"
              inputMode="numeric"
              placeholder="مثال: 150"
              className={field}
            />
            {fieldError("guestCount")}
          </div>
        </div>

        {/* Notes (Optional) */}
        <div>
          <label htmlFor="request-notes" className="mb-1.5 flex items-center justify-between text-xs font-semibold text-[#1F294A]">
            <span>ملاحظات إضافية</span>
            {optional}
          </label>
          <textarea
            id="request-notes"
            name="notes"
            rows={3}
            placeholder="وقت التجهيز، بوابة الوصول، أو أي ترتيبات خاصة ترغب بتوضيحها..."
            className={`${field} h-auto min-h-24 resize-y py-3 text-xs`}
          />
          {fieldError("notes")}
        </div>
      </div>

      {/* Submit Action */}
      <div className="space-y-3 border-t border-[#E8E3DE] pt-5 pb-1">
        <button
          type="submit"
          disabled={pending || isOrderEmpty}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-(--secondary) px-5 font-bold text-white shadow-sm transition-colors hover:bg-(--secondary-light) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2704B] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          ) : (
            <Send className="h-5 w-5" aria-hidden="true" />
          )}
          {pending ? "جاري الإرسال وتوثيق الطلب..." : "إرسال طلب الخدمة"}
        </button>

        {isOrderEmpty && (
          <p className="text-center text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
            يرجى إضافة خدمة واحدة على الأقل أو كتابة طلب خاص قبل إرسال النموذج.
          </p>
        )}

        <p className="text-center text-xs leading-5 text-[#747986]">
          إرسال الطلب مخصص للتنسيق مع فريق مسامر، ولا يتضمن أي دفع إلكتروني مسبق.
        </p>
      </div>
    </form>
  );
}
