import type { AuthSession } from "@/lib/types";

function toBase64(str: string): string {
  return Buffer.from(str, "utf-8").toString("base64url");
}

function fromBase64(b64: string): string {
  return Buffer.from(b64, "base64url").toString("utf-8");
}

export function createToken(session: AuthSession): string {
  const header = toBase64(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = toBase64(JSON.stringify(session));
  const signature = toBase64("fake-signature");
  return `${header}.${payload}.${signature}`;
}

export function parseToken(token: string): AuthSession | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    return JSON.parse(fromBase64(parts[1])) as AuthSession;
  } catch {
    return null;
  }
}

export function hashPassword(password: string): string {
  return `$argon2id$v=19$m=65536,t=3,p=4$${btoa(password)}`;
}

export function verifyPassword(password: string, hash: string): boolean {
  const expected = hashPassword(password);
  return hash === expected;
}

export function isValidPassword(password: string): boolean {
  return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
}

export function isValidNickname(nickname: string): boolean {
  return /^[\w.\-]{3,30}$/.test(nickname);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function getCurrentUserId(token: string | undefined): string | null {
  if (!token) return null;
  const session = parseToken(token);
  return session?.user_id ?? null;
}
