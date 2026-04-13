export type SkillLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";

export type WishlistPriority = "HIGH" | "MEDIUM" | "LOW";

export interface Skill {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  level: SkillLevel;
  total_hours: number;
  created_at: string;
  updated_at: string;
}

export interface GrowthLog {
  id: string;
  skill_id: string;
  user_id: string;
  date: string;
  hours_spent: number;
  place: string;
  notes?: string;
  evidence_url?: string;
  created_at: string;
}

export interface GrowthStats {
  total_hours: number;
  streak_days: number;
  weekly_hours: number[];
}

export interface WishlistItem {
  id: string;
  user_id: string;
  skill_name: string;
  target_level: SkillLevel;
  priority: WishlistPriority;
  public: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSkillPayload {
  name: string;
  description?: string;
  level: SkillLevel;
}

export interface CreateGrowthLogPayload {
  date: string;
  hours_spent: number;
  place: string;
  notes?: string;
  evidence_url?: string;
}

export interface CreateWishlistPayload {
  skill_name: string;
  target_level: SkillLevel;
  priority: WishlistPriority;
}
