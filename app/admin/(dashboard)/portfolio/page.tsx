import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PlusCircle, FolderTree, Star, ImageIcon, ExternalLink } from "lucide-react";
import { getAllPortfolioItemsForAdmin } from "@/lib/services/portfolio-dal";
import { PortfolioTableActions } from "@/components/admin/portfolio-table-actions";
import { Button } from "@/components/ui/button";
import { isRuntimeUploadPath } from "@/lib/utils";

export const metadata: Metadata = {
  title: "معرض الأعمال | لوحة التحكم - مسامر",
};

export const dynamic = "force-dynamic";

export default async function AdminPortfolioPage() {
  const items = await getAllPortfolioItemsForAdmin();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            معرض الأعمال والمشاريع
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            إدارة أعمال مسامر الحقيقية، صور التجهيزات والمناسبات، وتحديد الأعمال المميزة في الصفحة الرئيسية.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button asChild variant="outline" className="gap-2 shadow-2xs">
            <Link href="/admin/portfolio/categories">
              <FolderTree className="w-4 h-4 text-secondary-600" />
              <span>تصنيفات الأعمال</span>
            </Link>
          </Button>

          <Button asChild variant="secondary" className="gap-2 font-semibold shadow-sm">
            <Link href="/admin/portfolio/new">
              <PlusCircle className="w-4 h-4" />
              <span>إضافة عمل جديد</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {items.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-sand-100 text-secondary-600 flex items-center justify-center mx-auto mb-4 border border-sand-200">
              <ImageIcon className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">لا توجد أعمال في المعرض حالياً</h3>
            <p className="text-xs text-slate-500 mb-5 max-w-md mx-auto">
              ابدأ بإضافة مشاريع وتجهيزات مسامر وصور الضيافة لعرضها في المعرض العام والصفحة الرئيسية.
            </p>
            <Button asChild variant="secondary" size="sm">
              <Link href="/admin/portfolio/new">إضافة أول عمل</Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-4">العمل والغلاف</th>
                  <th scope="col" className="px-6 py-4">التصنيف</th>
                  <th scope="col" className="px-6 py-4">الصور الإضافية</th>
                  <th scope="col" className="px-6 py-4">مميز (Home)</th>
                  <th scope="col" className="px-6 py-4">ترتيب العرض</th>
                  <th scope="col" className="px-6 py-4">الحالة</th>
                  <th scope="col" className="px-6 py-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="relative w-14 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                          <Image
                            src={item.coverImagePath}
                            alt={item.title}
                            fill
                            className="object-cover"
                            unoptimized={isRuntimeUploadPath(item.coverImagePath)}
                          />
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold text-slate-900 block truncate max-w-xs">
                            {item.title}
                          </span>
                          <span className="text-xs text-slate-400 font-mono block truncate max-w-xs text-left" dir="ltr">
                            /{item.slug}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-sand-100 text-secondary-800 border border-sand-200">
                        {item.category?.name || "بدون تصنيف"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-slate-600 font-medium">
                        {item.images?.length || 0} صور
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {item.isFeatured ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span>مميز</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-normal">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">
                      {item.sortOrder}
                    </td>
                    <td className="px-6 py-4">
                      {item.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>نشط</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          <span>معطل</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <PortfolioTableActions
                          itemId={item.id}
                          itemTitle={item.title}
                          itemSlug={item.slug}
                          isActive={item.isActive}
                          isFeatured={item.isFeatured}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
