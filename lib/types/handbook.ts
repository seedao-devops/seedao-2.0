export type HandbookStatus = "DRAFT" | "PUBLISHED" | "DELETED";

export interface Handbook {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  cover_image_url?: string;
  cover_thumbnail_url?: string;
  status: HandbookStatus;
  deletion_message?: string;
  published_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface HandbookVersion {
  id: string;
  handbook_id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  cover_image_url?: string;
  is_current: boolean;
  version_number: number;
  created_at: string;
}

export interface HandbookRedirect {
  id: string;
  handbook_id: string;
  old_slug: string;
  new_slug: string;
  created_at: string;
}

export interface CreateHandbookPayload {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  cover_image_url?: string;
}

export interface UpdateHandbookPayload {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  cover_image_url?: string;
}
