import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { store } from "@/lib/fake-data/db";
import { parseToken } from "@/lib/utils/auth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const session = token ? parseToken(token) : null;
  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const relationships = store.relationships.filter(
    (r) => r.user_a_id === session.user_id || r.user_b_id === session.user_id
  );

  const enriched = relationships.map((r) => {
    const otherId =
      r.user_a_id === session.user_id ? r.user_b_id : r.user_a_id;
    const otherProfile = store.profiles.find((p) => p.user_id === otherId);
    const skill = store.skills.find((s) => s.id === r.skill_id);

    return {
      ...r,
      other_nickname: otherProfile?.nickname ?? "未知用户",
      skill_name: skill?.name ?? "未知技能",
    };
  });

  return NextResponse.json(enriched);
}
