import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { store, findById, generateId } from "@/lib/fake-data/db";
import { parseToken } from "@/lib/utils/auth";

const rejectSchema = z.object({
  reason: z.string().min(10, "拒绝原因至少10个字符"),
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

  const parsed = rejectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { reason } = parsed.data;
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";

  store.audit_history_logs.push({
    id: generateId("ahl"),
    audit_item_id: id,
    actor_id: session.user_id,
    old_status: item.status,
    new_status: "REJECTED",
    timestamp: new Date().toISOString(),
    ip_address: ip,
  });

  item.status = "REJECTED";
  item.rejection_reason = reason;
  item.updated_at = new Date().toISOString();

  const user = store.users.find((u) => u.id === item.user_id);
  if (user) {
    user.status = "REJECTED";
    user.updated_at = new Date().toISOString();
  }

  return NextResponse.json({
    ...item,
    notification: {
      type: "REJECTION",
      reason,
      sent_to: [item.email, item.phone],
    },
  });
}
