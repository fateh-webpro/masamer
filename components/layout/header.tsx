"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, PhoneCall, ChevronLeft, MessageCircle } from "lucide-react";
import { mainNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { Button, buttonVariants } from "@/components/ui/button";
import { RequestModalTrigger } from "@/components/request/request-modal-provider";
import { cn, formatWhatsAppUrl, isRuntimeUploadPath } from "@/lib/utils";
import type { SiteSettingsData } from "@/lib/services/site-setting-dal";

interface HeaderProps {
  settings?: SiteSettingsData;
}

function isCurrentNavItem(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function Header({ settings }: HeaderProps) {
  const pathname = usePathname();
  const siteName = settings?.siteName || siteConfig.name;
  const sitePhone = settings?.phone || siteConfig.contact.phone;
  const whatsappUrl = formatWhatsAppUrl(
    settings?.whatsapp || settings?.phone || "0539691477",
    "مرحباً مسامر، أود الاستفسار وطلب خدمة ضيافة."
  );
  const logoPath = settings?.logoPath;
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const menuButtonRef = React.useRef<HTMLButtonElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on Escape key and restore focus
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  // Lock body scroll and manage focus when mobile menu opens/closes
  React.useEffect(() => {
    if (isMobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      // Auto-focus close button when drawer opens
      const timer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
      return () => {
        document.body.style.overflow = originalOverflow;
        clearTimeout(timer);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isMobileMenuOpen]);

  const closeMenuAndFocusTrigger = () => {
    setIsMobileMenuOpen(false);
    menuButtonRef.current?.focus();
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        isScrolled
          ? "bg-white/95 backdrop-blur-md border-b border-(--border-color) shadow-xs py-3"
          : "bg-transparent py-4 sm:py-5"
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Brand / Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group outline-none focus-visible:ring-2 focus-visible:ring-(--secondary) rounded-xl"
            aria-label={`${siteName} - الصفحة الرئيسية`}
          >
            {logoPath ? (
              <div className="relative h-10 sm:h-12 w-auto flex items-center">
                <Image
                  src={logoPath}
                  alt={siteName}
                  width={150}
                  height={48}
                  unoptimized={isRuntimeUploadPath(logoPath)}
                  className="h-10 sm:h-12 w-auto object-contain"
                  priority
                />
              </div>
            ) : (
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-(--primary)">مسامر</span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden lg:flex items-center gap-1 xl:gap-2"
            aria-label="القائمة الرئيسية"
          >
            {mainNav.map((item) => {
              const isCurrent = isCurrentNavItem(pathname, item.href);
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  aria-current={isCurrent ? "page" : undefined}
                  className={cn(
                    "relative px-3.5 py-2 text-sm rounded-lg transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[#C2704B] outline-none after:absolute after:bottom-0.5 after:left-1/2 after:h-0.5 after:-translate-x-1/2 after:rounded-full after:bg-[#C2704B] after:transition-[width] after:duration-200",
                    isCurrent
                      ? "font-bold text-[#C2704B] after:w-3/5"
                      : "font-medium text-[#252A35] hover:text-[#C2704B] hover:bg-[#C2704B]/6 after:w-0 hover:after:w-3/5"
                  )}
                >
                  {item.title}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Header Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <RequestModalTrigger className={buttonVariants({ variant: "secondary", size: "default", className: "font-medium shadow-xs" })}>اطلب الخدمة</RequestModalTrigger>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <Button
              ref={menuButtonRef}
              variant="outline"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
              aria-expanded={isMobileMenuOpen}
              className="border-(--border-color) h-10 w-10 bg-white/80"
            >
              <Menu className="h-5 w-5 text-(--text-main)" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/60 backdrop-blur-xs lg:hidden transition-all duration-300",
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        onClick={closeMenuAndFocusTrigger}
        aria-hidden="true"
      />

      {/* Mobile Navigation Drawer (Independent Elevated Layer) */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-[85%] max-w-xs sm:max-w-sm bg-white shadow-2xl border-s border-(--border-color) flex flex-col lg:hidden transition-all duration-300 ease-in-out",
          isMobileMenuOpen
            ? "translate-x-0 visible pointer-events-auto opacity-100"
            : "translate-x-full invisible pointer-events-none opacity-0"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="قائمة التنقل للهواتف"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-(--border-color) bg-white">
          <div className="flex items-center gap-2.5">
            {logoPath ? (
              <div className="relative h-10 w-auto flex items-center">
                <Image
                  src={logoPath}
                  alt={siteName}
                  width={150}
                  height={40}
                  unoptimized={isRuntimeUploadPath(logoPath)}
                  className="h-10 w-auto object-contain"
                />
              </div>
            ) : (
              <span className="text-xl font-bold text-(--primary)">مسامر</span>
            )}
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeMenuAndFocusTrigger}
            className="h-9 w-9 rounded-xl bg-(--background) text-(--text-muted) hover:text-(--primary) hover:bg-(--secondary)/10 hover:border-(--secondary)/30 flex items-center justify-center border border-(--border-color) transition-colors outline-none focus-visible:ring-2 focus-visible:ring-(--secondary)"
            aria-label="إغلاق القائمة"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1" aria-label="روابط الملاحة">
          {mainNav.map((item) => {
            const isCurrent = isCurrentNavItem(pathname, item.href);
            return (
              <Link
                key={item.title}
                href={item.href}
                onClick={closeMenuAndFocusTrigger}
                aria-current={isCurrent ? "page" : undefined}
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-xl border-s-[3px] text-base transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#C2704B]",
                  isCurrent
                    ? "border-s-[#C2704B] bg-[#C2704B]/10 font-bold text-[#1F294A]"
                    : "border-s-transparent font-medium text-[#252A35] hover:bg-[#C2704B]/6 hover:text-[#C2704B]"
                )}
              >
                <span>{item.title}</span>
                <ChevronLeft className={cn("h-4 w-4", isCurrent ? "text-[#C2704B]" : "text-[#747986]/50")} />
              </Link>
            );
          })}
        </nav>

        {/* Drawer Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-(--border-color) bg-(--background)/50 space-y-3">
          <RequestModalTrigger onClick={closeMenuAndFocusTrigger} className={buttonVariants({ variant: "secondary", className: "w-full justify-center text-base py-3 h-12 shadow-sm font-semibold" })}>اطلب الخدمة</RequestModalTrigger>

          <div className="flex flex-col gap-2 pt-1 text-center">
            <a
              href={`tel:${sitePhone.replace(/\s+/g, "")}`}
              className="inline-flex items-center justify-center gap-2 text-xs text-(--text-main) hover:text-(--secondary) transition-colors py-1.5"
            >
              <PhoneCall className="h-3.5 w-3.5 text-(--secondary)" />
              <span dir="ltr">{sitePhone}</span>
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 text-xs text-(--text-muted) hover:text-(--secondary) transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5 text-(--secondary)" />
              <span>محادثة فورية عبر واتساب</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
