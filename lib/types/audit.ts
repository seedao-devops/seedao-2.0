export type AuditStatus = "PENDING" | "APPROVED" | "REJECTED";

export type InternalTier = "TIER_1" | "TIER_2" | "TIER_3";

export interface AuditItem {
  id: string;
  user_id: string;
  email: string;
  phone: string;
  nickname?: string;
  status: AuditStatus;
  internal_tier?: InternalTier;
  remarks?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface AuditHistoryLog {
  id: string;
  audit_item_id: string;
  actor_id: string;
  old_status: AuditStatus;
  new_status: AuditStatus;
  timestamp: string;
  ip_address: string;
}

export interface AuditApprovePayload {
  internal_tier: InternalTier;
  remarks?: string;
}

export interface AuditRejectPayload {
  reason: string;
}

export interface AuditListParams {
  limit?: number;
  offset?: number;
  sort_by?: "created_at" | "status";
  sort_order?: "asc" | "desc";
  status?: AuditStatus[];
  start_date?: string;
  end_date?: string;
}
