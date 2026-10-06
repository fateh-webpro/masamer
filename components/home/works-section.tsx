import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Sparkles } from "lucide-react";
import type { PortfolioItemData } from "@/lib/services/portfolio-dal";
import { Button } from "@/components/ui/button";

interface WorksSectionProps {
  featuredItems: PortfolioItemData[];
}

export function WorksSection({ featuredItems }: WorksSectionProps) {
  if (!featuredItems || featuredItems.length === 0) {
    return null;
  }

  return (
    <section className="py-14 sm:py-16 md:py-20 bg-sand-50/60 border-t border-sand-200/60 relative overflow-hidden">
      {/* Background Decorative Pattern */}
      <div
        className="pointer-events-none absolute top-10 right-0 w-80 h-80 rounded-full bg-secondary-500/5 blur-3xl -z-10"
        aria-hidden="true"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sand-100 border border-sand-200 text-secondary-800 text-xs sm:text-sm font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-secondary-600" />
              <span>معرض أعمال مسامر</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-primary-950 tracking-tight leading-tight">
              من واقع تجهيزاتنا ومناسباتنا
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2 leading-relaxed">
              شاهد نماذج حقيقية من تجهيزات الضيافة، الجلسات الشعبية والملكية، وإدارة الفعاليات التي نفذناها باحترافية وأصالة.
            </p>
          </div>

          <div>
            <Button asChild variant="outline" className="border-sand-300 hover:border-secondary-400 bg-white gap-2 font-bold shadow-2xs">
              <Link href="/works">
                <span>استكشف كافة الأعمال</span>
                <ArrowLeft className="w-4 h-4 text-secondary-600" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Featured Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {featuredItems.slice(0, 6).map((item) => (
            <article
              key={item.id}
              className="group relative bg-white rounded-3xl border border-[#E8E3DE] overflow-hidden transition-all duration-300 motion-reduce:transition-none hover:shadow-lg hover:shadow-[#1F294A]/8 hover:-translate-y-1 motion-reduce:hover:translate-y-0"
            >
              {/* Cover Image */}
              <Link
                href={`/works/${item.slug}`}
                className="relative aspect-4/3 w-full overflow-hidden bg-slate-100 block"
                aria-label={`عرض ${item.title}`}
              >
                <Image
                  src={item.coverImagePath}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 motion-reduce:transition-none group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#1F294A]/90 via-[#1F294A]/10 to-transparent" />

                {item.category && (
                  <span className="absolute top-3.5 right-3.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/95 text-primary-950 shadow-xs border border-white/40 backdrop-blur-xs">
                    {item.category.name}
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-white line-clamp-2">{item.title}</h3>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#E7C8B7]">تفاصيل العمل <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" /></span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
