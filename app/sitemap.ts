import type { MetadataRoute } from "next";
import { getActiveServices } from "@/lib/services/service-dal";
import { getActivePortfolioItems } from "@/lib/services/portfolio-dal";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://masamersa.com";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/works`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  try {
    const [services, portfolioItems] = await Promise.all([
      getActiveServices(),
      getActivePortfolioItems(),
    ]);

    const serviceRoutes: MetadataRoute.Sitemap = services.map((service) => ({
      url: `${baseUrl}/services/${service.slug}`,
      lastModified: service.updatedAt ? new Date(service.updatedAt) : now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const portfolioRoutes: MetadataRoute.Sitemap = portfolioItems.map((item) => ({
      url: `${baseUrl}/works/${item.slug}`,
      lastModified: item.updatedAt ? new Date(item.updatedAt) : now,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [...staticRoutes, ...serviceRoutes, ...portfolioRoutes];
  } catch {
    return staticRoutes;
  }
}
