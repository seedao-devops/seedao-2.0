"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Header } from "@/components/layout/header";
import { Plus, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { WishlistItem, SkillLevel, WishlistPriority } from "@/lib/types";

const levelLabels: Record<SkillLevel, string> = {
  BEGINNER: "入门",
  INTERMEDIATE: "中级",
  ADVANCED: "高级",
  EXPERT: "专家",
};

const priorityLabels: Record<WishlistPriority, string> = {
  HIGH: "高",
  MEDIUM: "中",
  LOW: "低",
};

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    skill_name: "",
    target_level: "BEGINNER" as SkillLevel,
    priority: "MEDIUM" as WishlistPriority,
  });

  useEffect(() => {
    api
      .get<WishlistItem[]>("/api/profile/wishlist")
      .then(({ data }) => setItems(data))
      .catch(() => toast.error("加载愿望清单失败"));
  }, []);

  const handleCreate = async () => {
    try {
      const { data } = await api.post<WishlistItem>(
        "/api/profile/wishlist",
        form
      );
      setItems([...items, data]);
      setOpen(false);
      setForm({ skill_name: "", target_level: "BEGINNER", priority: "MEDIUM" });
      toast.success("已添加到愿望清单");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "添加失败");
    }
  };

  const toggleVisibility = async (item: WishlistItem) => {
    try {
      const { data } = await api.patch<WishlistItem>(
        `/api/profile/wishlist/${item.id}/visibility`,
        { public: !item.public }
      );
      setItems(items.map((i) => (i.id === item.id ? data : i)));
    } catch {
      toast.error("更新失败");
    }
  };

  return (
    <>
      <Header
        title="学习愿望"
        showBack
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-1 h-4 w-4" />
                添加
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>添加学习愿望</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>想学的技能</Label>
                  <Input
                    value={form.skill_name}
                    onChange={(e) =>
                      setForm({ ...form, skill_name: e.target.value })
                    }
                    placeholder="技能名称"
                  />
                </div>
                <div className="space-y-2">
                  <Label>目标等级</Label>
                  <Select
                    value={form.target_level}
                    onValueChange={(v) =>
                      setForm({ ...form, target_level: v as SkillLevel })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(levelLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>优先级</Label>
                  <Select
                    value={form.priority}
                    onValueChange={(v) =>
                      setForm({ ...form, priority: v as WishlistPriority })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(priorityLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreate} className="w-full">
                  添加
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="space-y-3 p-4">
        {items.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            还没有添加学习愿望
          </p>
        ) : (
          items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex items-center justify-between pt-4 pb-3">
                <div>
                  <p className="font-medium">{item.skill_name}</p>
                  <div className="mt-1 flex gap-2">
                    <Badge variant="outline">
                      目标：{levelLabels[item.target_level]}
                    </Badge>
                    <Badge variant="secondary">
                      {priorityLabels[item.priority]}优先
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleVisibility(item)}
                  title={item.public ? "设为私密" : "设为公开"}
                >
                  {item.public ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </>
  );
}
