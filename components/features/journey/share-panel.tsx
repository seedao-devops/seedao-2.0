"use client";

import { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Copy, Download, Save } from "lucide-react";
import { toast } from "sonner";
import { ApiError, apiPut } from "@/lib/api-client";
import { useJourney } from "@/lib/features/journey/hooks";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { FieldVisibility } from "@/lib/features/_shared/fake-db";

const ROWS: { key: keyof FieldVisibility; label: string }[] = [
  { key: "avatar", label: "头像" },
  { key: "bio", label: "自我介绍" },
  { key: "stays", label: "旅居过的基地" },
  { key: "learning", label: "学习记录" },
  { key: "teaching", label: "教学记录" },
  { key: "works", label: "作品集" },
  { key: "wishToLearn", label: "想学的" },
];

export function SharePanel({
  userId,
  initialVisibility,
}: {
  userId: string;
  initialVisibility: FieldVisibility;
}) {
  const { journey, mutate } = useJourney();
  const [visibility, setVisibility] = useState<FieldVisibility>(initialVisibility);
  const [saving, setSaving] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const qrWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(`${window.location.origin}/share/${userId}`);
    }
  }, [userId]);

  async function save() {
    if (!journey) {
      toast.error("数据未就绪，请稍后重试");
      return;
    }
    setSaving(true);
    try {
      try {
        await apiPut("/api/journey/me", {
          ...journey,
          fieldVisibility: visibility,
        });
        toast.success("可见性已更新");
        await mutate();
      } catch (err) {
        if (err instanceof ApiError) toast.error("保存失败");
        else throw err;
      }
    } finally {
      setSaving(false);
    }
  }

  function copy() {
    navigator.clipboard.writeText(shareUrl);
    toast.success("链接已复制");
  }

  function download() {
    const canvas = qrWrapperRef.current?.querySelector("canvas");
    if (!canvas) {
      toast.error("二维码未就绪，请稍后重试");
      return;
    }
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `seedao-${userId}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("二维码已下载");
  }

  return (
    <div className="space-y-4">
      <Card className="p-5 space-y-3">
        <h3>字段可见性</h3>
        <p className="text-body text-muted-foreground">
          关闭某项后，访客打开你的分享链接时不会看到这一项。
        </p>
        <ul className="divide-y">
          {ROWS.map((r) => (
            <li key={r.key} className="flex items-center justify-between py-3">
              <span className="text-body">{r.label}</span>
              <Switch
                checked={visibility[r.key]}
                onCheckedChange={(v) => setVisibility((p) => ({ ...p, [r.key]: v }))}
              />
            </li>
          ))}
        </ul>
        <Button onClick={save} disabled={saving} className="w-full">
          <Save className="size-4" />
          {saving ? "保存中..." : "保存设置"}
        </Button>
      </Card>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="w-full">
            生成分享二维码
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="gap-0">
          <div
            aria-hidden
            className="sticky top-0 z-10 flex justify-center bg-background pt-2.5 pb-1"
          >
            <div className="h-1 w-10 rounded-full bg-muted-foreground/40" />
          </div>
          <SheetHeader className="sticky top-[18px] z-10 border-b bg-background px-5 pt-2 pb-3 text-left">
            <SheetTitle>分享你的旅程</SheetTitle>
            <SheetDescription className="sr-only">
              扫描二维码或复制链接，把你的旅程分享给朋友。
            </SheetDescription>
          </SheetHeader>
          <div className="px-5 py-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] space-y-4">
            <div ref={qrWrapperRef} className="grid place-items-center py-2">
              {shareUrl ? (
                <QRCodeCanvas
                  value={shareUrl}
                  size={208}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  marginSize={2}
                />
              ) : null}
            </div>
            <p className="text-caption text-muted-foreground break-all text-center">
              {shareUrl}
            </p>
            <div className="space-y-2">
              <Button className="w-full" onClick={download} disabled={!shareUrl}>
                <Download className="size-4" />
                下载二维码
              </Button>
              <Button variant="outline" className="w-full" onClick={copy}>
                <Copy className="size-4" />
                复制链接
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
