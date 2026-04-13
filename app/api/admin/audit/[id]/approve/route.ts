import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { store, findById, generateId } from "@/lib/fake-data/db";
import { parseToken } from "@/lib/utils/auth";

const approveSchema = z.object({
  internal_tier: z.enum(["TIER_1", "TIER_2", "TIER_3"]),
  remarks: z.string().max(500).optional(),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const token = request.cookies.get("auth_token")?.value;
  const session = token ? parseToken(token) : null;

  if (!session || session.scope !== "audit:write") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const item = findById(store.audit_items, id);
  if (!item) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  if (item.status !== "PENDING") {
    return NextResponse.json(
      { error: "CONFLICT", message: "Item is not in a pending state." },
      { status: 409 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const parsed = approveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { internal_tier, remarks } = parsed.data;
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";

  store.audit_history_logs.push({
    id: generateId("ahl"),
    audit_item_id: id,
    actor_id: session.user_id,
    old_status: item.status,
    new_status: "APPROVED",
    timestamp: new Date().toISOString(),
    ip_address: ip,
  });

  item.status = "APPROVED";
  item.internal_tier = internal_tier;
  item.remarks = remarks;
  item.updated_at = new Date().toISOString();

  const user = store.users.find((u) => u.id === item.user_id);
  if (user) {
    user.status = "ACTIVE";
    user.updated_at = new Date().toISOString();

    const profileExists = store.profiles.some((p) => p.user_id === user.id);
    if (!profileExists) {
      store.profiles.push({
        id: generateId("profile"),
        user_id: user.id,
        nickname: `用户${store.profiles.length + 1}`,
        avatar_url: `https://api.dicebear.com/9.x/avataaars/svg?seed=${user.id}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }

  return NextResponse.json({
    ...item,
    notification: { type: "APPROVAL", sent_to: [item.email, item.phone] },
  });
}
