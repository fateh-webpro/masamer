import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { PlusCircle, FolderTree, Tag, ExternalLink, ArrowRight } from "lucide-react";
import { getAllCategoriesForAdmin } from "@/lib/services/portfolio-dal";
import { CategoryTableActions } from "@/components/admin/category-table-actions";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "تصنيفات الأعمال | لوحة التحكم - مسامر",
};

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getAllCategoriesForAdmin();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/admin/portfolio" className="hover:text-slate-900 transition-colors">
              معرض الأعمال
            </Link>
            <span>/</span>
            <span className="text-secondary-700 font-medium">تصنيفات الأعمال</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            تصنيفات معرض الأعمال
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            إدارة وتصنيف مشاريع وأعمال مسامر لعرضها بطريقة منظمة وفلاتر سريعة للزوار.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild variant="secondary" className="gap-2 font-semibold shadow-sm">
            <Link href="/admin/portfolio/categories/new">
              <PlusCircle className="w-4 h-4" />
              <span>إضافة تصنيف جديد</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-sand-100 text-secondary-600 flex items-center justify-center mx-auto mb-4 border border-sand-200">
              <FolderTree className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">لا توجد تصنيفات حالياً</h3>
            <p className="text-xs text-slate-500 mb-5 max-w-sm mx-auto">
              ابدأ بإضافة أول تصنيف لتنظيم مشاريع وتجهيزات مسامر.
            </p>
            <Button asChild variant="secondary" size="sm">
              <Link href="/admin/portfolio/categories/new">إضافة أول تصنيف</Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-4">اسم التصنيف</th>
                  <th scope="col" className="px-6 py-4">الاسم اللطيف (Slug)</th>
                  <th scope="col" className="px-6 py-4">الأعمال المسجلة</th>
                  <th scope="col" className="px-6 py-4">ترتيب العرض</th>
                  <th scope="col" className="px-6 py-4">الحالة</th>
                  <th scope="col" className="px-6 py-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-sand-100 text-secondary-700 flex items-center justify-center font-bold text-xs shrink-0">
                          <Tag className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span>{cat.name}</span>
                          {cat.description && (
                            <p className="text-xs text-slate-400 font-normal truncate max-w-xs mt-0.5">
                              {cat.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500 text-left" dir="ltr">
                      {cat.slug}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {cat.itemsCount ?? 0} أعمال
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">
                      {cat.sortOrder}
                    </td>
                    <td className="px-6 py-4">
                      {cat.isActive ? (
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
                        <CategoryTableActions
                          categoryId={cat.id}
                          categoryName={cat.name}
                          isActive={cat.isActive}
                          itemsCount={cat.itemsCount ?? 0}
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
