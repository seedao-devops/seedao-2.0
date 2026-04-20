"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Check, ExternalLink } from "lucide-react";
import {
  registerCredentialsSchema,
  type RegisterCredentialsInput,
} from "@/lib/features/auth/schema";
import {
  applicationFormSchema,
  type ApplicationFormInput,
} from "@/lib/features/applications/schema";
import { INTEREST_TAGS } from "@/lib/features/_shared/enums";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { TagPicker } from "@/components/ui/tag-picker";
import { cn } from "@/lib/utils";

const STEPS = ["账户", "申请表", "付款"] as const;

export function RegisterWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const credentialsForm = useForm<RegisterCredentialsInput>({
    resolver: zodResolver(registerCredentialsSchema),
    defaultValues: { phone: "", email: "", password: "", confirmPassword: "" },
  });
  const applicationForm = useForm<ApplicationFormInput>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      nickname: "",
      selfIntro: "",
      interestTags: [],
      portfolio: "",
    },
  });

  async function nextFromCredentials(values: RegisterCredentialsInput) {
    void values;
    setStep(1);
  }

  async function nextFromApplication(values: ApplicationFormInput) {
    setSubmitting(true);
    try {
      const credentials = credentialsForm.getValues();
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ credentials, application: values }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.error === "EMAIL_TAKEN") toast.error("邮箱已被注册");
        else if (data.error === "PHONE_TAKEN") toast.error("手机号已被注册");
        else if (data.error === "NICKNAME_TAKEN") toast.error("昵称已被使用");
        else toast.error("提交失败，请稍后重试");
        return;
      }
      toast.success("申请已提交");
      setStep(2);
    } finally {
      setSubmitting(false);
    }
  }

  async function markPaid() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/applications/me/mark-paid", { method: "POST" });
      if (!res.ok) {
        toast.error("更新失败");
        return;
      }
      toast.success("已记录为已付款，等待审核");
      router.push("/register");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-7 pt-2">
      <div className="space-y-2">
        <h1 className="text-3xl font-serif font-bold">申请加入 SeeDAO</h1>
        <p className="text-sm text-muted-foreground">
          完成下面三步后，社区管理员会在 1-3 个工作日内回复你
        </p>
      </div>
      <Stepper step={step} />

      {step === 0 ? (
        <Form {...credentialsForm}>
          <form
            onSubmit={credentialsForm.handleSubmit(nextFromCredentials)}
            className="space-y-4"
          >
            <FormField
              control={credentialsForm.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>手机号（可选）</FormLabel>
                  <FormControl>
                    <Input type="tel" inputMode="numeric" placeholder="13800138000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={credentialsForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>邮箱（可选）</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormDescription>手机号与邮箱至少填写一项</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={credentialsForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>密码</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormDescription>8-64 位，需同时包含字母与数字</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={credentialsForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>确认密码</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              下一步
            </Button>
          </form>
        </Form>
      ) : null}

      {step === 1 ? (
        <Form {...applicationForm}>
          <form
            onSubmit={applicationForm.handleSubmit(nextFromApplication)}
            className="space-y-4"
          >
            <FormField
              control={applicationForm.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>昵称 *</FormLabel>
                  <FormControl>
                    <Input placeholder="你想被怎么称呼？" {...field} />
                  </FormControl>
                  <FormDescription>2-30 个字符</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={applicationForm.control}
              name="selfIntro"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>自我介绍 *</FormLabel>
                  <FormControl>
                    <Textarea rows={5} placeholder="你是谁？最近在做什么？" {...field} />
                  </FormControl>
                  <FormDescription>30-500 字</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={applicationForm.control}
              name="interestTags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>感兴趣的领域 *</FormLabel>
                  <FormControl>
                    <TagPicker
                      options={INTEREST_TAGS}
                      value={field.value}
                      onChange={field.onChange}
                      max={6}
                    />
                  </FormControl>
                  <FormDescription>至少 1 项，最多 6 项</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={applicationForm.control}
              name="portfolio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>做过的项目/作品（可选）</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="链接、文字描述都可以"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(0)}>
                上一步
              </Button>
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? "提交中..." : "提交申请"}
              </Button>
            </div>
          </form>
        </Form>
      ) : null}

      {step === 2 ? (
        <div className="space-y-5">
          <div className="rounded-xl border bg-card p-5 space-y-3">
            <h3 className="font-serif text-lg font-semibold">最后一步：完成会费付款</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              点击下方链接前往支付页面（小程序 / 公众号）完成付款。回到此处后点击「我已付款」，
              我们将开始审核你的申请。
            </p>
            <Button asChild variant="outline" className="w-full">
              <a
                href="https://example.com/seedao-pay"
                target="_blank"
                rel="noreferrer"
              >
                前往付款
                <ExternalLink className="size-4" />
              </a>
            </Button>
          </div>
          <Button onClick={markPaid} className="w-full" disabled={submitting}>
            {submitting ? "更新中..." : "我已付款"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <ol className="flex items-center gap-3">
      {STEPS.map((label, i) => {
        const done = i < step;
        const active = i === step;
        return (
          <li key={label} className="flex items-center gap-2">
            <div
              className={cn(
                "size-7 rounded-full grid place-items-center text-xs border",
                done && "bg-primary text-primary-foreground border-primary",
                active && !done && "border-primary text-primary",
                !done && !active && "border-border text-muted-foreground",
              )}
            >
              {done ? <Check className="size-4" /> : i + 1}
            </div>
            <span
              className={cn(
                "text-sm",
                active ? "text-foreground font-medium" : "text-muted-foreground",
              )}
            >
              {label}
            </span>
            {i < STEPS.length - 1 ? <span className="text-muted-foreground">→</span> : null}
          </li>
        );
      })}
    </ol>
  );
}
