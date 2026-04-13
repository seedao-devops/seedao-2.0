"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Header } from "@/components/layout/header";
import { RefreshCw, LogOut } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";

interface Profile {
  nickname: string;
  avatar_url: string;
  banner_url?: string;
  email?: string;
  phone?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [nickname, setNickname] = useState("");
  const [editingNickname, setEditingNickname] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get<Profile>("/api/profile/basic")
      .then(({ data }) => {
        setProfile(data);
        setNickname(data.nickname);
      })
      .catch(() => toast.error("加载个人资料失败"));
  }, []);

  const handleUpdateNickname = async () => {
    setLoading(true);
    try {
      const { data } = await api.patch<Profile>("/api/profile/basic", {
        nickname,
      });
      setProfile(data);
      setEditingNickname(false);
      toast.success("昵称已更新");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "更新失败");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateAvatar = async () => {
    try {
      const { data } = await api.patch<Profile>("/api/profile/basic", {
        regenerate_avatar: true,
      });
      setProfile(data);
      toast.success("头像已更新");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "更新失败");
    }
  };

  const handleChangePassword = async () => {
    setLoading(true);
    try {
      await api.patch("/api/profile/basic", {
        current_password: passwordForm.current,
        new_password: passwordForm.new,
      });
      setPasswordForm({ current: "", new: "" });
      setShowPasswordForm(false);
      toast.success("密码已更新");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "修改密码失败");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  if (!profile) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    );
  }

  return (
    <>
      <Header
        title="个人资料"
        actions={
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        }
      />
      <div className="space-y-4 p-4">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="relative">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback>
                  {profile.nickname.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="outline"
                size="icon"
                className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full"
                onClick={handleRegenerateAvatar}
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex-1">
              <p className="font-semibold">{profile.nickname}</p>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <p className="text-sm text-muted-foreground">{profile.phone}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">昵称</CardTitle>
          </CardHeader>
          <CardContent>
            {editingNickname ? (
              <div className="flex gap-2">
                <Input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="3-30字符"
                />
                <Button
                  onClick={handleUpdateNickname}
                  disabled={loading}
                  size="sm"
                >
                  保存
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingNickname(false);
                    setNickname(profile.nickname);
                  }}
                >
                  取消
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span>{profile.nickname}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingNickname(true)}
                >
                  修改
                </Button>
              </div>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              每30天最多修改3次
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">密码</CardTitle>
          </CardHeader>
          <CardContent>
            {showPasswordForm ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>当前密码</Label>
                  <Input
                    type="password"
                    value={passwordForm.current}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, current: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>新密码</Label>
                  <Input
                    type="password"
                    value={passwordForm.new}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, new: e.target.value })
                    }
                    placeholder="至少8位，包含字母和数字"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleChangePassword}
                    disabled={loading}
                    size="sm"
                  >
                    确认修改
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPasswordForm(false)}
                  >
                    取消
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPasswordForm(true)}
              >
                修改密码
              </Button>
            )}
          </CardContent>
        </Card>

        <Separator />

        <Button
          variant="destructive"
          className="w-full"
          onClick={handleLogout}
        >
          退出登录
        </Button>
      </div>
    </>
  );
}
