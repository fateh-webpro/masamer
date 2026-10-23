import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Clock,
  Award,
} from "lucide-react";
import { getServiceBySlug, getActiveServices, getServiceDisplayImage } from "@/lib/services/service-dal";
import { getSiteSettings } from "@/lib/services/site-setting-dal";
import { ServiceIcon } from "@/components/shared/service-icon";
import { SocialIcon } from "@/components/shared/social-icon";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatWhatsAppUrl, isRuntimeUploadPath } from "@/lib/utils";
import { SharedGalleryLightbox } from "@/components/shared/gallery-lightbox";
import { RequestModalTrigger } from "@/components/request/request-modal-provider";
import { getServiceSeoProfile } from "@/lib/services/service-seo";

interface ServicePageProps {
  params: Promise<{
    slug: string;
  }>;
}

function cleanTitleForTemplate(rawTitle: string): string {
  return rawTitle.replace(/\s*[|–-]\s*(?:مسامر|مسـامر|MASAMER)\s*$/i, "").trim();
}

export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) {
    return {
      title: "الخدمة غير موجودة",
    };
  }

  const seoProfile = getServiceSeoProfile(service.slug);
  const metaTitle = cleanTitleForTemplate(
    service.seoTitle?.trim() || seoProfile.title || service.title
  );
  const metaDescription =
    service.seoDescription?.trim() ||
    seoProfile.description ||
    service.shortDescription;

  const displayImage = getServiceDisplayImage(service);

  return {
    title: metaTitle,
    description: metaDescription,
    alternates: {
      canonical: `https://masamersa.com/services/${service.slug}`,
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: `https://masamersa.com/services/${service.slug}`,
      ...(displayImage ? { images: [{ url: displayImage, alt: service.title }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      ...(displayImage ? { images: [displayImage] } : {}),
    },
  };
}

export async function generateStaticParams() {
  const services = await getActiveServices();
  return services.map((service) => ({
    slug: service.slug,
  }));
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { slug } = await params;
  const [service, settings, allServices] = await Promise.all([
    getServiceBySlug(slug),
    getSiteSettings(),
    getActiveServices(),
  ]);

  if (!service) {
    notFound();
  }

  const relatedServices = allServices
    .filter((s) => s.slug !== service.slug && s.isActive)
    .slice(0, 3);

  const whatsappUrl = formatWhatsAppUrl(
    settings.whatsapp || settings.phone || "0539691477",
    `مرحباً مسامر، أود الاستفسار وحجز خدمة (${service.title}).`
  );
  const displayImage = getServiceDisplayImage(service);
  const galleryImages = service.images.filter((image) => image.imagePath !== displayImage);
  const seoProfile = getServiceSeoProfile(service.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `https://masamersa.com/services/${service.slug}#service`,
        name: service.title,
        description: service.seoDescription?.trim() || seoProfile.description || service.shortDescription,
        provider: {
          "@type": "LocalBusiness",
          "@id": "https://masamersa.com/#organization",
          name: settings.siteName || "مسامر",
          url: "https://masamersa.com",
        },
        url: `https://masamersa.com/services/${service.slug}`,
        ...(displayImage ? { image: displayImage } : {}),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `https://masamersa.com/services/${service.slug}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "الرئيسية",
            item: "https://masamersa.com",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "الخدمات",
            item: "https://masamersa.com/services",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: service.title,
            item: `https://masamersa.com/services/${service.slug}`,
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-sand-50/50 pb-24 pt-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mb-8">
          <Link
            href="/"
            className="hover:text-primary-900 transition-colors"
          >
            الرئيسية
          </Link>
          <span>/</span>
          <Link
            href="/services"
            className="hover:text-primary-900 transition-colors"
          >
            الخدمات
          </Link>
          <span>/</span>
          <span className="text-secondary-700 font-medium truncate">
            {service.title}
          </span>
        </nav>

        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary-950 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة لكافة الخدمات</span>
          </Link>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Service Details (2 Cols) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="relative min-h-105 sm:min-h-120 rounded-3xl overflow-hidden border border-[#E8E3DE] bg-[#1F294A]">
              {displayImage ? <Image src={displayImage} alt={service.title} fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 800px" unoptimized={isRuntimeUploadPath(displayImage)} /> : <div className="absolute inset-0 bg-linear-to-br from-[#1F294A] to-[#29365D] bg-arabesque-subtle flex items-center justify-center text-[#E7C8B7]"><ServiceIcon name={service.icon} className="w-20 h-20 opacity-80" /></div>}
              <div className="absolute inset-0 bg-linear-to-t from-[#1F294A]/95 via-[#1F294A]/35 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 text-white">
                <div className="w-12 h-12 rounded-xl border border-white/20 bg-[#1F294A]/70 text-[#E7C8B7] flex items-center justify-center mb-5 backdrop-blur-sm"><ServiceIcon name={service.icon} className="w-6 h-6" /></div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">{service.title}</h1>
                <p className="mt-4 max-w-2xl text-sm sm:text-lg text-white/85 leading-relaxed">{service.shortDescription}</p>
                <RequestModalTrigger serviceSlug={service.slug} className="mt-6 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#C2704B] px-6 py-3 text-sm font-bold text-white hover:bg-[#A95F40] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"><span>اطلب الخدمة</span><ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" /></RequestModalTrigger>
              </div>
            </div>

            {/* Detailed Description */}
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-sand-200/90 shadow-sm">
              <h2 className="text-xl font-bold text-primary-950 mb-5 flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-secondary-600" />
                <span>تفاصيل الخدمة ومجالات التقديم</span>
              </h2>
              <div className="text-slate-700 leading-relaxed text-base sm:text-lg whitespace-pre-line">
                {service.fullDescription}
              </div>
            </div>

            {/* Features Checklist */}
            {service.features.length > 0 && (
              <div className="bg-white rounded-3xl p-8 sm:p-10 border border-sand-200/90 shadow-sm">
                <h2 className="text-xl font-bold text-primary-950 mb-6 flex items-center gap-2.5">
                  <Award className="w-5 h-5 text-secondary-600" />
                  <span>ما تشمله هذه الخدمة</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {service.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-4 rounded-xl bg-sand-50/80 border border-sand-200/60"
                    >
                      <CheckCircle2 className="w-5 h-5 text-secondary-600 shrink-0 mt-0.5" />
                      <span className="text-sm font-medium text-slate-800 leading-snug">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {displayImage && galleryImages.length > 0 && <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E3DE]"><div className="w-12 h-0.5 bg-[#C2704B] mb-4" /><h2 className="text-xl font-bold text-[#1F294A] mb-5">معرض الخدمة</h2><SharedGalleryLightbox coverImage={{ path: displayImage, alt: service.title }} additionalImages={galleryImages} /></section>}
          </div>

          {/* Sidebar / Quick Inquiry Card (1 Col) */}
          <aside className="space-y-6">
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#1F294A] to-[#151C34] p-6 sm:p-8 text-white border border-[#C2704B]/35 shadow-xl sticky top-28">
              {/* Subtle decorative glow */}
              <div
                className="pointer-events-none absolute -top-16 -right-16 w-44 h-44 rounded-full bg-[#C2704B]/10 blur-2xl"
                aria-hidden="true"
              />

              <div className="relative z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#D69A7E] text-xs font-semibold mb-4 border border-[#C2704B]/30 backdrop-blur-xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#C2704B]" />
                  <span>طلب الخدمة المباشر</span>
                </span>

                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 leading-snug">
                  {seoProfile.requestTitle}
                </h3>

                <p className="text-[#F8F6F3]/80 text-sm leading-relaxed mb-6 sm:mb-8 font-normal">
                  {seoProfile.requestDescription}
                </p>

                <div className="space-y-3.5 mb-8">
                  <div className="flex items-center gap-3 text-sm text-[#F8F6F3]">
                    <div className="w-8 h-8 rounded-lg bg-[#C2704B]/15 text-[#D69A7E] flex items-center justify-center shrink-0 border border-[#C2704B]/25">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <span className="leading-snug">{seoProfile.requestPoints[0]}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[#F8F6F3]">
                    <div className="w-8 h-8 rounded-lg bg-[#C2704B]/15 text-[#D69A7E] flex items-center justify-center shrink-0 border border-[#C2704B]/25">
                      <Clock className="w-4 h-4" />
                    </div>
                    <span className="leading-snug">{seoProfile.requestPoints[1]}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[#F8F6F3]">
                    <div className="w-8 h-8 rounded-lg bg-[#C2704B]/15 text-[#D69A7E] flex items-center justify-center shrink-0 border border-[#C2704B]/25">
                      <Award className="w-4 h-4" />
                    </div>
                    <span className="leading-snug">{seoProfile.requestPoints[2]}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <RequestModalTrigger
                    serviceSlug={service.slug}
                    className={buttonVariants({
                      variant: "secondary",
                      size: "lg",
                      className: "w-full text-base font-bold shadow-md h-12 flex items-center justify-center gap-2",
                    })}
                  >
                    <span>اطلب الخدمة</span>
                    <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
                  </RequestModalTrigger>

                  <Button
                    asChild
                    variant="secondary"
                    size="lg"
                    className="w-full text-base font-bold shadow-md h-12"
                  >
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-3 min-w-0"
                      title={service.title}
                    >
                      <span className="truncate">{service.title}</span>
                      <SocialIcon platform="whatsapp" className="w-5 h-5 shrink-0 text-white" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Complementary Services Section */}
        {relatedServices.length > 0 && (
          <section className="mt-16 sm:mt-20 pt-12 border-t border-sand-200/80">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary-700 bg-sand-100 px-3 py-1 rounded-full border border-sand-200/80 mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-secondary-600" />
                  <span>تجهيزات متكاملة</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-primary-950">
                  خدمات مكملة لمناسبتك
                </h2>
                <p className="text-slate-600 text-sm sm:text-base mt-1">
                  اكتشف بقية خدماتنا المتكاملة لإتمام كافة احتياجات مناسبتك في مكان واحد
                </p>
              </div>
              <Link
                href="/services"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-secondary-700 hover:text-secondary-800 transition-colors shrink-0"
              >
                <span>استعراض كافة الخدمات</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedServices.map((relService) => {
                const relImage = getServiceDisplayImage(relService);
                return (
                  <article
                    key={relService.id}
                    className="group relative flex flex-col bg-white rounded-2xl border border-sand-200/90 hover:border-secondary-300 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-secondary-900/5 hover:-translate-y-0.5"
                  >
                    <div className="relative aspect-16/10 bg-primary-950 overflow-hidden">
                      {relImage ? (
                        <Image
                          src={relImage}
                          alt={relService.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          unoptimized={isRuntimeUploadPath(relImage)}
                        />
                      ) : (
                        <div className="absolute inset-0 bg-linear-to-br from-[#1F294A] to-[#29365D] bg-arabesque-subtle flex items-center justify-center">
                          <ServiceIcon name={relService.icon} className="w-10 h-10 text-[#E7C8B7] opacity-80" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-linear-to-t from-[#1F294A]/80 via-transparent to-transparent" />
                      <div className="absolute bottom-3 start-3 end-3 text-white">
                        <span className="text-xs font-semibold text-[#E7C8B7] block mb-0.5">خدمة مسامر</span>
                        <h3 className="text-base font-bold text-white line-clamp-1">{relService.title}</h3>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                      <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                        {relService.shortDescription}
                      </p>
                      <div className="pt-3 border-t border-sand-100 flex items-center justify-between">
                        <Link
                          href={`/services/${relService.slug}`}
                          className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-primary-950 group-hover:text-secondary-700 transition-colors"
                        >
                          <span>تفاصيل الخدمة</span>
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </Link>
                        <RequestModalTrigger
                          serviceSlug={relService.slug}
                          className="text-xs font-bold text-secondary-700 hover:text-secondary-800 transition-colors"
                        >
                          طلب فوري
                        </RequestModalTrigger>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
