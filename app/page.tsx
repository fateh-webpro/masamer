import { Header } from "@/components/layout/header";
import { Hero } from "@/components/home/hero";
import { Intro } from "@/components/home/intro";
import { ServicesSection } from "@/components/home/services-section";
import { WorksSection } from "@/components/home/works-section";
import { WhyMasamer } from "@/components/home/why-masamer";
import { CTA } from "@/components/home/cta";
import { Footer } from "@/components/layout/footer";
import { getSiteSettings } from "@/lib/services/site-setting-dal";
import { getActiveServices } from "@/lib/services/service-dal";
import { getFeaturedPortfolioItems } from "@/lib/services/portfolio-dal";

export const revalidate = 60;

export default async function HomePage() {
  const [settings, services, featuredWorks] = await Promise.all([
    getSiteSettings(),
    getActiveServices(),
    getFeaturedPortfolioItems(6),
  ]);

  const featuredCover = featuredWorks.length > 0 ? featuredWorks[0].coverImagePath : null;

  return (
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
  );
}
