"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Save } from "lucide-react";
import { toast } from "sonner";
import { ApiError, apiPut } from "@/lib/api-client";
import { useJourney } from "@/lib/features/journey/hooks";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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

  return (
    <div className="space-y-4">
      <Card className="p-5 space-y-3">
        <h3 className="font-serif text-lg font-semibold">字段可见性</h3>
        <p className="text-sm text-muted-foreground">
          关闭某项后，访客打开你的分享链接时不会看到这一项。
        </p>
        <ul className="divide-y">
          {ROWS.map((r) => (
            <li key={r.key} className="flex items-center justify-between py-3">
              <span className="text-sm">{r.label}</span>
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

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            生成分享二维码
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>分享你的旅程</DialogTitle>
          </DialogHeader>
          <div className="grid place-items-center py-2">
            {shareUrl ? (
              <QRCodeSVG value={shareUrl} size={208} bgColor="transparent" />
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground break-all text-center">{shareUrl}</p>
          <Button variant="outline" className="w-full" onClick={copy}>
            <Copy className="size-4" />
            复制链接
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
