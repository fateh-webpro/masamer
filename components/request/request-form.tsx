"use client";

import { useActionState, useState, useMemo } from "react";
import {
  CheckCircle2,
  Loader2,
  MessageCircle,
  Send,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Sparkles,
  Calendar,
  User,
} from "lucide-react";
import { createRequestAction } from "@/app/actions/request";
import { formatWhatsAppUrl } from "@/lib/utils";
import { ServiceIcon } from "@/components/shared/service-icon";

export type SubOptionType = {
  id: string;
  name: string;
  description?: string | null;
  sortOrder?: number;
};

export type ServiceOption = {
  id: string;
  title: string;
  slug: string;
  icon?: string;
  categoryId?: string | null;
  categoryName?: string | null;
  options?: SubOptionType[];
};

export type CategoryOption = {
  id: string;
  name: string;
};

export interface SelectedServiceItem {
  key: string;
  serviceId: string;
  serviceName: string;
  optionId?: string;
  optionName?: string;
  categoryName?: string;
  quantity: number;
}

interface RequestFormProps {
  services: ServiceOption[];
  categories?: CategoryOption[];
  selectedServiceId?: string;
  initialServiceSlug?: string;
  whatsapp: string;
}

export function RequestForm({
  services,
  selectedServiceId,
  initialServiceSlug,
  whatsapp,
}: RequestFormProps) {
  const [state, action, pending] = useActionState(createRequestAction, null);

  // Find initial service if opened from a specific service page or by ID
  const initialService = useMemo(() => {
    if (initialServiceSlug) {
      return services.find((s) => s.slug === initialServiceSlug) || null;
    }
    if (selectedServiceId) {
      return services.find((s) => s.id === selectedServiceId) || null;
    }
    return services[0] || null;
  }, [initialServiceSlug, selectedServiceId, services]);

  // Selected active main service tab
  const [activeServiceId, setActiveServiceId] = useState<string>(() => {
    return initialService?.id || services[0]?.id || "";
  });

  // Current active main service object
  const currentService = useMemo(() => {
    return services.find((s) => s.id === activeServiceId) || services[0] || null;
  }, [services, activeServiceId]);

  // Order items state across all main services
  const [selectedItems, setSelectedItems] = useState<SelectedServiceItem[]>(() => {
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

  const getItemQuantity = (serviceId: string, optionId?: string) => {
    const key = `${serviceId}-${optionId || "main"}`;
    const found = selectedItems.find((i) => i.key === key);
    return found ? found.quantity : 0;
  };

  const handleToggleOrAddOption = (service: ServiceOption, option?: SubOptionType) => {
    const key = `${service.id}-${option?.id || "main"}`;
    setSelectedItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.filter((i) => i.key !== key);
      }
      if (prev.length >= 50) {
        alert("الحد الأقصى لعدد العناصر في الطلب الواحد هو 50 عنصراً");
        return prev;
      }
      return [
        ...prev,
        {
          key,
          serviceId: service.id,
          serviceName: service.title,
          optionId: option?.id,
          optionName: option?.name,
          categoryName: service.categoryName || undefined,
          quantity: 1,
        },
      ];
    });
  };

  const handleIncreaseQty = (service: ServiceOption, option?: SubOptionType) => {
    const key = `${service.id}-${option?.id || "main"}`;
    setSelectedItems((prev) => {
      const idx = prev.findIndex((i) => i.key === key);
      if (idx !== -1) {
        if (prev[idx].quantity >= 1000) return prev;
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      if (prev.length >= 50) {
        alert("الحد الأقصى لعدد العناصر في الطلب الواحد هو 50 عنصراً");
        return prev;
      }
      return [
        ...prev,
        {
          key,
          serviceId: service.id,
          serviceName: service.title,
          optionId: option?.id,
          optionName: option?.name,
          categoryName: service.categoryName || undefined,
          quantity: 1,
        },
      ];
    });
  };

  const handleDecreaseQty = (key: string) => {
    setSelectedItems((prev) => {
      const idx = prev.findIndex((i) => i.key === key);
      if (idx === -1) return prev;
      if (prev[idx].quantity > 1) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity - 1 };
        return next;
      }
      return prev.filter((i) => i.key !== key);
    });
  };

  const handleRemoveItem = (key: string) => {
    setSelectedItems((prev) => prev.filter((i) => i.key !== key));
  };

  const getSelectedCountForService = (serviceId: string) => {
    return selectedItems.filter((i) => i.serviceId === serviceId).length;
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
      <input
        type="hidden"
        name="items"
        value={JSON.stringify(
          selectedItems.map((item) => ({
            serviceId: item.serviceId,
            optionId: item.optionId,
            serviceName: item.serviceName,
            optionName: item.optionName,
            categoryName: item.categoryName,
            quantity: item.quantity,
          }))
        )}
      />
      <input type="hidden" name="city" value={citySelect === "أخرى" ? customCity : citySelect} />
      {citySelect === "أخرى" && <input type="hidden" name="customCity" value={customCity} />}

      {/* Form Header */}
      <div className="border-b border-[#E8E3DE] pb-5">
        <h3 className="text-xl font-bold text-[#1F294A]">طلب خدمات وتجهيز المناسبات</h3>
        <p className="mt-1.5 text-sm leading-6 text-[#747986]">
          حدد الخدمات الرئيسية وخياراتها والكميات المطلوبة، وسيقوم فريق مسامر بالتنسيق المباشر معك.
        </p>
      </div>

      {state?.error && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {state.error}
        </div>
      )}

      {/* SECTION 1: Service Categories & Options Selection */}
      <div className="space-y-4 rounded-2xl bg-sand-50/60 p-4 sm:p-5 border border-sand-200/70">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-secondary-600" />
          <h4 className="font-bold text-[#1F294A] text-base">اختيار الخدمات والخيارات والكميات</h4>
        </div>

        {/* Main Services Navigation Tabs */}
        <div>
          <label className="mb-2 block text-xs font-semibold text-[#1F294A]">
            اختر الخدمة الرئيسية لتصفح خياراتها وتحديد الكمية:
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {services.map((svc) => {
              const isActive = svc.id === activeServiceId;
              const count = getSelectedCountForService(svc.id);
              return (
                <button
                  key={svc.id}
                  type="button"
                  onClick={() => setActiveServiceId(svc.id)}
                  className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                    isActive
                      ? "border-secondary-600 bg-white shadow-sm ring-2 ring-secondary-500/20 text-secondary-900"
                      : "border-sand-200/90 bg-white/70 hover:bg-white text-slate-700 hover:border-sand-300"
                  }`}
                >
                  {count > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1.5 rounded-full bg-secondary-700 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                      {count}
                    </span>
                  )}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center mb-1.5 ${
                      isActive ? "bg-sand-100 text-secondary-700" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <ServiceIcon name={svc.icon || "Coffee"} className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold leading-tight line-clamp-2">
                    {svc.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Service Sub-Options */}
        {currentService && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span>خيارات</span>
                <span className="text-secondary-700">({currentService.title})</span>:
              </h5>
              <span className="text-[11px] text-slate-500">
                حدد الخيارات واضبط الكمية بـ (+) و (-)
              </span>
            </div>

            {currentService.options && currentService.options.length > 0 ? (
              <div className="grid gap-2.5 sm:grid-cols-2">
                {currentService.options.map((opt) => {
                  const qty = getItemQuantity(currentService.id, opt.id);
                  const isSelected = qty > 0;
                  const key = `${currentService.id}-${opt.id}`;

                  return (
                    <div
                      key={opt.id}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        isSelected
                          ? "border-secondary-500 bg-white shadow-2xs ring-1 ring-secondary-400/20"
                          : "border-sand-200 bg-white/80 hover:bg-white hover:border-sand-300"
                      }`}
                    >
                      <div className="min-w-0 pr-1">
                        <p className={`text-xs font-bold ${isSelected ? "text-secondary-900" : "text-slate-800"}`}>
                          {opt.name}
                        </p>
                        {opt.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {opt.description}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 mr-3">
                        {isSelected ? (
                          <div className="inline-flex items-center gap-1 bg-sand-100 rounded-lg p-1 border border-sand-200">
                            <button
                              type="button"
                              onClick={() => handleDecreaseQty(key)}
                              className="w-6 h-6 rounded bg-white hover:bg-rose-50 hover:text-rose-600 text-slate-700 flex items-center justify-center font-bold text-xs transition-colors shadow-2xs"
                              aria-label={`تقليل كمية ${opt.name}`}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="min-w-7 text-center font-bold text-xs text-secondary-900">
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleIncreaseQty(currentService, opt)}
                              className="w-6 h-6 rounded bg-white hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 flex items-center justify-center font-bold text-xs transition-colors shadow-2xs"
                              aria-label={`زيادة كمية ${opt.name}`}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggleOrAddOption(currentService, opt)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-sand-300 bg-sand-50 hover:bg-secondary-600 hover:text-white hover:border-secondary-600 text-secondary-800 text-xs font-bold transition-all shadow-2xs"
                          >
                            <Plus className="w-3 h-3" />
                            <span>اختيار</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Fallback if no sub-options in DB yet */
              <div className="p-4 rounded-xl border border-sand-200 bg-white flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">{currentService.title}</p>
                  <p className="text-[11px] text-slate-500">طلب الخدمة الرئيسية مباشرة</p>
                </div>
                {(() => {
                  const qty = getItemQuantity(currentService.id);
                  const isSelected = qty > 0;
                  const key = `${currentService.id}-main`;
                  return isSelected ? (
                    <div className="inline-flex items-center gap-1 bg-sand-100 rounded-lg p-1 border border-sand-200">
                      <button
                        type="button"
                        onClick={() => handleDecreaseQty(key)}
                        className="w-6 h-6 rounded bg-white hover:bg-rose-50 hover:text-rose-600 text-slate-700 flex items-center justify-center font-bold text-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="min-w-7 text-center font-bold text-xs text-secondary-900">{qty}</span>
                      <button
                        type="button"
                        onClick={() => handleIncreaseQty(currentService)}
                        className="w-6 h-6 rounded bg-white hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 flex items-center justify-center font-bold text-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleToggleOrAddOption(currentService)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-sand-300 bg-sand-50 hover:bg-secondary-600 hover:text-white hover:border-secondary-600 text-secondary-800 text-xs font-bold"
                    >
                      <Plus className="w-3 h-3" />
                      <span>اختيار</span>
                    </button>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* Selected Services Summary Box */}
        {selectedItems.length > 0 && (
          <div className="space-y-2.5 pt-3 border-t border-sand-200/80">
            <div className="flex items-center justify-between text-xs font-semibold text-[#1F294A]">
              <span>الخيارات المختارة في هذا الطلب:</span>
              <span className="text-secondary-700 bg-sand-100 px-2.5 py-0.5 rounded-full border border-sand-200 font-bold">
                {totalItemsCount} عناصر • إجمالي الكميات: {totalQuantitySum}
              </span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-0.5">
              {selectedItems.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white border border-[#E8E3DE] shadow-2xs"
                >
                  <div className="min-w-0 pr-1">
                    <p className="text-xs font-bold text-[#1F294A] truncate">{item.serviceName}</p>
                    {item.optionName ? (
                      <span className="inline-block mt-0.5 text-[11px] font-bold text-secondary-800 bg-sand-100 px-2 py-0.5 rounded border border-sand-200">
                        {item.optionName}
                      </span>
                    ) : (
                      item.categoryName && (
                        <span className="text-[11px] text-slate-500 block">{item.categoryName}</span>
                      )
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 mr-2">
                    <div className="inline-flex items-center gap-1 bg-slate-50 rounded-lg p-0.5 border border-slate-200">
                      <button
                        type="button"
                        onClick={() => handleDecreaseQty(item.key)}
                        className="w-5 h-5 rounded bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs"
                        title="إنقاص الكمية"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="min-w-6 text-center text-xs font-bold text-secondary-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const svc = services.find((s) => s.id === item.serviceId);
                          if (svc) {
                            const opt = svc.options?.find((o) => o.id === item.optionId);
                            handleIncreaseQty(svc, opt);
                          }
                        }}
                        className="w-5 h-5 rounded bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs"
                        title="زيادة الكمية"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.key)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                      title="إزالة الخيار"
                      aria-label={`إزالة ${item.optionName || item.serviceName}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
