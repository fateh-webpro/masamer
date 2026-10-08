"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronRight, ChevronLeft, Maximize2 } from "lucide-react";
import type { PortfolioImageData } from "@/lib/services/portfolio-dal";
import { isRuntimeUploadPath } from "@/lib/utils";

interface GalleryLightboxProps {
  coverImage: {
    path: string;
    alt: string;
  };
  additionalImages: PortfolioImageData[];
}

export function GalleryLightbox({ coverImage, additionalImages }: GalleryLightboxProps) {
  const allImages = [
    { id: "cover", imagePath: coverImage.path, altText: coverImage.alt },
    ...additionalImages,
  ];

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const isOpen = selectedIndex !== null;

  const handleOpen = (index: number) => {
    setSelectedIndex(index);
  };

  const handleClose = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  const handleNext = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev! + 1) % allImages.length);
  }, [allImages.length, selectedIndex]);

  const handlePrev = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev! - 1 + allImages.length) % allImages.length);
  }, [allImages.length, selectedIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      } else if (e.key === "ArrowRight") {
        // In RTL, right arrow is logically next/prev depending on preference, standard: right is previous/next
        handlePrev();
      } else if (e.key === "ArrowLeft") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, handleClose, handleNext, handlePrev]);

  if (allImages.length === 0) return null;

  return (
    <>
      {/* Gallery Grid of Additional Images */}
      {additionalImages.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {allImages.map((img, idx) => (
              <button
                key={img.id}
                type="button"
                onClick={() => handleOpen(idx)}
                className="group relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-100 border border-sand-200/90 shadow-2xs hover:shadow-md transition-all duration-300 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500"
                aria-label={`عرض الصورة ${idx + 1}`}
              >
                <Image
                  src={img.imagePath}
                  alt={img.altText || `صورة من المعرض ${idx + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  unoptimized={isRuntimeUploadPath(img.imagePath)}
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-primary-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-9 h-9 rounded-full bg-white/90 text-primary-950 flex items-center justify-center shadow-md">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                </div>
                {idx === 0 && (
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-medium backdrop-blur-xs">
                    الغلاف
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {isOpen && selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md transition-opacity"
          role="dialog"
          aria-modal="true"
          aria-label="معاينة الصور بحجم كامل"
        >
          {/* Top Bar: Counter & Close */}
          <div className="absolute top-0 inset-x-0 p-4 sm:p-6 flex items-center justify-between text-white z-20">
            <span className="text-sm font-medium tracking-wide bg-white/10 px-3 py-1 rounded-full border border-white/10">
              {selectedIndex + 1} / {allImages.length}
            </span>

            <button
              type="button"
              onClick={handleClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="إغلاق المعاينة"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Controls */}
          {allImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-2xl bg-white/10 hover:bg-white/25 text-white transition-colors z-20 backdrop-blur-xs focus:outline-none"
                aria-label="الصورة السابقة"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-2xl bg-white/10 hover:bg-white/25 text-white transition-colors z-20 backdrop-blur-xs focus:outline-none"
                aria-label="الصورة التالية"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Main Display Image */}
          <div
            className="relative w-full h-full max-w-5xl max-h-[80vh] p-4 sm:p-8 flex items-center justify-center"
            onClick={handleClose}
          >
            <div
              className="relative w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={allImages[selectedIndex].imagePath}
                alt={allImages[selectedIndex].altText || `صورة ${selectedIndex + 1}`}
                fill
                sizes="(max-width: 1280px) 100vw, 1200px"
                unoptimized={isRuntimeUploadPath(allImages[selectedIndex].imagePath)}
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
