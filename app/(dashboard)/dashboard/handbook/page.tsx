"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Send, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { Handbook, HandbookStatus } from "@/lib/types";

const statusLabels: Record<HandbookStatus, string> = {
  DRAFT: "草稿",
  PUBLISHED: "已发布",
  DELETED: "已删除",
};

export default function DashboardHandbookPage() {
  const [handbooks, setHandbooks] = useState<Handbook[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<Handbook | null>(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    cover_image_url: "",
  });

  const loadHandbooks = useCallback(async () => {
    try {
      const { data } = await api.get<Handbook[]>("/api/admin/handbook");
      setHandbooks(data);
    } catch {
      toast.error("加载手册失败");
    }
  }, []);

  useEffect(() => {
    loadHandbooks();
  }, [loadHandbooks]);

  const handleCreate = async () => {
    try {
      await api.post("/api/admin/handbook", {
        title: form.title,
        slug: form.slug || undefined,
        excerpt: form.excerpt || undefined,
        content: form.content,
        cover_image_url: form.cover_image_url || undefined,
      });
      toast.success("手册已创建");
      setCreateOpen(false);
      resetForm();
      loadHandbooks();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "创建失败");
    }
  };

  const handleUpdate = async () => {
    if (!editItem) return;
    try {
      await api.patch(`/api/admin/handbook/${editItem.id}`, {
        title: form.title,
        slug: form.slug || undefined,
        excerpt: form.excerpt || undefined,
        content: form.content,
        cover_image_url: form.cover_image_url || undefined,
      });
      toast.success("手册已更新（新版本已创建）");
      setEditItem(null);
      resetForm();
      loadHandbooks();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "更新失败");
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await api.post(`/api/admin/handbook/${id}/publish`);
      toast.success("手册已发布");
      loadHandbooks();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "发布失败");
    }
  };

  const handleDelete = async (id: string) => {
    const message = prompt("请输入删除说明：");
    if (!message) return;
    try {
      await api.delete(`/api/admin/handbook/${id}`, {
        deletion_message: message,
      });
      toast.success("手册已删除");
      loadHandbooks();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "删除失败");
    }
  };

  const resetForm = () => {
    setForm({ title: "", slug: "", excerpt: "", content: "", cover_image_url: "" });
  };

  const openEdit = (hb: Handbook) => {
    setEditItem(hb);
    setForm({
      title: hb.title,
      slug: hb.slug,
      excerpt: hb.excerpt ?? "",
      content: hb.content,
      cover_image_url: hb.cover_image_url ?? "",
    });
  };

  const renderForm = (onSubmit: () => void, submitLabel: string) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>标题</Label>
        <Input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          maxLength={120}
        />
      </div>
      <div className="space-y-2">
        <Label>Slug（留空自动生成）</Label>
        <Input
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          placeholder="url-friendly-slug"
        />
      </div>
      <div className="space-y-2">
        <Label>摘要（选填）</Label>
        <Input
          value={form.excerpt}
          onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
          maxLength={300}
        />
      </div>
      <div className="space-y-2">
        <Label>内容（Markdown）</Label>
        <Textarea
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          rows={10}
          placeholder="# 标题&#10;&#10;正文内容..."
        />
      </div>
      <div className="space-y-2">
        <Label>封面图 URL（选填）</Label>
        <Input
          value={form.cover_image_url}
          onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })}
          placeholder="https://..."
        />
      </div>
      <Button onClick={onSubmit} className="w-full">
        {submitLabel}
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">手册管理</h2>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" />
              创建手册
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>创建手册</DialogTitle>
            </DialogHeader>
            {renderForm(handleCreate, "创建")}
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {handbooks.map((hb) => (
          <Card key={hb.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{hb.title}</CardTitle>
                <Badge
                  variant={
                    hb.status === "PUBLISHED"
                      ? "secondary"
                      : hb.status === "DELETED"
                        ? "destructive"
                        : "outline"
                  }
                >
                  {statusLabels[hb.status]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-1 text-xs text-muted-foreground">
                /{hb.slug}
              </p>
              {hb.excerpt && (
                <p className="mb-3 text-sm text-muted-foreground line-clamp-1">
                  {hb.excerpt}
                </p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {hb.published_at
                    ? `发布于 ${new Date(hb.published_at).toLocaleDateString("zh-CN")}`
                    : `创建于 ${new Date(hb.created_at).toLocaleDateString("zh-CN")}`}
                </span>
                {hb.status !== "DELETED" && (
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => openEdit(hb)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    {hb.status === "DRAFT" && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => handlePublish(hb.id)}
                      >
                        <Send className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => handleDelete(hb.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {handbooks.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">暂无手册</p>
        )}
      </div>

      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑手册</DialogTitle>
          </DialogHeader>
          {renderForm(handleUpdate, "保存")}
        </DialogContent>
      </Dialog>
    </div>
  );
}
