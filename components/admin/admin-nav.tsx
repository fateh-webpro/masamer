"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  PlusCircle,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ChevronLeft,
  Settings,
  Image as ImageIcon,
  FolderTree,
  ClipboardList,
} from "lucide-react";
import { logoutAction } from "@/app/admin/logout/actions";

interface AdminNavProps {
  adminName: string;
  adminEmail: string;
}

export function AdminNav({ adminName, adminEmail }: AdminNavProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    {
      title: "لوحة التحكم",
      href: "/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      title: "إدارة الخدمات",
      href: "/admin/services",
      icon: Layers,
      exact: false,
    },
    { title: "الطلبات", href: "/admin/requests", icon: ClipboardList, exact: false },
    {
      title: "معرض الأعمال",
      href: "/admin/portfolio",
      icon: ImageIcon,
      exact: true,
    },
    {
      title: "تصنيفات الأعمال",
      href: "/admin/portfolio/categories",
      icon: FolderTree,
      exact: false,
    },
    {
      title: "إعدادات الموقع",
      href: "/admin/site-settings",
      icon: Settings,
      exact: false,
    },
  ];

  const isActive = (itemHref: string, exact: boolean) => {
    if (exact) {
      return pathname === itemHref;
    }
    return pathname.startsWith(itemHref);
  };

  const navContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 border-l border-slate-800">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <Link
          href="/admin"
          className="inline-flex items-center gap-3 group"
          onClick={() => setIsMobileOpen(false)}
        >
          <div className="h-10 w-10 rounded-xl bg-secondary-600 flex items-center justify-center text-white font-bold text-lg shadow-md border border-secondary-400/30 group-hover:bg-secondary-500 transition-colors">
            <span>مـ</span>
          </div>
          <div>
            <span className="text-lg font-bold text-white block leading-none tracking-tight">
              مسـامر
            </span>
            <span className="text-xs text-slate-400 mt-1 block">
              لوحة الإدارة الفاخرة
            </span>
          </div>
        </Link>
        {isMobileOpen && (
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="إغلاق القائمة"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Nav Links */}
      <div className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 mb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          التنقل الرئيسي
        </div>
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-secondary-600 text-white shadow-md shadow-secondary-900/30"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${active ? "text-white" : "text-slate-400"}`} />
                <span>{item.title}</span>
              </div>
              {active && <ChevronLeft className="w-4 h-4 text-secondary-200" />}
            </Link>
          );
        })}

        <div className="pt-4 mt-4 border-t border-slate-800/80">
          <div className="px-3 mb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            إجراءات سريعة
          </div>
          <Link
            href="/admin/portfolio/new"
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-secondary-400" />
            <span>إضافة عمل جديد</span>
          </Link>
          <Link
            href="/admin/services/new"
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-secondary-400" />
            <span>إضافة خدمة جديدة</span>
          </Link>
          <Link
            href="/services"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white transition-colors"
          >
            <div className="flex items-center gap-3">
              <ExternalLink className="w-4 h-4 text-slate-400" />
              <span>الموقع العام</span>
            </div>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
              معاينة
            </span>
          </Link>
        </div>
      </div>

      {/* User Info & Logout Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-secondary-400 font-bold text-sm shrink-0">
            <ShieldCheck className="w-5 h-5 text-secondary-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">{adminName}</p>
            <p className="text-xs text-slate-400 truncate" dir="ltr">
              {adminEmail}
            </p>
          </div>
        </div>

        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/50 rounded-xl transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>تسجيل الخروج</span>
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Topbar with drawer toggle */}
      <header className="md:hidden bg-slate-900 text-white px-4 py-3 border-b border-slate-800 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            aria-label="فتح القائمة الجانبية"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-secondary-600 flex items-center justify-center text-white font-bold text-xs">
              <span>مـ</span>
            </div>
            <span className="font-bold text-base text-white">مسامر الإدارة</span>
          </div>
        </div>

        <form action={logoutAction}>
          <button
            type="submit"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 transition-colors text-xs flex items-center gap-1"
            title="تسجيل الخروج"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </form>
      </header>

      {/* Mobile Backdrop and Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10 flex flex-col">
            {navContent}
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-20">
        {navContent}
      </aside>
    </>
  );
}
