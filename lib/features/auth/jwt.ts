import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@/lib/features/_shared/enums";

export interface SessionPayload {
  sub: string; // user id
  role: Role;
}

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-only-insecure-secret-change-me-32bytes",
);

export const COOKIE_NAME = "auth_token";
const TOKEN_TTL_SEC = 60 * 60 * 24 * 7; // 7 days

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_TTL_SEC}s`)
    .sign(SECRET);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    if (typeof payload.sub === "string" && (payload.role === "user" || payload.role === "admin")) {
      return { sub: payload.sub, role: payload.role };
    }
    return null;
  } catch {
    return null;
  }
}

export const SESSION_MAX_AGE = TOKEN_TTL_SEC;
