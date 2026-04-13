export type ActivityStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type RelationshipType = "LEARNING_PEER" | "TEACHER_STUDENT" | "MENTOR_MENTEE";

export interface CoLearningActivity {
  id: string;
  title: string;
  description: string;
  skill_category: string;
  facilitator_name: string;
  max_participants: number;
  scheduled_start: string;
  duration_minutes: number;
  status: ActivityStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Participant {
  id: string;
  activity_id: string;
  user_id: string;
  registered_at: string;
}

export interface TeachingSession {
  id: string;
  teacher_id: string;
  student_id: string;
  skill_id: string;
  duration_minutes: number;
  feedback_rating: number;
  completed: boolean;
  created_at: string;
}

export interface Relationship {
  id: string;
  user_a_id: string;
  user_b_id: string;
  type: RelationshipType;
  skill_id: string;
  last_interaction: string;
  created_at: string;
}

export interface CreateActivityPayload {
  title: string;
  description: string;
  skill_category: string;
  facilitator_name: string;
  max_participants: number;
  scheduled_start: string;
  duration_minutes: number;
}

export interface UpdateActivityPayload {
  title?: string;
  description?: string;
  skill_category?: string;
  facilitator_name?: string;
  max_participants?: number;
  scheduled_start?: string;
  duration_minutes?: number;
}
