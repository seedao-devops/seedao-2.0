import { z } from "zod";
import { LEVEL_TAGS, SKILL_TAGS } from "@/lib/features/_shared/enums";
import { dateRangeSchema } from "@/lib/features/_shared/validators";

export const coLearningUpsertSchema = z.object({
  name: z.string().trim().min(1, "请输入活动名称").max(80),
  instructorName: z.string().trim().min(1, "请输入讲师").max(30),
  baseId: z.string().min(1, "请选择基地"),
  skillTags: z.array(z.enum(SKILL_TAGS)).min(1, "至少选择 1 个技能").max(10),
  level: z.enum(LEVEL_TAGS),
  period: dateRangeSchema,
});
export type CoLearningUpsertInput = z.infer<typeof coLearningUpsertSchema>;
