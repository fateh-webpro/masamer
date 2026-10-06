export const REQUEST_STATUSES = ["new", "contacted", "confirmed", "completed", "cancelled"] as const;

export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const REQUEST_STATUS_PRESENTATION: Record<RequestStatus, { label: string; className: string }> = {
  new: { label: "جديد", className: "bg-blue-50 text-blue-700 border-blue-200" },
  contacted: { label: "تم التواصل", className: "bg-amber-50 text-amber-700 border-amber-200" },
  confirmed: { label: "مؤكد", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  completed: { label: "مكتمل", className: "bg-slate-100 text-slate-700 border-slate-200" },
  cancelled: { label: "ملغي", className: "bg-rose-50 text-rose-700 border-rose-200" },
};

export function getRequestReference(id: string, createdAt: Date) {
  const date = createdAt.toISOString().slice(0, 10).replaceAll("-", "");
  return `MS-${date}-${id.slice(-6).toUpperCase()}`;
}
