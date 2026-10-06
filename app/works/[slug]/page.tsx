import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Sparkles,
  PhoneCall,
  ShieldCheck,
  Award,
  Clock,
  MessageCircle,
  Tag,
  ImageIcon,
} from "lucide-react";
import { getPortfolioItemBySlug, getActivePortfolioItems } from "@/lib/services/portfolio-dal";
import { getSiteSettings } from "@/lib/services/site-setting-dal";
import { GalleryLightbox } from "@/components/portfolio/gallery-lightbox";
import { formatWhatsAppUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface WorkDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: WorkDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPortfolioItemBySlug(slug);

  if (!item) {
    return {
      title: "العمل غير موجود | مسامر",
    };
  }

  return {
    title: `${item.title} | أعمال مسامر`,
    description: item.shortDescription,
    openGraph: {
      title: `${item.title} | أعمال مسامر`,
      description: item.shortDescription,
      images: [
        {
          url: item.coverImagePath,
          width: 1200,
          height: 630,
          alt: item.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${item.title} | أعمال مسامر`,
      description: item.shortDescription,
      images: [item.coverImagePath],
    },
  };
}

export async function generateStaticParams() {
  const items = await getActivePortfolioItems();
  return items.map((item) => ({
    slug: item.slug,
  }));
}

export default async function WorkDetailPage({ params }: WorkDetailPageProps) {
  const { slug } = await params;
  const [item, settings] = await Promise.all([
    getPortfolioItemBySlug(slug),
    getSiteSettings(),
  ]);

  if (!item) {
    notFound();
  }

  const whatsappUrl = formatWhatsAppUrl(
    settings.whatsapp || settings.phone || "0539691477",
    `مرحباً مسامر، أود الاستفسار وطلب تجهيز مماثل لعمل (${item.title}).`
  );

  return (
    <div className="min-h-screen bg-sand-50/50 pb-24 pt-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mb-8" aria-label="مسار التصفح">
          <Link href="/" className="hover:text-primary-900 transition-colors">
            الرئيسية
          </Link>
          <span>/</span>
          <Link href="/works" className="hover:text-primary-900 transition-colors">
            أعمالنا
          </Link>
          <span>/</span>
          <span className="text-secondary-700 font-medium truncate max-w-xs sm:max-w-md">
            {item.title}
          </span>
        </nav>

        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/works"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary-950 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة لمعرض الأعمال</span>
          </Link>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Details (2 Columns) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header & Cover Image Card */}
            <article className="bg-white rounded-3xl border border-[#E8E3DE] overflow-hidden">
              {/* Cover Image */}
              <div className="relative aspect-16/10 sm:aspect-16/9 w-full overflow-hidden bg-[#1F294A]">
                <Image
                  src={item.coverImagePath}
                  alt={item.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 800px"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#1F294A]/95 via-[#1F294A]/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-9 text-white">
                  {item.category && <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-[#1F294A]/65 px-3 py-1 text-xs font-semibold text-[#E7C8B7] backdrop-blur-sm"><Tag className="w-3 h-3" />{item.category.name}</span>}
                  <h1 className="mt-3 text-2xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">{item.title}</h1>
                </div>
              </div>
              <p className="p-6 sm:p-8 text-base sm:text-lg text-[#747986] leading-relaxed border-t border-[#E8E3DE]">{item.shortDescription}</p>
            </article>

            {/* Detailed Description (if present) */}
            {item.description && (
              <section className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200/90 shadow-sm">
                <h2 className="text-xl font-bold text-primary-950 mb-4 flex items-center gap-2.5">
                  <Sparkles className="w-5 h-5 text-secondary-600" />
                  <span>تفاصيل ومواصفات التجهيز</span>
                </h2>
                <div className="text-slate-700 leading-relaxed text-base whitespace-pre-line">
                  {item.description}
                </div>
              </section>
            )}

            {/* Additional Images Gallery & Lightbox */}
            {item.images && item.images.length > 0 && (
              <section className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200/90 shadow-sm space-y-4">
                <h2 className="text-xl font-bold text-primary-950 flex items-center gap-2.5">
                  <ImageIcon className="w-5 h-5 text-secondary-600" />
                  <span>معرض صور العمل ({item.images.length + 1})</span>
                </h2>
                <p className="text-xs text-slate-500">
                  انقر على أي صورة لمعاينتها بحجم كامل والتنقل بين الصور.
                </p>
                <GalleryLightbox
                  coverImage={{ path: item.coverImagePath, alt: item.title }}
                  additionalImages={item.images}
                />
              </section>
            )}
          </div>

          {/* Sidebar / Quick Request Card (1 Column) */}
          <aside className="space-y-6">
            <div className="bg-primary-950 text-white rounded-3xl p-7 sm:p-8 border border-primary-900 shadow-xl sticky top-24">
              <span className="inline-block px-3 py-1 rounded-full bg-secondary-900/60 text-secondary-300 text-xs font-semibold mb-4 border border-secondary-800">
                طلب تجهيز مماثل
              </span>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 leading-snug">
                نصنع لمناسبتك نفس مستوى الفخامة
              </h3>
              <p className="text-sand-200/80 text-sm leading-relaxed mb-6">
                هل أعجبك هذا العمل؟ تواصل معنا مباشرة لتنسيق وتجهيز طلبك بكافة متطلبات الضيافة والتأثيث.
              </p>

              <div className="space-y-3.5 mb-7 text-xs sm:text-sm text-sand-100">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-secondary-400 shrink-0" />
                  <span>طواقم سعودية مدربة ولبقة</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-secondary-400 shrink-0" />
                  <span>جاهزية دقيقة قبل موعد المناسبة</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Award className="w-4 h-4 text-secondary-400 shrink-0" />
                  <span>أطقم وأواني ومباخر فاخرة</span>
                </div>
              </div>

              <Button
                asChild variant="secondary" size="lg" className="w-full text-base font-bold h-12 mb-3"
              ><Link href="/request">اطلب تجهيزًا مشابهًا</Link></Button>
              <Button
                asChild
                variant="secondary"
                size="lg"
                className="w-full text-base font-bold shadow-lg shadow-secondary-900/40 h-12"
              >
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>طلب تجهيز مماثل عبر واتساب</span>
                </a>
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
