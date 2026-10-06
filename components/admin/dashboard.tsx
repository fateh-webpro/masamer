import React from "react";
import Link from "next/link";
import { Coffee, PlusCircle, ExternalLink, ShieldCheck, ImageIcon, Star, ClipboardList } from "lucide-react";
import { getAllServicesForAdmin } from "@/lib/services/service-dal";
import { getAllPortfolioItemsForAdmin, getAllCategoriesForAdmin } from "@/lib/services/portfolio-dal";
import { getAllRequestsForAdmin } from "@/lib/services/request-dal";
import { Button } from "@/components/ui/button";

export async function AdminCustomDashboard() {
  const [services, portfolioItems, categories, requests] = await Promise.all([
    getAllServicesForAdmin(),
    getAllPortfolioItemsForAdmin(),
    getAllCategoriesForAdmin(),
    getAllRequestsForAdmin(),
  ]);

  const totalServices = services.length;
  const activeServices = services.filter((s) => s.isActive).length;

  const totalWorks = portfolioItems.length;
  const activeWorks = portfolioItems.filter((w) => w.isActive).length;
  const featuredWorks = portfolioItems.filter((w) => w.isFeatured && w.isActive).length;
  const totalCategories = categories.length;

  return (
    <div className="space-y-8 p-2 sm:p-4">
      {/* Welcome Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sand-100 text-secondary-800 text-xs font-semibold mb-3 border border-sand-200">
            <ShieldCheck className="w-4 h-4 text-secondary-600" />
            <span>لوحة التحكم الرئيسية لمنصة مسامر</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            مرحباً بك في إدارة مسـامر
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            إدارة خدمات الضيافة، معرض الأعمال والمشاريع، تصنيفات التجهيزات، وإعدادات الهوية العامة.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button asChild variant="secondary" className="gap-2 font-semibold shadow-sm">
            <Link href="/admin/portfolio/new">
              <PlusCircle className="w-4 h-4" />
              <span>إضافة عمل جديد</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/admin/services/new">
              <PlusCircle className="w-4 h-4 text-secondary-600" />
              <span>إضافة خدمة</span>
            </Link>
          </Button>
          <Button asChild variant="ghost" className="gap-2 text-slate-600">
            <Link href="/works" target="_blank">
              <ExternalLink className="w-4 h-4" />
              <span>معاينة المعرض</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Services Count */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              خدمات الضيافة
            </span>
            <div className="w-9 h-9 rounded-xl bg-sand-100 text-secondary-700 flex items-center justify-center">
              <Coffee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalServices}</div>
          <p className="text-xs text-emerald-600 font-medium mt-1">
            {activeServices} خدمة نشطة ومعروضة
          </p>
        </div>

        {/* Portfolio Works Count */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              أعمال المعرض
            </span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalWorks}</div>
          <p className="text-xs text-emerald-600 font-medium mt-1">
            {activeWorks} أعمال معروضة للزوار
          </p>
        </div>

        {/* Requests Count */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              طلبات الخدمة
            </span>
            <div className="w-9 h-9 rounded-xl bg-sand-100 text-secondary-700 flex items-center justify-center">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{requests.length}</div>
          <p className="text-xs text-emerald-600 font-medium mt-1">
            {requests.filter((request) => request.status === "new").length} طلب جديد
          </p>
        </div>

        {/* Featured Works */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
              الأعمال المميزة
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">{featuredWorks}</div>
          <p className="text-xs text-slate-400 mt-1">معروضة في الصفحة الرئيسية</p>
        </div>
      </div>
    </div>
  );
}
