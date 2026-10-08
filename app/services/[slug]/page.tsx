import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Clock,
  Award,
} from "lucide-react";
import { getServiceBySlug, getActiveServices, getServiceDisplayImage } from "@/lib/services/service-dal";
import { getSiteSettings } from "@/lib/services/site-setting-dal";
import { ServiceIcon } from "@/components/shared/service-icon";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatWhatsAppUrl, isRuntimeUploadPath } from "@/lib/utils";
import { SharedGalleryLightbox } from "@/components/shared/gallery-lightbox";
import { RequestModalTrigger } from "@/components/request/request-modal-provider";

interface ServicePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) {
    return {
      title: "الخدمة غير موجودة | مسامر",
    };
  }

  const displayImage = getServiceDisplayImage(service);

  return {
    title: `${service.title} | مسامر للضيافة الفاخرة`,
    description: service.shortDescription,
    openGraph: { title: service.title, description: service.shortDescription, ...(displayImage ? { images: [{ url: displayImage, alt: service.title }] } : {}) },
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
  const [service, settings] = await Promise.all([
    getServiceBySlug(slug),
    getSiteSettings(),
  ]);

  if (!service) {
    notFound();
  }

  const whatsappUrl = formatWhatsAppUrl(
    settings.whatsapp || settings.phone || "0539691477",
    `مرحباً مسامر، أود الاستفسار وحجز خدمة (${service.title}).`
  );
  const displayImage = getServiceDisplayImage(service);
  const galleryImages = service.images.filter((image) => image.imagePath !== displayImage);

  return (
    <div className="min-h-screen bg-sand-50/50 pb-24 pt-10">
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
          <div className="space-y-6">
            <div className="bg-primary-950 text-white rounded-3xl p-8 border border-primary-900 shadow-xl sticky top-28">
              <span className="inline-block px-3 py-1 rounded-full bg-secondary-900/60 text-secondary-300 text-xs font-semibold mb-4 border border-secondary-800">
                طلب الخدمة المباشر
              </span>
              <h3 className="text-2xl font-bold mb-3 leading-snug">
                جاهزون لتشريف مناسبتكم القادمة
              </h3>
              <p className="text-sand-200/80 text-sm leading-relaxed mb-8">
                فريقنا المتخصص مستعد لترتيب كافة تفاصيل الضيافة بما يليق بضيوفكم ومقام مناسبتكم.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-sm text-sand-100">
                  <ShieldCheck className="w-5 h-5 text-secondary-400 shrink-0" />
                  <span>كوادر سعودية مدربة ومؤهلة</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-sand-100">
                  <Clock className="w-5 h-5 text-secondary-400 shrink-0" />
                  <span>التزام دقيق بالمواعيد والجاهزية المبكرة</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-sand-100">
                  <Award className="w-5 h-5 text-secondary-400 shrink-0" />
                  <span>أواني فاخرة ومعدات ضيافة متكاملة</span>
                </div>
              </div>

              <RequestModalTrigger serviceSlug={service.slug} className={buttonVariants({ variant: "secondary", size: "lg", className: "w-full text-base font-bold mb-3" })}>اطلب الخدمة</RequestModalTrigger>
              <Button
                asChild
                variant="secondary"
                size="lg"
                className="w-full text-base font-bold shadow-lg shadow-secondary-900/40"
              >
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <PhoneCall className="w-5 h-5" />
                  <span>واتساب: {service.title}</span>
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
