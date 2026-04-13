"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Archive, Send, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { CoLearningActivity, ActivityStatus } from "@/lib/types";

const statusLabels: Record<ActivityStatus, string> = {
  DRAFT: "草稿",
  PUBLISHED: "已发布",
  ARCHIVED: "已归档",
};

export default function DashboardCoLearningPage() {
  const [activities, setActivities] = useState<CoLearningActivity[]>([]);
  const [tab, setTab] = useState<ActivityStatus | "ALL">("ALL");
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<CoLearningActivity | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    skill_category: "",
    facilitator_name: "",
    max_participants: 10,
    scheduled_start: "",
    duration_minutes: 60,
  });

  const loadActivities = useCallback(async () => {
    const params = new URLSearchParams();
    if (tab !== "ALL") params.set("status", tab);
    try {
      const { data } = await api.get<CoLearningActivity[]>(
        `/api/admin/co-learning/activities?${params}`
      );
      setActivities(data);
    } catch {
      toast.error("加载活动失败");
    }
  }, [tab]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const handleCreate = async () => {
    try {
      await api.post("/api/admin/co-learning/activities", {
        ...form,
        max_participants: Number(form.max_participants),
        duration_minutes: Number(form.duration_minutes),
      });
      toast.success("活动已创建");
      setCreateOpen(false);
      resetForm();
      loadActivities();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "创建失败");
    }
  };

  const handleUpdate = async () => {
    if (!editItem) return;
    try {
      await api.patch(`/api/admin/co-learning/activities/${editItem.id}`, {
        ...form,
        max_participants: Number(form.max_participants),
        duration_minutes: Number(form.duration_minutes),
      });
      toast.success("活动已更新");
      setEditItem(null);
      resetForm();
      loadActivities();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "更新失败");
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await api.post(`/api/admin/co-learning/activities/${id}/publish`);
      toast.success("活动已发布");
      loadActivities();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "发布失败");
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await api.post(`/api/admin/co-learning/activities/${id}/archive`);
      toast.success("活动已归档");
      loadActivities();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "归档失败");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/admin/co-learning/activities/${id}`);
      toast.success("活动已删除");
      loadActivities();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "删除失败");
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      skill_category: "",
      facilitator_name: "",
      max_participants: 10,
      scheduled_start: "",
      duration_minutes: 60,
    });
  };

  const openEdit = (act: CoLearningActivity) => {
    setEditItem(act);
    setForm({
      title: act.title,
      description: act.description,
      skill_category: act.skill_category,
      facilitator_name: act.facilitator_name,
      max_participants: act.max_participants,
      scheduled_start: act.scheduled_start.slice(0, 16),
      duration_minutes: act.duration_minutes,
    });
  };

  const renderForm = (onSubmit: () => void, submitLabel: string) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>标题</Label>
        <Input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          maxLength={100}
        />
      </div>
      <div className="space-y-2">
        <Label>描述</Label>
        <Textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          maxLength={2000}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>技能类别</Label>
          <Input
            value={form.skill_category}
            onChange={(e) =>
              setForm({ ...form, skill_category: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>主持人</Label>
          <Input
            value={form.facilitator_name}
            onChange={(e) =>
              setForm({ ...form, facilitator_name: e.target.value })
            }
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label>最大人数</Label>
          <Input
            type="number"
            min={1}
            value={form.max_participants}
            onChange={(e) =>
              setForm({
                ...form,
                max_participants: parseInt(e.target.value) || 1,
              })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>开始时间</Label>
          <Input
            type="datetime-local"
            value={form.scheduled_start}
            onChange={(e) =>
              setForm({ ...form, scheduled_start: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>时长(分钟)</Label>
          <Input
            type="number"
            min={1}
            value={form.duration_minutes}
            onChange={(e) =>
              setForm({
                ...form,
                duration_minutes: parseInt(e.target.value) || 1,
              })
            }
          />
        </div>
      </div>
      <Button onClick={onSubmit} className="w-full">
        {submitLabel}
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">共学活动管理</h2>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" />
              创建活动
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>创建共学活动</DialogTitle>
            </DialogHeader>
            {renderForm(handleCreate, "创建")}
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as ActivityStatus | "ALL")}>
        <TabsList>
          <TabsTrigger value="ALL">全部</TabsTrigger>
          <TabsTrigger value="DRAFT">草稿</TabsTrigger>
          <TabsTrigger value="PUBLISHED">已发布</TabsTrigger>
          <TabsTrigger value="ARCHIVED">已归档</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="mt-4 space-y-3">
          {activities.map((act) => (
            <Card key={act.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{act.title}</CardTitle>
                  <Badge variant="outline">{statusLabels[act.status]}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-sm text-muted-foreground line-clamp-1">
                  {act.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {new Date(act.scheduled_start).toLocaleString("zh-CN")} ·{" "}
                    {act.duration_minutes}分钟 · 最多{act.max_participants}人
                  </span>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => openEdit(act)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    {act.status === "DRAFT" && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => handlePublish(act.id)}
                      >
                        <Send className="h-3 w-3" />
                      </Button>
                    )}
                    {act.status === "PUBLISHED" && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => handleArchive(act.id)}
                      >
                        <Archive className="h-3 w-3" />
                      </Button>
                    )}
                    {act.status === "DRAFT" && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => handleDelete(act.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {activities.length === 0 && (
            <p className="py-8 text-center text-muted-foreground">暂无活动</p>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>编辑活动</DialogTitle>
          </DialogHeader>
          {renderForm(handleUpdate, "保存")}
        </DialogContent>
      </Dialog>
    </div>
  );
}
