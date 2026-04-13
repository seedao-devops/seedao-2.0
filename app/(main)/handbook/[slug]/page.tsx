"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Header } from "@/components/layout/header";
import { Share2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";

interface HandbookDetail {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  cover_image_url?: string;
  published_at?: string;
  updated_at: string;
}

export default function HandbookDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const [handbook, setHandbook] = useState<HandbookDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    api
      .get<HandbookDetail & { redirect_to?: string }>(
        `/api/handbook/${slug}`
      )
      .then(({ data }) => {
        if (data.redirect_to) {
          router.replace(data.redirect_to);
          return;
        }
        setHandbook(data);
      })
      .catch((err: Error & { status?: number }) => {
        if (err.status === 410) {
          setError(err.message ?? "该手册已被删除");
        } else if (err.status === 301) {
          // handled by redirect
        } else {
          setError("手册不存在");
        }
      });
  }, [slug, router]);

  if (error) {
    return (
      <>
        <Header title="手册" showBack />
        <div className="flex h-64 flex-col items-center justify-center p-4">
          <p className="text-muted-foreground">{error}</p>
        </div>
      </>
    );
  }

  if (!handbook) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    );
  }

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/handbook/${handbook.slug}`
      : "";

  return (
    <>
      <Header
        title={handbook.title}
        showBack
        actions={
          <Dialog open={shareOpen} onOpenChange={setShareOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Share2 className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>分享手册</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4 py-4">
                <h3 className="text-center font-semibold">{handbook.title}</h3>
                {handbook.excerpt && (
                  <p className="text-center text-sm text-muted-foreground">
                    {handbook.excerpt}
                  </p>
                )}
                <div className="rounded-lg border p-4 bg-white">
                  <QRCodeSVG value={shareUrl} size={200} />
                </div>
                <p className="text-xs text-muted-foreground">
                  扫码查看手册
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    toast.success("链接已复制");
                  }}
                >
                  复制链接
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />
      <article className="p-4">
        {handbook.cover_image_url && (
          <img
            src={handbook.cover_image_url}
            alt={handbook.title}
            className="mb-4 w-full rounded-lg object-cover"
          />
        )}

        <div className="mb-4 flex items-center gap-3 text-xs text-muted-foreground">
          {handbook.published_at && (
            <span>
              发布于 {new Date(handbook.published_at).toLocaleDateString("zh-CN")}
            </span>
          )}
          <span>
            更新于 {new Date(handbook.updated_at).toLocaleDateString("zh-CN")}
          </span>
        </div>

        {handbook.excerpt && (
          <Card className="mb-4">
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground italic">
                {handbook.excerpt}
              </p>
            </CardContent>
          </Card>
        )}

        <div className="prose prose-sm max-w-none">
          {handbook.content.split("\n").map((line, i) => {
            if (line.startsWith("# ")) {
              return (
                <h1 key={i} className="mb-4 mt-6 text-2xl font-bold">
                  {line.slice(2)}
                </h1>
              );
            }
            if (line.startsWith("## ")) {
              return (
                <h2 key={i} className="mb-3 mt-5 text-xl font-semibold">
                  {line.slice(3)}
                </h2>
              );
            }
            if (line.startsWith("### ")) {
              return (
                <h3 key={i} className="mb-2 mt-4 text-lg font-semibold">
                  {line.slice(4)}
                </h3>
              );
            }
            if (line.startsWith("- ")) {
              return (
                <li key={i} className="ml-4 text-sm">
                  {line.slice(2)}
                </li>
              );
            }
            if (line.trim() === "") {
              return <br key={i} />;
            }
            return (
              <p key={i} className="mb-2 text-sm leading-relaxed">
                {line}
              </p>
            );
          })}
        </div>
      </article>
    </>
  );
}
