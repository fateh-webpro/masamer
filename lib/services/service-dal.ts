import { prisma } from "../prisma";

export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  icon: string;
  coverImagePath: string | null;
  features: string[];
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  images: Array<{ id: string; serviceId: string; imagePath: string; altText: string | null; sortOrder: number; createdAt: Date }>;
}

export function getServiceDisplayImage(
  service: Pick<ServiceItem, "coverImagePath" | "images">
): string | null {
  const imagePath = service.coverImagePath || service.images[0]?.imagePath || null;
  if (!imagePath) return null;
  if (/^(?:https?:|blob:|data:|\/)/.test(imagePath)) return imagePath;
  return `/${imagePath}`;
}

function parseFeatures(features: unknown): string[] {
  if (Array.isArray(features)) {
    return features.filter((f) => typeof f === "string");
  }
  if (typeof features === "string") {
    try {
      const parsed = JSON.parse(features);
      if (Array.isArray(parsed)) {
        return parsed.filter((f) => typeof f === "string");
      }
    } catch {
      return [features];
    }
  }
  return [];
}

export async function getActiveServices(): Promise<ServiceItem[]> {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: { images: { orderBy: { sortOrder: "asc" } } },
    });

    return services.map((s) => ({
      ...s,
      features: parseFeatures(s.features),
    }));
  } catch (error) {
    console.error("Error fetching active services:", error);
    return [];
  }
}

export async function getServiceBySlug(
  slug: string
): Promise<ServiceItem | null> {
  try {
    const service = await prisma.service.findFirst({
      where: { slug, isActive: true },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    });

    if (!service) return null;

    return {
      ...service,
      features: parseFeatures(service.features),
    };
  } catch (error) {
    console.error(`Error fetching service by slug "${slug}":`, error);
    return null;
  }
}

export async function getAllServicesForAdmin(): Promise<ServiceItem[]> {
  const services = await prisma.service.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });

  return services.map((s) => ({
    ...s,
    features: parseFeatures(s.features),
  }));
}

export async function getServiceByIdForAdmin(
  id: string
): Promise<ServiceItem | null> {
  const service = await prisma.service.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });

  if (!service) return null;

  return {
    ...service,
    features: parseFeatures(service.features),
  };
}
