import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { store, findById, generateId } from "@/lib/fake-data/db";
import { parseToken } from "@/lib/utils/auth";

const updateSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  slug: z.string().optional(),
  excerpt: z.string().max(300).optional(),
  content: z.string().min(1).max(1048576).optional(),
  cover_image_url: z.string().url().optional(),
  deletion_message: z.string().optional(),
});

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const handbook = findById(store.handbooks, id);
  if (!handbook) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  return NextResponse.json(handbook);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const token = request.cookies.get("auth_token")?.value;
  const session = token ? parseToken(token) : null;
  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const handbook = findById(store.handbooks, id);
  if (!handbook) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const data = parsed.data;

  if (data.slug && data.slug !== handbook.slug) {
    const slugExists = store.handbooks.some(
      (h) => h.slug === data.slug && h.id !== id
    );
    if (slugExists) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", message: "Slug 已存在" },
        { status: 422 }
      );
    }

    store.handbook_redirects.push({
      id: generateId("hbr"),
      handbook_id: id,
      old_slug: handbook.slug,
      new_slug: data.slug,
      created_at: new Date().toISOString(),
    });

    handbook.slug = data.slug;
  }

  if (data.title !== undefined) handbook.title = data.title;
  if (data.excerpt !== undefined) handbook.excerpt = data.excerpt;
  if (data.content !== undefined) handbook.content = data.content;
  if (data.cover_image_url !== undefined) {
    handbook.cover_image_url = data.cover_image_url;
    handbook.cover_thumbnail_url = data.cover_image_url;
  }
  handbook.updated_at = new Date().toISOString();

  store.handbook_versions.forEach((v) => {
    if (v.handbook_id === id) v.is_current = false;
  });

  const versionCount = store.handbook_versions.filter(
    (v) => v.handbook_id === id
  ).length;

  store.handbook_versions.push({
    id: generateId("hbv"),
    handbook_id: id,
    title: handbook.title,
    slug: handbook.slug,
    excerpt: handbook.excerpt,
    content: handbook.content,
    cover_image_url: handbook.cover_image_url,
    is_current: true,
    version_number: versionCount + 1,
    created_at: new Date().toISOString(),
  });

  return NextResponse.json(handbook);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const handbook = findById(store.handbooks, id);
  if (!handbook) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  let body: { deletion_message?: string } = {};
  try {
    body = await request.json();
  } catch {
    // no body is ok
  }

  handbook.status = "DELETED";
  handbook.deletion_message = body.deletion_message ?? "该手册已被删除";
  handbook.updated_at = new Date().toISOString();

  return NextResponse.json({ success: true });
}
