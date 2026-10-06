"use server";

import { redirect } from "next/navigation";
import { loginSchema } from "@/lib/validations/auth";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";

export interface LoginFormState {
  error?: string;
  fieldErrors?: {
    email?: string[];
    password?: string[];
  };
}

export async function loginAction(
  prevState: LoginFormState | null,
  formData: FormData
): Promise<LoginFormState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const result = loginSchema.safeParse({ email, password });
  if (!result.success) {
    return {
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  try {
    const admin = await prisma.adminUser.findUnique({
      where: { email: result.data.email.toLowerCase().trim() },
    });

    if (!admin || !admin.isActive) {
      return {
        error: "البريد الإلكتروني أو كلمة المرور غير صحيحة، أو الحساب غير مفعّل",
      };
    }

    const isValidPassword = await verifyPassword(
      result.data.password,
      admin.passwordHash
    );

    if (!isValidPassword) {
      return {
        error: "البريد الإلكتروني أو كلمة المرور غير صحيحة، أو الحساب غير مفعّل",
      };
    }

    // Update last login timestamp
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    // Create session JWT cookie
    await createSession({
      id: admin.id,
      email: admin.email,
      name: admin.name,
    });
  } catch (error) {
    console.error("Login authentication error:", error);
    return {
      error: "حدث خطأ أثناء محاولة تسجيل الدخول. يرجى المحاولة لاحقاً.",
    };
  }

  redirect("/admin");
}
