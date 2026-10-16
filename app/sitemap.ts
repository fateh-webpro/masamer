import type { MetadataRoute } from "next";
import { getActiveServices } from "@/lib/services/service-dal";
import { getActivePortfolioItems } from "@/lib/services/portfolio-dal";
import { getSiteSettings } from "@/lib/services/site-setting-dal";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://masamersa.com";

  try {
    const [settings, services, portfolioItems] = await Promise.all([
      getSiteSettings(),
      getActiveServices(),
      getActivePortfolioItems(),
    ]);

    const siteUpdatedAt = settings.updatedAt ? new Date(settings.updatedAt) : undefined;

    const latestServiceUpdate = services.reduce<Date | undefined>((latest, s) => {
      if (!s.updatedAt) return latest;
      const d = new Date(s.updatedAt);
      return !latest || d > latest ? d : latest;
    }, undefined);

    const latestPortfolioUpdate = portfolioItems.reduce<Date | undefined>((latest, item) => {
      if (!item.updatedAt) return latest;
      const d = new Date(item.updatedAt);
      return !latest || d > latest ? d : latest;
    }, undefined);

    const staticRoutes: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        ...(siteUpdatedAt ? { lastModified: siteUpdatedAt } : {}),
        changeFrequency: "daily",
        priority: 1.0,
      },
      {
        url: `${baseUrl}/services`,
        ...(latestServiceUpdate || siteUpdatedAt
          ? { lastModified: latestServiceUpdate || siteUpdatedAt }
          : {}),
        changeFrequency: "daily",
        priority: 0.9,
      },
      {
        url: `${baseUrl}/works`,
        ...(latestPortfolioUpdate || siteUpdatedAt
          ? { lastModified: latestPortfolioUpdate || siteUpdatedAt }
          : {}),
        changeFrequency: "weekly",
        priority: 0.8,
      },
      {
        url: `${baseUrl}/about`,
        ...(siteUpdatedAt ? { lastModified: siteUpdatedAt } : {}),
        changeFrequency: "monthly",
        priority: 0.7,
      },
      {
        url: `${baseUrl}/contact`,
        ...(siteUpdatedAt ? { lastModified: siteUpdatedAt } : {}),
        changeFrequency: "monthly",
        priority: 0.7,
      },
    ];

    const serviceRoutes: MetadataRoute.Sitemap = services.map((service) => ({
      url: `${baseUrl}/services/${service.slug}`,
      ...(service.updatedAt ? { lastModified: new Date(service.updatedAt) } : {}),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const portfolioRoutes: MetadataRoute.Sitemap = portfolioItems.map((item) => ({
      url: `${baseUrl}/works/${item.slug}`,
      ...(item.updatedAt ? { lastModified: new Date(item.updatedAt) } : {}),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [...staticRoutes, ...serviceRoutes, ...portfolioRoutes];
  } catch {
    return [
      {
        url: baseUrl,
        changeFrequency: "daily",
        priority: 1.0,
      },
      {
        url: `${baseUrl}/services`,
        changeFrequency: "daily",
        priority: 0.9,
      },
      {
        url: `${baseUrl}/works`,
        changeFrequency: "weekly",
        priority: 0.8,
      },
      {
        url: `${baseUrl}/about`,
        changeFrequency: "monthly",
        priority: 0.7,
      },
      {
        url: `${baseUrl}/contact`,
        changeFrequency: "monthly",
        priority: 0.7,
      },
    ];
  }
}
