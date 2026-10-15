import { prisma } from "@/lib/prisma";

function isMissingSchemaObjectError(error: unknown): boolean {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string"
  ) {
    const code = (error as { code: string }).code;
    return code === "P2021" || code === "P2022";
  }
  return false;
}

export async function getAllRequestsForAdmin() {
  try {
    return await prisma.serviceRequest.findMany({
      include: {
        service: { select: { title: true, slug: true } },
        items: {
          include: {
            option: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    // Only fallback if the migration has not yet been applied to the database
    if (isMissingSchemaObjectError(error)) {
      console.warn("Requests DAL: items table or option relation not yet migrated, falling back to legacy schema.");
      return await prisma.serviceRequest.findMany({
        include: {
          service: { select: { title: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    }
    console.error("Failed to query requests for admin:", error);
    throw error;
  }
}

export async function getRequestByIdForAdmin(id: string) {
  try {
    return await prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        service: { select: { title: true, slug: true } },
        items: {
          include: {
            option: { select: { id: true, name: true } },
          },
        },
      },
    });
  } catch (error) {
    // Only fallback if the migration has not yet been applied to the database
    if (isMissingSchemaObjectError(error)) {
      console.warn(`Requests DAL: items table or option relation not yet migrated for request ${id}, falling back.`);
      return await prisma.serviceRequest.findUnique({
        where: { id },
        include: {
          service: { select: { title: true, slug: true } },
        },
      });
    }
    console.error(`Failed to query request ${id} for admin:`, error);
    throw error;
  }
}
