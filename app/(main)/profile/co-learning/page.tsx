"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/header";
import { Users, GraduationCap, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { RelationshipType } from "@/lib/types";

interface EnrichedRelationship {
  id: string;
  type: RelationshipType;
  other_nickname: string;
  skill_name: string;
  last_interaction: string;
}

const typeConfig: Record<
  RelationshipType,
  { label: string; icon: React.ElementType }
> = {
  LEARNING_PEER: { label: "学习伙伴", icon: Users },
  TEACHER_STUDENT: { label: "师生", icon: GraduationCap },
  MENTOR_MENTEE: { label: "导师学员", icon: UserCheck },
};

export default function CoLearningRelationsPage() {
  const [relationships, setRelationships] = useState<EnrichedRelationship[]>(
    []
  );

  useEffect(() => {
    api
      .get<EnrichedRelationship[]>("/api/co-learning/relationships")
      .then(({ data }) => setRelationships(data))
      .catch(() => toast.error("加载共学关系失败"));
  }, []);

  const grouped = Object.entries(typeConfig).map(([type, config]) => ({
    ...config,
    type,
    items: relationships.filter((r) => r.type === type),
  }));

  return (
    <>
      <Header title="共学关系" showBack />
      <div className="space-y-6 p-4">
        {grouped.map((group) => (
          <div key={group.type}>
            <div className="mb-2 flex items-center gap-2">
              <group.icon className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">{group.label}</h2>
              <Badge variant="secondary" className="text-xs">
                {group.items.length}
              </Badge>
            </div>
            {group.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">暂无</p>
            ) : (
              <div className="space-y-2">
                {group.items.map((rel) => (
                  <Card key={rel.id}>
                    <CardContent className="flex items-center justify-between pt-4 pb-3">
                      <div>
                        <p className="font-medium">{rel.other_nickname}</p>
                        <p className="text-xs text-muted-foreground">
                          技能：{rel.skill_name}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {rel.last_interaction.slice(0, 10)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ))}
        {relationships.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">
            通过参与教学活动建立共学关系
          </p>
        )}
      </div>
    </>
  );
}
