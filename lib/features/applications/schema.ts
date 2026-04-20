import { z } from "zod";
import {
  INTEREST_TAGS,
  PAYMENT_STATUS,
  REVIEW_STATUS,
  DID_STATUS,
} from "@/lib/features/_shared/enums";
import {
  nicknameSchema,
  richTextSchema,
} from "@/lib/features/_shared/validators";

export const applicationFormSchema = z.object({
  nickname: nicknameSchema,
  selfIntro: z
    .string()
    .trim()
    .min(30, "自我介绍至少 30 字")
    .max(500, "自我介绍最多 500 字"),
  interestTags: z
    .array(z.enum(INTEREST_TAGS))
    .min(1, "至少选择 1 个领域")
    .max(6, "最多选择 6 个领域"),
  portfolio: richTextSchema(2000).optional(),
});
export type ApplicationFormInput = z.infer<typeof applicationFormSchema>;

export const rejectSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(10, "拒绝理由至少 10 字")
    .max(500, "拒绝理由最多 500 字"),
});
export type RejectInput = z.infer<typeof rejectSchema>;

export const assignDidSchema = z.object({
  didInfo: z
    .string()
    .trim()
    .min(4, "DID 信息过短")
    .max(200, "DID 信息最多 200 字"),
});

// Re-exported enum literals so consumers don't need to import from `_shared`.
export const PAYMENT_STATUSES = PAYMENT_STATUS;
export const REVIEW_STATUSES = REVIEW_STATUS;
export const DID_STATUSES = DID_STATUS;
