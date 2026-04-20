import { z } from "zod";
import {
  BASE_TAGS,
  CN_PROVINCES,
  PROJECT_STATUS,
  SKILL_TAGS,
} from "@/lib/features/_shared/enums";
import {
  dateRangeSchema,
  emojiSchema,
  httpsUrlSchema,
} from "@/lib/features/_shared/validators";

export const baseUpsertSchema = z.object({
  emoji: emojiSchema,
  name: z.string().trim().min(1, "请输入基地名称").max(30),
  province: z.enum(CN_PROVINCES),
  city: z.string().trim().min(1, "请输入城市").max(30),
  description: z.string().trim().max(1000),
  tags: z.array(z.enum(BASE_TAGS)).max(10),
  localLife: z.object({
    accommodations: z
      .array(
        z.object({
          name: z.string().trim().min(1).max(50),
          price: z.string().trim().min(1).max(30),
        }),
      )
      .max(20),
    coworking: z
      .array(z.object({ name: z.string().trim().min(1).max(50) }))
      .max(20),
    tourism: z
      .array(
        z.object({
          name: z.string().trim().min(1).max(50),
          customTags: z.array(z.string().trim().min(1).max(20)).max(6),
        }),
      )
      .max(20),
  }),
  applyUrl: httpsUrlSchema,
  skillsOffered: z.array(z.enum(SKILL_TAGS)).max(20),
  skillsNeeded: z.array(z.enum(SKILL_TAGS)).max(20),
  localProjects: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().trim().min(1).max(80),
        status: z.enum(PROJECT_STATUS),
        description: z.string().trim().max(1000),
        requiredSkills: z.array(z.enum(SKILL_TAGS)).max(20),
        period: dateRangeSchema,
      }),
    )
    .max(50),
  timeline: z
    .array(
      z.object({
        id: z.string().optional(),
        emoji: emojiSchema,
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        title: z.string().trim().min(1).max(80),
        description: z.string().trim().max(300),
      }),
    )
    .max(100),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
});
export type BaseUpsertInput = z.infer<typeof baseUpsertSchema>;
