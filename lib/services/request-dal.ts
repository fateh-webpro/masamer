import { prisma } from "@/lib/prisma";

export async function getAllRequestsForAdmin() {
  try {
    return await prisma.serviceRequest.findMany({
      include: {
        service: { select: { title: true, slug: true } },
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return await prisma.serviceRequest.findMany({
      include: {
        service: { select: { title: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}

export async function getRequestByIdForAdmin(id: string) {
  try {
    return await prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        service: { select: { title: true, slug: true } },
        items: true,
      },
    });
  } catch {
    return await prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        service: { select: { title: true, slug: true } },
      },
    });
  }
}
