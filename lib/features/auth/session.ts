import { cookies } from "next/headers";
import { COOKIE_NAME, signSession, verifySession, SESSION_MAX_AGE } from "./jwt";
import type { Role } from "@/lib/features/_shared/enums";

export async function setSessionCookie(userId: string, role: Role): Promise<void> {
  const token = await signSession({ sub: userId, role });
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

/** Read & verify the current request's session. Null if missing/invalid. */
export async function getSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}
