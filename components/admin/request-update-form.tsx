"use client";
import { useActionState } from "react";
import { REQUEST_STATUSES, REQUEST_STATUS_PRESENTATION } from "@/lib/constants/request";
import { updateRequestAction } from "@/app/admin/requests/actions";
export function RequestUpdateForm({ id, status, adminNotes }: { id: string; status: string; adminNotes: string | null }) {
  const [state, action, pending] = useActionState(updateRequestAction.bind(null, id), null);
  return <form action={action} className="space-y-4 rounded-2xl bg-white border border-slate-200 p-6"><h2 className="font-bold text-lg">تحديث الطلب</h2>{state?.error && <p className="text-rose-600 text-sm">{state.error}</p>}{state?.success && <p className="text-emerald-600 text-sm">تم حفظ التحديث.</p>}<div><label className="text-sm font-semibold block mb-2">الحالة</label><select name="status" defaultValue={status} className="w-full rounded-xl border border-slate-200 p-3">{REQUEST_STATUSES.map((value) => <option key={value} value={value}>{REQUEST_STATUS_PRESENTATION[value].label}</option>)}</select></div><div><label className="text-sm font-semibold block mb-2">ملاحظات الإدارة</label><textarea name="adminNotes" defaultValue={adminNotes || ""} rows={6} className="w-full rounded-xl border border-slate-200 p-3" /></div><button disabled={pending} className="w-full rounded-xl bg-secondary-600 text-white py-3 font-bold disabled:opacity-60">{pending ? "جاري الحفظ..." : "حفظ التحديث"}</button></form>;
}
