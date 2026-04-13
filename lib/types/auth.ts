export interface User {
  id: string;
  email: string;
  phone: string;
  password_hash: string;
  email_verified: boolean;
  phone_verified: boolean;
  status: UserStatus;
  scope: string;
  created_at: string;
  updated_at: string;
}

export type UserStatus = "PENDING_VERIFICATION" | "PENDING_AUDIT" | "ACTIVE" | "REJECTED";

export interface RegisterPayload {
  email: string;
  phone: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface VerificationToken {
  id: string;
  user_id: string;
  type: "EMAIL" | "PHONE";
  code: string;
  expires_at: string;
  used: boolean;
}

export interface AuthSession {
  user_id: string;
  email: string;
  scope: string;
  nickname?: string;
}

export interface RateLimitEntry {
  count: number;
  reset_at: number;
}
