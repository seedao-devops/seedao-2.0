"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
import { Textarea } from "@/components/ui/textarea";
import { Header } from "@/components/layout/header";
import { Plus, Clock } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { Skill, SkillLevel } from "@/lib/types";

const levelLabels: Record<SkillLevel, string> = {
  BEGINNER: "入门",
  INTERMEDIATE: "中级",
  ADVANCED: "高级",
  EXPERT: "专家",
};

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    level: "BEGINNER" as SkillLevel,
  });

  useEffect(() => {
    api
      .get<Skill[]>("/api/profile/skills")
      .then(({ data }) => setSkills(data))
      .catch(() => toast.error("加载技能失败"));
  }, []);

  const handleCreate = async () => {
    try {
      const { data } = await api.post<Skill>("/api/profile/skills", form);
      setSkills([...skills, data]);
      setOpen(false);
      setForm({ name: "", description: "", level: "BEGINNER" });
      toast.success("技能已添加");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "添加失败");
    }
  };

  return (
    <>
      <Header
        title="我的技能"
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
                <DialogTitle>添加技能</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>技能名称</Label>
                  <Input
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    placeholder="最多50字"
                    maxLength={50}
                  />
                </div>
                <div className="space-y-2">
                  <Label>描述</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="最多500字（选填）"
                    maxLength={500}
                  />
                </div>
                <div className="space-y-2">
                  <Label>等级</Label>
                  <Select
                    value={form.level}
                    onValueChange={(v) =>
                      setForm({ ...form, level: v as SkillLevel })
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
                <Button onClick={handleCreate} className="w-full">
                  添加
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="space-y-3 p-4">
        {skills.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            还没有添加任何技能
          </p>
        ) : (
          skills.map((skill) => (
            <Link key={skill.id} href={`/profile/skills/${skill.id}`}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardContent className="flex items-center justify-between pt-6">
                  <div>
                    <p className="font-medium">{skill.name}</p>
                    {skill.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {skill.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{skill.total_hours}h</span>
                    </div>
                    <Badge variant="secondary">
                      {levelLabels[skill.level]}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </>
  );
}
