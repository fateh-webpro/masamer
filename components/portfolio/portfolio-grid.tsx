"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Sparkles, Layers, ImageIcon } from "lucide-react";
import type { PortfolioItemData, PortfolioCategoryData } from "@/lib/services/portfolio-dal";

interface PortfolioGridProps {
  items: PortfolioItemData[];
  categories: PortfolioCategoryData[];
  initialCategory?: string;
}

export function PortfolioGrid({ items, categories, initialCategory }: PortfolioGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || "all");

  const filteredItems = useMemo(() => {
    if (selectedCategory === "all") {
      return items;
    }
    return items.filter((item) => item.category?.slug === selectedCategory);
  }, [items, selectedCategory]);

  return (
    <div className="space-y-10">
      {/* Category Filter Tabs */}
      {categories.length > 0 && (
        <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-2.5 max-w-4xl mx-auto px-4">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            aria-pressed={selectedCategory === "all"}
            className={`inline-flex items-center px-4 py-2 rounded-full text-xs sm:text-sm font-semibold border outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[#C2704B] focus-visible:ring-offset-2 ${
              selectedCategory === "all"
                ? "bg-[#1F294A] text-white border-[#1F294A] shadow-sm"
                : "bg-[#F8F6F3]/70 text-[#1F294A] border-[#1F294A]/20 hover:bg-[#C2704B]/8 hover:border-[#C2704B]"
            }`}
          >
            <span>كافة الأعمال</span>
            <span className={`ms-1.5 rounded-full px-1.5 py-0.5 text-[11px] ${selectedCategory === "all" ? "bg-white/15 text-white" : "bg-white text-[#747986]"}`}>
              {items.length}
            </span>
          </button>

          {categories.map((cat) => {
            const count = items.filter((item) => item.category?.slug === cat.slug).length;
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.slug)}
                aria-pressed={isSelected}
                className={`inline-flex items-center px-4 py-2 rounded-full text-xs sm:text-sm font-semibold border outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[#C2704B] focus-visible:ring-offset-2 ${
                  isSelected
                    ? "bg-[#1F294A] text-white border-[#1F294A] shadow-sm"
                    : "bg-[#F8F6F3]/70 text-[#1F294A] border-[#1F294A]/20 hover:bg-[#C2704B]/8 hover:border-[#C2704B]"
                }`}
              >
                <span>{cat.name}</span>
                {count > 0 && (
                  <span
                    className={`ms-1.5 text-[11px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? "bg-white/15 text-white" : "bg-white text-[#747986]"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Grid of Works */}
      {filteredItems.length === 0 ? (
        <div className="max-w-md mx-auto text-center py-16 px-6 bg-white rounded-3xl border border-sand-200/90 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-sand-100 text-secondary-600 flex items-center justify-center mx-auto mb-4 border border-sand-200">
            <ImageIcon className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-primary-950 mb-2">
            لا توجد أعمال في هذا التصنيف حالياً
          </h3>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            نقوم بتجهيز وإضافة صور مشاريع وتجهيزات جديدة لهذا القسم قريباً.
          </p>
          {selectedCategory !== "all" && (
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className="text-xs font-semibold text-secondary-700 hover:text-secondary-800 underline underline-offset-4"
            >
              عرض كافة الأعمال
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 sm:gap-8">
          {filteredItems.map((item) => (
            <article
              key={item.id}
              className="group relative bg-white rounded-3xl border border-[#E8E3DE] overflow-hidden transition-all duration-300 motion-reduce:transition-none hover:shadow-lg hover:shadow-[#1F294A]/8 hover:-translate-y-1 motion-reduce:hover:translate-y-0"
            >
              {/* Cover Image Container */}
              <Link
                href={`/works/${item.slug}`}
                className="relative aspect-4/3 w-full overflow-hidden bg-[#1F294A] block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2704B] focus-visible:ring-inset"
              >
                <Image
                  src={item.coverImagePath}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 motion-reduce:transition-none group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#1F294A]/90 via-[#1F294A]/10 to-transparent" />

                {/* Category Badge Floating on Image */}
                {item.category && (
                  <span className="absolute top-3.5 right-3.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F8F6F3]/95 text-[#1F294A] border border-white/40 backdrop-blur-xs">
                    {item.category.name}
                  </span>
                )}

                {/* Photos Count Tag */}
                {item.images && item.images.length > 0 && (
                  <span className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-md bg-black/60 text-white text-[11px] font-medium backdrop-blur-xs">
                    {item.images.length + 1} صور
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <h2 className="text-xl font-bold text-white line-clamp-2">{item.title}</h2>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#E7C8B7]">استعراض العمل <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" /></span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
