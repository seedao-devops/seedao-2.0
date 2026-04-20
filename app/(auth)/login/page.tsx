"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { loginSchema, type LoginInput } from "@/lib/features/auth/schema";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const redirect = search.get("redirect") || "/journey";
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState<"phone" | "email">("phone");

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: "", email: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    setSubmitting(true);
    try {
      const body =
        tab === "phone"
          ? { phone: values.phone, password: values.password }
          : { email: values.email, password: values.password };
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error("登录失败，请检查账号与密码");
        return;
      }
      if (data.role === "admin") {
        router.push("/admin/applications");
      } else {
        router.push(redirect);
      }
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8 pt-2">
      <div className="space-y-2">
        <h1 className="text-3xl font-serif font-bold">欢迎回来</h1>
        <p className="text-sm text-muted-foreground">登录后查看你的旅程</p>
      </div>
      <Tabs value={tab} onValueChange={(v) => setTab(v as "phone" | "email")}>
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="phone">手机号</TabsTrigger>
          <TabsTrigger value="email">邮箱</TabsTrigger>
        </TabsList>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-5">
            <TabsContent value="phone" className="m-0">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>手机号</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        inputMode="numeric"
                        placeholder="13800138000"
                        autoComplete="tel"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
            <TabsContent value="email" className="m-0">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>邮箱</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        autoComplete="username"
                        placeholder="you@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>密码</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="current-password"
                      {...field}
                    />
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
      </Tabs>
      <p className="text-sm text-center text-muted-foreground">
        还没有账户？
        <Link href="/register" className="text-primary font-medium ml-1 hover:underline">
          申请加入
        </Link>
      </p>
    </div>
  );
}
