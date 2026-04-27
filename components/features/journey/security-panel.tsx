"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { changePasswordSchema, type ChangePasswordInput } from "@/lib/features/auth/schema";
import { ApiError, apiPost } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";

export function SecurityPanel({ contact }: { contact: { phone?: string; email?: string } }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { code: "", newPassword: "" },
  });

  function sendCode() {
    setCodeSent(true);
    toast.success(`验证码已发送到 ${contact.phone || contact.email}（开发环境固定为 000000）`);
  }

  async function onSubmit(values: ChangePasswordInput) {
    setSubmitting(true);
    try {
      try {
        await apiPost("/api/auth/change-password", values);
        toast.success("密码已更新");
        form.reset();
        setCodeSent(false);
      } catch (err) {
        if (err instanceof ApiError) {
          toast.error(err.code === "INVALID_CODE" ? "验证码错误" : "更新失败");
        } else {
          throw err;
        }
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function logout() {
    await apiPost("/api/auth/logout").catch(() => {});
    router.push("/");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <Card className="p-5 space-y-3">
        <h3 className="font-serif text-lg font-semibold">绑定信息</h3>
        <div className="text-sm space-y-1.5">
          {contact.phone ? <p>手机：<span className="text-muted-foreground">{contact.phone}</span></p> : null}
          {contact.email ? <p>邮箱：<span className="text-muted-foreground">{contact.email}</span></p> : null}
        </div>
      </Card>

      <Card className="p-5 space-y-4">
        <h3 className="font-serif text-lg font-semibold">修改密码</h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Button type="button" variant="outline" className="w-full" onClick={sendCode}>
                {codeSent ? "重新发送验证码" : `发送验证码到 ${contact.phone || contact.email}`}
              </Button>
            </div>
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>验证码</FormLabel>
                  <FormControl>
                    <Input inputMode="numeric" autoComplete="one-time-code" {...field} />
                  </FormControl>
                  <FormDescription>开发环境固定为 000000</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>新密码</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormDescription>8-64 位，需同时包含字母与数字</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "更新中..." : "确认修改"}
            </Button>
          </form>
        </Form>
      </Card>

      <Button variant="ghost" className="w-full" onClick={logout}>
        退出登录
      </Button>
    </div>
  );
}
