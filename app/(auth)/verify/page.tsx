"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { api } from "@/lib/api-client";

export default function VerifyPage() {
  const router = useRouter();
  const [phoneCode, setPhoneCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post<{
        status: string;
        email_verified: boolean;
        phone_verified: boolean;
      }>("/api/auth/verify", {
        user_id: "current",
        type: "PHONE",
        code: phoneCode,
      });

      if (data.email_verified && data.phone_verified) {
        toast.success("验证成功！您的申请已提交审核");
        router.push("/login");
      } else {
        toast.info("请完成所有验证步骤");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "验证失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-2xl">验证</CardTitle>
        <CardDescription className="text-center">
          请输入手机收到的验证码完成验证
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phoneCode">短信验证码</Label>
            <Input
              id="phoneCode"
              type="text"
              placeholder="6位验证码"
              maxLength={6}
              value={phoneCode}
              onChange={(e) => setPhoneCode(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "验证中..." : "提交验证"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          验证通过后，您的申请将进入审核流程。审核结果将通过邮件和短信通知您。
        </p>
      </CardContent>
    </Card>
  );
}
