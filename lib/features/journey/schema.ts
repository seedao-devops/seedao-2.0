import { z } from "zod";
import {
  WORK_TYPES,
  WISH_CATEGORIES,
} from "@/lib/features/_shared/enums";
import {
  dateRangeSchema,
  nicknameSchema,
} from "@/lib/features/_shared/validators";

const staySchema = z
  .object({
    baseId: z.string().optional(),
    baseNameFree: z.string().trim().max(50).optional(),
    location: z.string().trim().max(80),
    period: dateRangeSchema,
  })
  .refine((s) => Boolean(s.baseId || s.baseNameFree), {
    message: "请选择基地或填写基地名称",
    path: ["baseNameFree"],
  });

const learningRecordSchema = z.object({
  eventId: z.string().min(1),
});

const teachingRecordSchema = z.object({
  eventId: z.string().min(1),
  studentCount: z.number().int().min(0).max(999),
});

const workSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1).max(80),
  type: z.enum(WORK_TYPES),
  baseId: z.string().min(1),
  period: dateRangeSchema,
  description: z.string().trim().max(1000),
  collaborators: z.string().trim().max(200).optional(),
});

const wishSchema = z.object({
  skillName: z.string().trim().min(1).max(30),
  category: z.enum(WISH_CATEGORIES),
});

const fieldVisibilitySchema = z.object({
  avatar: z.boolean(),
  bio: z.boolean(),
  stays: z.boolean(),
  learning: z.boolean(),
  teaching: z.boolean(),
  works: z.boolean(),
  wishToLearn: z.boolean(),
});

export const journeyUpsertSchema = z.object({
  avatarUrl: z.string().trim().max(500),
  displayName: nicknameSchema,
  bio: z.string().trim().max(500),
  stays: z.array(staySchema).max(50),
  learningRecords: z.array(learningRecordSchema).max(200),
  teachingRecords: z.array(teachingRecordSchema).max(200),
  works: z.array(workSchema).max(100),
  wishToLearn: z.array(wishSchema).max(50),
  fieldVisibility: fieldVisibilitySchema,
});
export type JourneyUpsertInput = z.infer<typeof journeyUpsertSchema>;
