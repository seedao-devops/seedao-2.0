import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { store } from "@/lib/fake-data/db";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;

  const redirect = store.handbook_redirects.find((r) => r.old_slug === slug);
  if (redirect) {
    return NextResponse.json(
      { redirect_to: `/handbook/${redirect.new_slug}` },
      {
        status: 301,
        headers: { Location: `/handbook/${redirect.new_slug}` },
      }
    );
  }

  const handbook = store.handbooks.find(
    (h) => h.slug === slug
  );

  if (!handbook) {
    return NextResponse.json(
      { error: "NOT_FOUND", message: "手册不存在" },
      { status: 404 }
    );
  }

  if (handbook.status === "DELETED") {
    return NextResponse.json(
      {
        error: "DELETED",
        message: handbook.deletion_message ?? "该手册已被删除",
      },
      { status: 410 }
    );
  }

  if (handbook.status !== "PUBLISHED") {
    return NextResponse.json(
      { error: "NOT_FOUND", message: "手册不存在" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    title: handbook.title,
    slug: handbook.slug,
    excerpt: handbook.excerpt,
    content: handbook.content,
    cover_image_url: handbook.cover_image_url,
    published_at: handbook.published_at,
    updated_at: handbook.updated_at,
  });
}
