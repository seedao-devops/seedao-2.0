/**
 * Reusable Zod primitives. Feature schemas import these so a rule (e.g. the
 * nickname regex or the URL allowlist) is defined exactly once.
 */

import { z } from "zod";
import sanitizeHtml from "sanitize-html";

const NICKNAME_REGEX = /^[\p{L}\p{N}_\-·.]+$/u;

export const nicknameSchema = z
  .string()
  .trim()
  .min(2, "昵称至少 2 个字符")
  .max(30, "昵称最多 30 个字符")
  .regex(NICKNAME_REGEX, "昵称只能包含字母、数字、下划线、连字符、句点");

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^1[3-9]\d{9}$/, "请输入有效的中国大陆手机号");

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("邮箱格式不正确")
  .max(254);

export const passwordSchema = z
  .string()
  .min(8, "密码至少 8 位")
  .max(64, "密码最多 64 位")
  .refine(
    (v) => /[A-Za-z]/.test(v) && /\d/.test(v),
    "密码需同时包含字母与数字",
  );

export const httpsUrlSchema = z
  .string()
  .trim()
  .url("请输入有效的 URL")
  .max(500)
  .refine((v) => /^https?:\/\//.test(v), "URL 必须以 http(s) 开头");

// Single emoji grapheme — matches one Extended_Pictographic codepoint.
export const emojiSchema = z
  .string()
  .trim()
  .min(1)
  .max(8)
  .regex(/\p{Extended_Pictographic}/u, "请输入一个 emoji");

export const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式应为 YYYY-MM-DD");

export const dateRangeSchema = z
  .object({
    start: dateStringSchema,
    end: dateStringSchema,
  })
  .refine((r) => r.start <= r.end, {
    message: "结束日期不能早于开始日期",
    path: ["end"],
  });

export function sanitizeRich(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: [
      "p", "br", "b", "i", "em", "strong", "u", "a", "ul", "ol", "li",
      "h2", "h3", "h4", "blockquote", "code", "pre", "img",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title"],
    },
    allowedSchemes: ["http", "https", "mailto"],
  });
}

export const richTextSchema = (max: number) =>
  z
    .string()
    .max(max, `最长 ${max} 个字符`)
    .transform((v) => sanitizeRich(v));
