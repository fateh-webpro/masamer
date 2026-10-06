import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "masamer_admin_session";
const SESSION_DURATION_HOURS = 8;
const SESSION_DURATION_SECONDS = SESSION_DURATION_HOURS * 60 * 60;

export interface AdminSessionPayload {
  id: string;
  email: string;
  name: string;
}

function getJwtSecret(): Uint8Array {
  const secret =
    process.env.ADMIN_JWT_SECRET ||
    "masamer_super_secure_fallback_secret_for_local_dev_key";
  return new TextEncoder().encode(secret);
}

export async function createSession(
  payload: AdminSessionPayload
): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_SECONDS * 1000);
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_HOURS}h`)
    .sign(getJwtSecret());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function getSession(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      algorithms: ["HS256"],
    });
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
    };
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
