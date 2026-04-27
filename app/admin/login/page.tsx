"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { DevQuickLogin } from "@/components/features/auth/dev-quick-login";
import { ApiError, apiPost } from "@/lib/api-client";

const adminLoginSchema = z.object({
  email: z.string().email("请输入有效邮箱"),
  password: z.string().min(1, "请输入密码"),
});
type FormData = z.infer<typeof adminLoginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<FormData>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: FormData) {
    setSubmitting(true);
    try {
      try {
        const data = await apiPost<{ ok: true; role: "admin" | "user" }>(
          "/api/auth/login",
          { email: values.email, password: values.password },
        );
        if (data.role !== "admin") {
          toast.error("此账号无管理员权限");
          await apiPost("/api/auth/logout").catch(() => {});
          return;
        }
        toast.success("登录成功");
        router.push("/admin");
        router.refresh();
      } catch (err) {
        if (err instanceof ApiError) {
          toast.error("登录失败，请检查邮箱与密码");
        } else {
          throw err;
        }
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-dvh grid place-items-center bg-muted/30 px-4">
      <Card className="w-full max-w-sm p-7 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-serif font-bold">SeeDAO 控制台</h1>
          <p className="text-sm text-muted-foreground">仅限管理员登录</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>邮箱</FormLabel>
                  <FormControl>
                    <Input type="email" autoComplete="username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>密码</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="current-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "登录中..." : "登录"}
            </Button>
          </form>
        </Form>
        <DevQuickLogin filter="admin" redirect="/admin" />
      </Card>
    </div>
  );
}
