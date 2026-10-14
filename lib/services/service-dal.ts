import { prisma } from "../prisma";

export interface ServiceCategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  _count?: { services: number };
}

export interface ServiceItem {
  id: string;
  categoryId?: string | null;
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
  category?: { id: string; name: string; slug: string } | null;
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
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        category: { select: { id: true, name: true, slug: true } },
      },
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
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        category: { select: { id: true, name: true, slug: true } },
      },
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
  try {
    const services = await prisma.service.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    return services.map((s) => ({
      ...s,
      features: parseFeatures(s.features),
    }));
  } catch (error) {
    console.error("Error fetching admin services:", error);
    return [];
  }
}

export async function getServiceByIdForAdmin(
  id: string
): Promise<ServiceItem | null> {
  try {
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!service) return null;

    return {
      ...service,
      features: parseFeatures(service.features),
    };
  } catch (error) {
    console.error(`Error fetching service by id "${id}":`, error);
    return null;
  }
}

export async function getActiveServiceCategories(): Promise<ServiceCategoryItem[]> {
  try {
    return await prisma.serviceCategory.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: {
        _count: {
          select: { services: true },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching active service categories:", error);
    return [];
  }
}

export async function getAllServiceCategoriesForAdmin(): Promise<ServiceCategoryItem[]> {
  try {
    return await prisma.serviceCategory.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: {
        _count: {
          select: { services: true },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching admin service categories:", error);
    return [];
  }
}

export async function getServiceCategoryByIdForAdmin(id: string): Promise<ServiceCategoryItem | null> {
  try {
    return await prisma.serviceCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { services: true },
        },
      },
    });
  } catch (error) {
    console.error(`Error fetching service category by id "${id}":`, error);
    return null;
  }
}

export async function getServiceCategoryBySlug(slug: string): Promise<ServiceCategoryItem | null> {
  try {
    return await prisma.serviceCategory.findFirst({
      where: { slug, isActive: true },
      include: {
        _count: {
          select: { services: true },
        },
      },
    });
  } catch (error) {
    console.error(`Error fetching service category by slug "${slug}":`, error);
    return null;
  }
}
