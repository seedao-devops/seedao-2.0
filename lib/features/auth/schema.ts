import { z } from "zod";
import {
  emailSchema,
  passwordSchema,
  phoneSchema,
} from "@/lib/features/_shared/validators";

/** Validate an identifier pair (at least one of phone/email present + valid). */
function validateIdentifier(
  v: { phone?: string; email?: string },
  ctx: z.RefinementCtx,
) {
  const phone = v.phone?.trim();
  const email = v.email?.trim();
  if (!phone && !email) {
    ctx.addIssue({
      code: "custom",
      path: ["email"],
      message: "请填写手机号或邮箱",
    });
    return;
  }
  if (phone) {
    const r = phoneSchema.safeParse(phone);
    if (!r.success) {
      ctx.addIssue({
        code: "custom",
        path: ["phone"],
        message: r.error.issues[0]?.message ?? "手机号格式不正确",
      });
    }
  }
  if (email) {
    const r = emailSchema.safeParse(email);
    if (!r.success) {
      ctx.addIssue({
        code: "custom",
        path: ["email"],
        message: r.error.issues[0]?.message ?? "邮箱格式不正确",
      });
    }
  }
}

export const loginSchema = z
  .object({
    phone: z.string(),
    email: z.string(),
    password: z.string().min(1, "请输入密码"),
  })
  .superRefine((v, ctx) => validateIdentifier(v, ctx));
export type LoginInput = z.infer<typeof loginSchema>;

export const registerCredentialsSchema = z
  .object({
    phone: z.string(),
    email: z.string(),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .superRefine((v, ctx) => {
    validateIdentifier(v, ctx);
    if (v.password !== v.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "两次输入的密码不一致",
      });
    }
  });
export type RegisterCredentialsInput = z.infer<typeof registerCredentialsSchema>;

export const changePasswordSchema = z.object({
  code: z.string().min(4, "请输入验证码"),
  newPassword: passwordSchema,
});
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
