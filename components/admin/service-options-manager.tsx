"use client";

import React, { useState, useTransition } from "react";
import { Plus, Edit2, Trash2, Power, Check, X, Loader2, Sparkles, AlertCircle } from "lucide-react";
import type { ServiceOptionItem } from "@/lib/services/service-dal";
import {
  createServiceOptionAction,
  updateServiceOptionAction,
  toggleServiceOptionStatusAction,
  deleteServiceOptionAction,
} from "@/app/admin/services/options/actions";
import { Button } from "@/components/ui/button";

interface ServiceOptionsManagerProps {
  serviceId: string;
  serviceTitle: string;
  initialOptions: ServiceOptionItem[];
}

export function ServiceOptionsManager({
  serviceId,
  serviceTitle,
  initialOptions,
}: ServiceOptionsManagerProps) {
  const [options, setOptions] = useState<ServiceOptionItem[]>(initialOptions);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // New option form state
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newSortOrder, setNewSortOrder] = useState<number>(options.length + 1);

  // Edit option modal/inline state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editSortOrder, setEditSortOrder] = useState<number>(0);
  const [editIsActive, setEditIsActive] = useState<boolean>(true);

  const startEdit = (opt: ServiceOptionItem) => {
    setEditingId(opt.id);
    setEditName(opt.name);
    setEditDesc(opt.description || "");
    setEditSortOrder(opt.sortOrder);
    setEditIsActive(opt.isActive);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newName.trim();
    if (!trimmedName) {
      setMessage({ text: "يرجى إدخال اسم الخيار الفرعي أولاً", type: "error" });
      return;
    }

    startTransition(async () => {
      setMessage(null);
      const fd = new FormData();
      fd.set("serviceId", serviceId);
      fd.set("name", trimmedName);
      fd.set("description", newDesc.trim());
      fd.set("isActive", "true");
      fd.set("sortOrder", String(newSortOrder));

      const res = await createServiceOptionAction(null, fd);
      if (!res.success || !res.option) {
        setMessage({ text: res.error || "تعذر إضافة الخيار الفرعي، يرجى المحاولة لاحقاً", type: "error" });
      } else {
        setMessage({ text: res.message || "تمت إضافة الخيار الفرعي بنجاح", type: "success" });
        setNewName("");
        setNewDesc("");
        setIsAdding(false);
        // Add option with real database ID from server
        const createdOption: ServiceOptionItem = {
          id: res.option.id,
          serviceId: res.option.serviceId,
          name: res.option.name,
          description: res.option.description,
          isActive: res.option.isActive,
          sortOrder: res.option.sortOrder,
          createdAt: new Date(res.option.createdAt),
          updatedAt: new Date(res.option.updatedAt),
        };
        setOptions((prev) => [...prev, createdOption].sort((a, b) => a.sortOrder - b.sortOrder));
      }
    });
  };

  const handleUpdate = (id: string) => {
    const trimmedName = editName.trim();
    if (!trimmedName) {
      setMessage({ text: "يرجى إدخال اسم الخيار الفرعي", type: "error" });
      return;
    }

    startTransition(async () => {
      setMessage(null);
      const fd = new FormData();
      fd.set("name", trimmedName);
      fd.set("description", editDesc.trim());
      fd.set("sortOrder", String(editSortOrder));
      fd.set("isActive", editIsActive ? "true" : "false");

      const res = await updateServiceOptionAction(id, null, fd);
      if (!res.success) {
        setMessage({ text: res.error || "تعذر تحديث الخيار الفرعي", type: "error" });
      } else {
        setMessage({ text: res.message || "تم تحديث الخيار الفرعي بنجاح", type: "success" });
        setEditingId(null);
        setOptions((prev) =>
          prev
            .map((o) =>
              o.id === id
                ? {
                    ...o,
                    name: trimmedName,
                    description: editDesc.trim() || null,
                    sortOrder: editSortOrder,
                    isActive: editIsActive,
                  }
                : o
            )
            .sort((a, b) => a.sortOrder - b.sortOrder)
        );
      }
    });
  };

  const handleToggle = (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      setMessage(null);
      const res = await toggleServiceOptionStatusAction(id, currentStatus);
      if (!res.success) {
        setMessage({ text: res.error || "تعذر تغيير حالة الخيار", type: "error" });
      } else {
        setMessage({ text: res.message || "تم تعديل حالة الخيار بنجاح", type: "success" });
        setOptions((prev) =>
          prev.map((o) => (o.id === id ? { ...o, isActive: !currentStatus } : o))
        );
      }
    });
  };

  const handleDeleteOrDeactivate = (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف أو تعطيل الخيار "${name}"؟ (سيتم التعطيل الآمن في حال وجود طلبات سابقة مرتبطة به للحفاظ على السجلات)`)) {
      return;
    }

    startTransition(async () => {
      setMessage(null);
      const res = await deleteServiceOptionAction(id);
      if (!res.success) {
        // Actual failure: do not mutate local options
        setMessage({ text: res.error || "تعذر معالجة حذف الخيار الفرعي", type: "error" });
        return;
      }

      if (res.action === "deactivated") {
        // Safely deactivated
        setMessage({ text: res.message || "تم تعطيل الخيار بنجاح للحفاظ على سجلات الطلبات", type: "success" });
        setOptions((prev) =>
          prev.map((o) => (o.id === id ? { ...o, isActive: false } : o))
        );
      } else {
        // Hard deleted
        setMessage({ text: res.message || "تم إزالة الخيار بنجاح", type: "success" });
        setOptions((prev) => prev.filter((o) => o.id !== id));
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-secondary-600" />
            <span>الخيارات الفرعية للخدمة</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            إدارة العناصر والخيارات التابعة لـ ({serviceTitle}) والتي تظهر للعملاء في نموذج الطلب لتحديد الكميات.
          </p>
        </div>

        {!isAdding && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              setIsAdding(true);
              setNewSortOrder(options.length + 1);
            }}
            className="gap-1.5 text-xs font-bold shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة خيار فرعي</span>
          </Button>
        )}
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2.5 ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {message.type === "success" ? (
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Add new option form inline */}
      {isAdding && (
        <form
          onSubmit={handleCreate}
          className="rounded-2xl border border-sand-300 bg-sand-50/70 p-4 sm:p-5 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-sand-200 pb-2">
            <h3 className="text-xs font-bold text-slate-900">إضافة خيار فرعي جديد</h3>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setMessage(null);
              }}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-12">
            <div className="sm:col-span-6">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                اسم الخيار <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="مثال: قهوجيون، صبابات، خيام أندلسية..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-(--secondary)/20 focus:border-(--secondary)"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                وصف موجز (اختياري)
              </label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="مواصفات أو إيضاح للخيار..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-(--secondary)/20 focus:border-(--secondary)"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ترتيب العرض
              </label>
              <input
                type="number"
                value={newSortOrder}
                onChange={(e) => setNewSortOrder(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 text-center font-bold focus:outline-none focus:ring-2 focus:ring-(--secondary)/20 focus:border-(--secondary)"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-sand-200/80">
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setMessage(null);
              }}
              disabled={isPending}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-(--secondary) hover:bg-(--secondary-light) text-white text-xs font-bold shadow-sm transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>جاري الإضافة...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>إضافة الخيار الفرعي</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Options Table */}
      {options.length === 0 ? (
        <div className="text-center py-8 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
          <p className="text-xs text-slate-500 font-medium">
            لا توجد خيارات فرعية مسجلة لهذه الخدمة حالياً. اضغط على زر "إضافة خيار فرعي" لإضافة خيارات نموذج الطلب.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-right text-xs min-w-[640px]">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">اسم الخيار الفرعي</th>
                <th className="p-3">الوصف</th>
                <th className="p-3 text-center">الترتيب</th>
                <th className="p-3 text-center">الحالة</th>
                <th className="p-3 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {options.map((opt, idx) => {
                const isEditing = editingId === opt.id;
                return (
                  <tr
                    key={opt.id}
                    className={`transition-colors ${
                      opt.isActive ? "hover:bg-slate-50/80" : "bg-slate-50/60 opacity-80"
                    }`}
                  >
                    <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                    <td className="p-3">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-2 py-1 rounded border border-(--secondary) text-xs bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-(--secondary)"
                        />
                      ) : (
                        <span className="font-bold text-slate-900">{opt.name}</span>
                      )}
                    </td>
                    <td className="p-3 text-slate-500">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          className="w-full px-2 py-1 rounded border border-slate-300 text-xs bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-(--secondary)"
                        />
                      ) : (
                        opt.description || "—"
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editSortOrder}
                          onChange={(e) => setEditSortOrder(parseInt(e.target.value, 10) || 0)}
                          className="w-16 px-1.5 py-1 rounded border border-slate-300 text-xs text-center font-bold bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-(--secondary)"
                        />
                      ) : (
                        <span className="font-bold text-slate-700">{opt.sortOrder}</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {isEditing ? (
                        <label className="inline-flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editIsActive}
                            onChange={(e) => setEditIsActive(e.target.checked)}
                          />
                          <span className="text-[11px]">{editIsActive ? "نشط" : "معطل"}</span>
                        </label>
                      ) : opt.isActive ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          نشط
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                          معطل
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => handleUpdate(opt.id)}
                            disabled={isPending}
                            className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                            title="حفظ التعديلات"
                          >
                            {isPending ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                            <span>حفظ التعديلات</span>
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            disabled={isPending}
                            className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors disabled:opacity-50"
                            title="إلغاء التعديل"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>إلغاء</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => startEdit(opt)}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                            title="تعديل الخيار"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggle(opt.id, opt.isActive)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              opt.isActive
                                ? "text-emerald-600 hover:bg-emerald-50"
                                : "text-slate-400 hover:bg-slate-100"
                            }`}
                            title={opt.isActive ? "تعطيل الخيار" : "تفعيل الخيار"}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteOrDeactivate(opt.id, opt.name)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                            title="تعطيل / حذف آمن"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
