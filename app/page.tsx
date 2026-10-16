import { Header } from "@/components/layout/header";
import { Hero } from "@/components/home/hero";
import { Intro } from "@/components/home/intro";
import { ServicesSection } from "@/components/home/services-section";
import { WorksSection } from "@/components/home/works-section";
import { WhyMasamer } from "@/components/home/why-masamer";
import { CTA } from "@/components/home/cta";
import { Footer } from "@/components/layout/footer";
import { getSiteSettings } from "@/lib/services/site-setting-dal";
import { getActiveServices, getActiveServiceCategories } from "@/lib/services/service-dal";
import { getFeaturedPortfolioItems } from "@/lib/services/portfolio-dal";
import { RequestModalProvider } from "@/components/request/request-modal-provider";
import { siteConfig } from "@/config/site";

export const revalidate = 60;

export default async function HomePage() {
  const [settings, services, featuredWorks, categories] = await Promise.all([
    getSiteSettings(),
    getActiveServices(),
    getFeaturedPortfolioItems(6),
    getActiveServiceCategories(),
  ]);

  const featuredCover = featuredWorks.length > 0 ? featuredWorks[0].coverImagePath : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://masamersa.com/#website",
        url: "https://masamersa.com",
        name: settings.siteName || "مسامر",
        alternateName: "مسامر - حلول متكاملة للمناسبات والضيافة",
        description:
          settings.seoDescription || settings.shortDescription || siteConfig.description,
        inLanguage: "ar",
        publisher: {
          "@id": "https://masamersa.com/#organization",
        },
      },
      {
        "@type": "LocalBusiness",
        "@id": "https://masamersa.com/#organization",
        name: settings.siteName || "مسامر",
        alternateName: "مسامر - حلول متكاملة للمناسبات والضيافة",
        description:
          settings.seoDescription || settings.shortDescription || siteConfig.description,
        url: "https://masamersa.com",
        telephone: settings.phone,
        email: settings.email || siteConfig.contact.email,
        areaServed: [
          { "@type": "City", name: "الرياض" },
          { "@type": "City", name: "جدة" },
          { "@type": "City", name: "الدمام" },
        ],
        address: {
          "@type": "PostalAddress",
          addressCountry: "SA",
          addressRegion: "المملكة العربية السعودية",
        },
        sameAs: [
          settings.xUrl,
          settings.instagramUrl,
          settings.snapchatUrl,
          settings.tiktokUrl,
        ].filter((url): url is string => Boolean(url && url.trim())),
      },
    ],
  };

  return (
    <RequestModalProvider
      services={services.map(({ id, title, slug, icon, categoryId, category, options }) => ({
        id,
        title,
        slug,
        icon,
        categoryId,
        categoryName: category?.name,
        options: options?.map((o) => ({
          id: o.id,
          name: o.name,
          description: o.description,
          sortOrder: o.sortOrder,
        })),
      }))}
      categories={categories.map(({ id, name }) => ({ id, name }))}
      whatsapp={settings.whatsapp || settings.phone}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex min-h-screen flex-col bg-(--background)">
        <Header settings={settings} />
        <main className="flex-1">
          <Hero settings={settings} featuredImage={featuredCover} />
          <Intro />
          <ServicesSection services={services} />
          <WorksSection featuredItems={featuredWorks} />
          <WhyMasamer settings={settings} />
          <CTA settings={settings} />
        </main>
        <Footer settings={settings} />
      </div>
    </RequestModalProvider>
  );
}
