import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { store, findAll, generateId } from "@/lib/fake-data/db";
import { parseToken } from "@/lib/utils/auth";
import { generateSlug, isValidSlug } from "@/lib/utils/slug";

const createSchema = z.object({
  title: z.string().min(1).max(120),
  slug: z.string().optional(),
  excerpt: z.string().max(300).optional(),
  content: z.string().min(1).max(1048576),
  cover_image_url: z.string().url().optional(),
});

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20"), 100);
  const offset = parseInt(url.searchParams.get("offset") ?? "0");

  const result = findAll(
    store.handbooks,
    {},
    { limit, offset },
    { sort_by: "created_at", sort_order: "desc" }
  );

  const response = NextResponse.json(result.data);
  response.headers.set("X-Total-Count", String(result.total));
  return response;
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const session = token ? parseToken(token) : null;
  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const data = parsed.data;
  const slug = data.slug || generateSlug(data.title);

  if (!isValidSlug(slug)) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "Slug 格式无效" },
      { status: 422 }
    );
  }

  const slugExists = store.handbooks.some((h) => h.slug === slug);
  if (slugExists) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", message: "Slug 已存在" },
      { status: 422 }
    );
  }

  const now = new Date().toISOString();
  const handbookId = generateId("hb");

  const handbook = {
    id: handbookId,
    title: data.title,
    slug,
    excerpt: data.excerpt,
    content: data.content,
    cover_image_url: data.cover_image_url,
    cover_thumbnail_url: data.cover_image_url,
    status: "DRAFT" as const,
    created_by: session.user_id,
    created_at: now,
    updated_at: now,
  };

  store.handbooks.push(handbook);

  store.handbook_versions.push({
    id: generateId("hbv"),
    handbook_id: handbookId,
    title: data.title,
    slug,
    excerpt: data.excerpt,
    content: data.content,
    cover_image_url: data.cover_image_url,
    is_current: true,
    version_number: 1,
    created_at: now,
  });

  return NextResponse.json({ ...handbook }, { status: 201 });
}
