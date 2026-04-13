"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/header";
import { Calendar, Clock, Users } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { CoLearningActivity } from "@/lib/types";

export default function PublicCoLearningPage() {
  const [activities, setActivities] = useState<CoLearningActivity[]>([]);

  useEffect(() => {
    api
      .get<CoLearningActivity[]>("/api/co-learning/activities")
      .then(({ data }) => setActivities(data))
      .catch(() => toast.error("加载活动失败"));
  }, []);

  return (
    <>
      <Header title="共学活动" />
      <div className="space-y-3 p-4">
        {activities.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            暂无公开活动
          </p>
        ) : (
          activities.map((act) => (
            <Card key={act.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{act.title}</CardTitle>
                  <Badge variant="outline">{act.skill_category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
                  {act.description}
                </p>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(act.scheduled_start).toLocaleDateString("zh-CN")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {act.duration_minutes}分钟
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    最多{act.max_participants}人
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  主持人：{act.facilitator_name}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </>
  );
}
