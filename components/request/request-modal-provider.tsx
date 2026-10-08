"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import { RequestForm } from "@/components/request/request-form";
import { cn } from "@/lib/utils";

export type RequestServiceOption = { id: string; title: string; slug: string };

type RequestModalContextValue = {
  openRequestModal: (serviceSlug?: string) => void;
};

const RequestModalContext = React.createContext<RequestModalContextValue | null>(null);

export function RequestModalProvider({
  children,
  services,
  whatsapp,
}: {
  children: React.ReactNode;
  services: RequestServiceOption[];
  whatsapp: string;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [serviceSlug, setServiceSlug] = React.useState<string>();
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();

  const openRequestModal = React.useCallback((slug?: string) => {
    triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setServiceSlug(slug);
    setIsOpen(true);
  }, []);

  const closeRequestModal = React.useCallback(() => {
    setIsOpen(false);
    window.setTimeout(() => triggerRef.current?.focus(), reduceMotion ? 0 : 180);
  }, [reduceMotion]);

  React.useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeRequestModal();
      if (event.key === "Tab" && dialogRef.current) {
        const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]"));
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [closeRequestModal, isOpen]);

  const selectedServiceId = services.find((service) => service.slug === serviceSlug)?.id;

  return (
    <RequestModalContext.Provider value={{ openRequestModal }}>
      {children}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#151C34]/75 p-3 backdrop-blur-sm sm:p-6"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.18 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeRequestModal();
            }}
          >
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="request-modal-title"
              className="relative max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl overflow-y-auto overscroll-contain rounded-3xl border border-white/15 bg-[#F8F6F3] shadow-2xl sm:max-h-[calc(100dvh-3rem)]"
              initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.99 }}
              transition={{ duration: reduceMotion ? 0 : 0.22, ease: "easeOut" }}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#E8E3DE] bg-[#F8F6F3]/95 px-5 py-4 backdrop-blur-sm sm:px-8 sm:py-5">
                <div>
                  <p className="text-sm font-semibold text-[#C2704B]">تنسيق يبدأ من التفاصيل</p>
                  <h2 id="request-modal-title" className="mt-1 text-2xl font-extrabold text-[#1F294A] sm:text-3xl">اطلب الخدمة</h2>
                  <p className="mt-1 text-sm text-[#747986]">شاركنا معلومات المناسبة، وسيتواصل معك فريق مسامر لاستكمال التنسيق.</p>
                </div>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={closeRequestModal}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E8E3DE] bg-white text-[#1F294A] transition-colors hover:border-[#C2704B]/40 hover:text-[#C2704B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2704B]"
                  aria-label="إغلاق نموذج طلب الخدمة"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <div className="p-4 pb-6 sm:p-6 sm:pb-8">
                <RequestForm
                  key={serviceSlug ?? "general"}
                  services={services}
                  selectedServiceId={selectedServiceId}
                  whatsapp={whatsapp}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </RequestModalContext.Provider>
  );
}

export function RequestModalTrigger({
  children,
  serviceSlug,
  className,
  onClick,
}: {
  children: React.ReactNode;
  serviceSlug?: string;
  className?: string;
  onClick?: () => void;
}) {
  const context = React.useContext(RequestModalContext);
  if (!context) throw new Error("RequestModalTrigger must be used within RequestModalProvider");

  return (
    <button
      type="button"
      className={cn(className)}
      aria-haspopup="dialog"
      onClick={() => {
        onClick?.();
        context.openRequestModal(serviceSlug);
      }}
    >
      {children}
    </button>
  );
}
