"use client";

import { useEffect, useState, use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Header } from "@/components/layout/header";
import { Plus, TrendingUp, Flame, Clock } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { Skill, GrowthLog, GrowthStats } from "@/lib/types";

export default function SkillDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [skill, setSkill] = useState<Skill | null>(null);
  const [stats, setStats] = useState<GrowthStats | null>(null);
  const [logs, setLogs] = useState<GrowthLog[]>([]);
  const [showLogForm, setShowLogForm] = useState(false);
  const [logForm, setLogForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    hours_spent: 1,
    place: "",
    notes: "",
  });

  const loadData = () => {
    api
      .get<Skill>(`/api/profile/skills/${id}`)
      .then(({ data }) => setSkill(data));
    api
      .get<{ stats: GrowthStats; logs: GrowthLog[] }>(
        `/api/profile/skills/${id}/growth`
      )
      .then(({ data }) => {
        setStats(data.stats);
        setLogs(data.logs);
      });
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleAddLog = async () => {
    try {
      await api.post(`/api/profile/skills/${id}/growth`, {
        ...logForm,
        hours_spent: Number(logForm.hours_spent),
      });
      toast.success("成长记录已添加");
      setShowLogForm(false);
      setLogForm({
        date: new Date().toISOString().slice(0, 10),
        hours_spent: 1,
        place: "",
        notes: "",
      });
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "添加失败");
    }
  };

  if (!skill) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    );
  }

  const maxWeeklyHour = stats
    ? Math.max(...stats.weekly_hours, 1)
    : 1;

  return (
    <>
      <Header title={skill.name} showBack />
      <div className="space-y-4 p-4">
        {stats && (
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="flex flex-col items-center pt-4 pb-3">
                <Clock className="mb-1 h-5 w-5 text-muted-foreground" />
                <p className="text-xl font-bold">{stats.total_hours}</p>
                <p className="text-xs text-muted-foreground">总时长</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center pt-4 pb-3">
                <Flame className="mb-1 h-5 w-5 text-muted-foreground" />
                <p className="text-xl font-bold">{stats.streak_days}</p>
                <p className="text-xs text-muted-foreground">连续天数</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center pt-4 pb-3">
                <TrendingUp className="mb-1 h-5 w-5 text-muted-foreground" />
                <p className="text-xl font-bold">
                  {stats.weekly_hours[3] ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">本周时长</p>
              </CardContent>
            </Card>
          </div>
        )}

        {stats && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">最近4周学习时长</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between gap-2 h-24">
                {stats.weekly_hours.map((hours, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t bg-primary"
                      style={{
                        height: `${(hours / maxWeeklyHour) * 80}px`,
                        minHeight: hours > 0 ? "4px" : "0px",
                      }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {hours}h
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                <span>3周前</span>
                <span>2周前</span>
                <span>上周</span>
                <span>本周</span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-between">
          <h2 className="font-semibold">成长记录</h2>
          <Button size="sm" onClick={() => setShowLogForm(!showLogForm)}>
            <Plus className="mr-1 h-4 w-4" />
            记录
          </Button>
        </div>

        {showLogForm && (
          <Card>
            <CardContent className="space-y-3 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>日期</Label>
                  <Input
                    type="date"
                    value={logForm.date}
                    onChange={(e) =>
                      setLogForm({ ...logForm, date: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>时长（小时）</Label>
                  <Input
                    type="number"
                    min={1}
                    value={logForm.hours_spent}
                    onChange={(e) =>
                      setLogForm({
                        ...logForm,
                        hours_spent: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label>地点</Label>
                <Input
                  value={logForm.place}
                  onChange={(e) =>
                    setLogForm({ ...logForm, place: e.target.value })
                  }
                  placeholder="学习地点"
                />
              </div>
              <div className="space-y-1">
                <Label>笔记（选填）</Label>
                <Textarea
                  value={logForm.notes}
                  onChange={(e) =>
                    setLogForm({ ...logForm, notes: e.target.value })
                  }
                />
              </div>
              <Button onClick={handleAddLog} className="w-full">
                提交
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="space-y-2">
          {logs.map((log) => (
            <Card key={log.id}>
              <CardContent className="flex items-center justify-between pt-4 pb-3">
                <div>
                  <p className="text-sm font-medium">{log.place}</p>
                  <p className="text-xs text-muted-foreground">
                    {log.date.slice(0, 10)}
                    {log.notes && ` · ${log.notes}`}
                  </p>
                </div>
                <span className="text-sm font-medium">{log.hours_spent}h</span>
              </CardContent>
            </Card>
          ))}
          {logs.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              暂无成长记录
            </p>
          )}
        </div>
      </div>
    </>
  );
}
