export interface UserProfile {
  id: string;
  user_id: string;
  nickname: string;
  avatar_url: string;
  banner_url?: string;
  created_at: string;
  updated_at: string;
}

export interface NicknameHistory {
  id: string;
  user_id: string;
  old_nickname: string;
  new_nickname: string;
  changed_at: string;
}

export interface AvatarRegenLog {
  id: string;
  user_id: string;
  regenerated_at: string;
}

export interface UpdateProfilePayload {
  nickname?: string;
  banner_url?: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}
