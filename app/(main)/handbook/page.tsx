"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";

interface HandbookListing {
  title: string;
  slug: string;
  excerpt?: string;
  cover_thumbnail_url?: string;
  published_at?: string;
}

export default function HandbookListPage() {
  const [handbooks, setHandbooks] = useState<HandbookListing[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const limit = 10;

  const loadHandbooks = useCallback(async () => {
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
    });
    if (search) params.set("search", search);

    try {
      const { data, headers } = await api.get<HandbookListing[]>(
        `/api/handbook?${params}`
      );
      setHandbooks(data);
      setTotal(parseInt(headers.get("X-Total-Count") ?? "0"));
    } catch {
      toast.error("加载手册失败");
    }
  }, [search, offset]);

  useEffect(() => {
    loadHandbooks();
  }, [loadHandbooks]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setOffset(0);
    loadHandbooks();
  };

  return (
    <>
      <Header title="手册" />
      <div className="space-y-4 p-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索手册..."
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="outline">
            搜索
          </Button>
        </form>

        <div className="space-y-3">
          {handbooks.map((hb) => (
            <Link key={hb.slug} href={`/handbook/${hb.slug}`}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{hb.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {hb.excerpt && (
                    <p className="mb-2 text-sm text-muted-foreground line-clamp-2">
                      {hb.excerpt}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {hb.published_at &&
                      new Date(hb.published_at).toLocaleDateString("zh-CN")}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
          {handbooks.length === 0 && (
            <p className="py-8 text-center text-muted-foreground">
              {search ? "没有找到匹配的手册" : "暂无已发布的手册"}
            </p>
          )}
        </div>

        {total > limit && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - limit))}
            >
              上一页
            </Button>
            <span className="flex items-center text-sm text-muted-foreground">
              {Math.floor(offset / limit) + 1} / {Math.ceil(total / limit)}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={offset + limit >= total}
              onClick={() => setOffset(offset + limit)}
            >
              下一页
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
