import { prisma } from "@/lib/prisma";

export function getAllRequestsForAdmin() {
  return prisma.serviceRequest.findMany({
    include: { service: { select: { title: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export function getRequestByIdForAdmin(id: string) {
  return prisma.serviceRequest.findUnique({
    where: { id },
    include: { service: { select: { title: true, slug: true } } },
  });
}
