import { redirect } from "next/navigation";
import { getSession } from "./session";
import { prisma } from "../prisma";

export interface AuthenticatedAdmin {
  id: string;
  email: string;
  name: string;
}

/**
 * Defense-in-depth check for Admin access:
 * 1. Checks valid JWT session cookie.
 * 2. Queries database to ensure user still exists and isActive === true.
 * Redirects or throws if unauthorized.
 */
export async function requireAdmin(options?: {
  redirectToLogin?: boolean;
}): Promise<AuthenticatedAdmin> {
  const session = await getSession();

  if (!session) {
    if (options?.redirectToLogin !== false) {
      redirect("/admin/login");
    }
    throw new Error("غير مصرح: يجب تسجيل الدخول كمسؤول");
  }

  try {
    const admin = await prisma.adminUser.findUnique({
      where: { id: session.id },
      select: { id: true, email: true, name: true, isActive: true },
    });

    if (!admin || !admin.isActive) {
      if (options?.redirectToLogin !== false) {
        redirect("/admin/login");
      }
      throw new Error("غير مصرح: حساب المسؤول غير نشط أو غير موجود");
    }

    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
    };
  } catch (error) {
    // If DB is temporarily unreachable or redirect thrown
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    if (options?.redirectToLogin !== false) {
      redirect("/admin/login");
    }
    throw error;
  }
}
