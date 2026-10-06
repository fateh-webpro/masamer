import { cache } from "react";
import { prisma } from "@/lib/prisma";

export interface PortfolioCategoryData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  itemsCount?: number;
}

export interface PortfolioImageData {
  id: string;
  portfolioItemId: string;
  imagePath: string;
  altText: string | null;
  sortOrder: number;
  createdAt: Date;
}

export interface PortfolioItemData {
  id: string;
  categoryId: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string | null;
  coverImagePath: string;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  images?: PortfolioImageData[];
}

/**
 * Fetch all categories for admin management
 */
export async function getAllCategoriesForAdmin(): Promise<PortfolioCategoryData[]> {
  const categories = await prisma.portfolioCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: {
      _count: {
        select: { items: true },
      },
    },
  });

  return categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    isActive: cat.isActive,
    sortOrder: cat.sortOrder,
    createdAt: cat.createdAt,
    updatedAt: cat.updatedAt,
    itemsCount: cat._count.items,
  }));
}

/**
 * Fetch active categories for public works filter
 */
export const getActivePortfolioCategories = cache(async (): Promise<PortfolioCategoryData[]> => {
  const categories = await prisma.portfolioCategory.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: {
        select: {
          items: {
            where: { isActive: true },
          },
        },
      },
    },
  });

  return categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    isActive: cat.isActive,
    sortOrder: cat.sortOrder,
    createdAt: cat.createdAt,
    updatedAt: cat.updatedAt,
    itemsCount: cat._count.items,
  }));
});

/**
 * Fetch category by ID
 */
export async function getPortfolioCategoryById(id: string): Promise<PortfolioCategoryData | null> {
  const cat = await prisma.portfolioCategory.findUnique({
    where: { id },
    include: {
      _count: {
        select: { items: true },
      },
    },
  });

  if (!cat) return null;

  return {
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    isActive: cat.isActive,
    sortOrder: cat.sortOrder,
    createdAt: cat.createdAt,
    updatedAt: cat.updatedAt,
    itemsCount: cat._count.items,
  };
}

/**
 * Fetch all portfolio items for Admin with category relation and images count
 */
export async function getAllPortfolioItemsForAdmin(): Promise<PortfolioItemData[]> {
  const items = await prisma.portfolioItem.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      images: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  return items.map((item) => ({
    id: item.id,
    categoryId: item.categoryId,
    title: item.title,
    slug: item.slug,
    shortDescription: item.shortDescription,
    description: item.description,
    coverImagePath: item.coverImagePath,
    isFeatured: item.isFeatured,
    isActive: item.isActive,
    sortOrder: item.sortOrder,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    category: item.category,
    images: item.images,
  }));
}

/**
 * Fetch portfolio item by ID for Admin edit form
 */
export async function getPortfolioItemById(id: string): Promise<PortfolioItemData | null> {
  const item = await prisma.portfolioItem.findUnique({
    where: { id },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      images: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!item) return null;

  return {
    id: item.id,
    categoryId: item.categoryId,
    title: item.title,
    slug: item.slug,
    shortDescription: item.shortDescription,
    description: item.description,
    coverImagePath: item.coverImagePath,
    isFeatured: item.isFeatured,
    isActive: item.isActive,
    sortOrder: item.sortOrder,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    category: item.category,
    images: item.images,
  };
}

/**
 * Fetch active portfolio items for public /works page, optionally filtered by category slug
 */
export const getActivePortfolioItems = cache(
  async (categorySlug?: string): Promise<PortfolioItemData[]> => {
    const whereClause: {
      isActive: boolean;
      category?: {
        isActive: boolean;
        slug?: string;
      };
    } = {
      isActive: true,
      category: {
        isActive: true,
        ...(categorySlug ? { slug: categorySlug } : {}),
      },
    };

    const items = await prisma.portfolioItem.findMany({
      where: whereClause,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return items.map((item) => ({
      id: item.id,
      categoryId: item.categoryId,
      title: item.title,
      slug: item.slug,
      shortDescription: item.shortDescription,
      description: item.description,
      coverImagePath: item.coverImagePath,
      isFeatured: item.isFeatured,
      isActive: item.isActive,
      sortOrder: item.sortOrder,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      category: item.category,
      images: item.images,
    }));
  }
);

/**
 * Fetch featured active portfolio items for Home page
 */
export const getFeaturedPortfolioItems = cache(
  async (limit: number = 6): Promise<PortfolioItemData[]> => {
    const items = await prisma.portfolioItem.findMany({
      where: {
        isActive: true,
        isFeatured: true,
        category: {
          isActive: true,
        },
      },
      take: limit,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return items.map((item) => ({
      id: item.id,
      categoryId: item.categoryId,
      title: item.title,
      slug: item.slug,
      shortDescription: item.shortDescription,
      description: item.description,
      coverImagePath: item.coverImagePath,
      isFeatured: item.isFeatured,
      isActive: item.isActive,
      sortOrder: item.sortOrder,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      category: item.category,
      images: item.images,
    }));
  }
);

/**
 * Fetch active portfolio item by slug for public details page /works/[slug]
 */
export const getPortfolioItemBySlug = cache(
  async (slug: string): Promise<PortfolioItemData | null> => {
    const item = await prisma.portfolioItem.findFirst({
      where: {
        slug,
        isActive: true,
        category: {
          isActive: true,
        },
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!item) return null;

    return {
      id: item.id,
      categoryId: item.categoryId,
      title: item.title,
      slug: item.slug,
      shortDescription: item.shortDescription,
      description: item.description,
      coverImagePath: item.coverImagePath,
      isFeatured: item.isFeatured,
      isActive: item.isActive,
      sortOrder: item.sortOrder,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      category: item.category,
      images: item.images,
    };
  }
);
