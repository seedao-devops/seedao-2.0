import { NextResponse } from "next/server";
import { getSession } from "@/lib/features/auth/session";
import { findUserById } from "@/lib/features/auth/repo";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null }, { status: 200 });
  const user = await findUserById(session.sub);
  if (!user) return NextResponse.json({ user: null }, { status: 200 });
  return NextResponse.json({
    user: {
      id: user.id,
      phone: user.phone ?? null,
      email: user.email ?? null,
      role: user.role,
    },
  });
}
