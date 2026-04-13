import type {
  User,
  VerificationToken,
  AuditItem,
  AuditHistoryLog,
  UserProfile,
  NicknameHistory,
  AvatarRegenLog,
  Skill,
  GrowthLog,
  WishlistItem,
  CoLearningActivity,
  Participant,
  TeachingSession,
  Relationship,
  Handbook,
  HandbookVersion,
  HandbookRedirect,
  RateLimitEntry,
} from "@/lib/types";

export interface Store {
  users: User[];
  verification_tokens: VerificationToken[];
  audit_items: AuditItem[];
  audit_history_logs: AuditHistoryLog[];
  profiles: UserProfile[];
  nickname_histories: NicknameHistory[];
  avatar_regen_logs: AvatarRegenLog[];
  skills: Skill[];
  growth_logs: GrowthLog[];
  wishlist_items: WishlistItem[];
  activities: CoLearningActivity[];
  participants: Participant[];
  teaching_sessions: TeachingSession[];
  relationships: Relationship[];
  handbooks: Handbook[];
  handbook_versions: HandbookVersion[];
  handbook_redirects: HandbookRedirect[];
  rate_limits: Map<string, RateLimitEntry>;
}

export const store: Store = {
  users: [],
  verification_tokens: [],
  audit_items: [],
  audit_history_logs: [],
  profiles: [],
  nickname_histories: [],
  avatar_regen_logs: [],
  skills: [],
  growth_logs: [],
  wishlist_items: [],
  activities: [],
  participants: [],
  teaching_sessions: [],
  relationships: [],
  handbooks: [],
  handbook_versions: [],
  handbook_redirects: [],
  rate_limits: new Map(),
};
