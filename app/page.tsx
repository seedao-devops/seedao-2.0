import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center p-6 text-center">
      <h1 className="text-3xl font-bold tracking-tight">SeeDAO</h1>
      <p className="mt-2 text-muted-foreground">数字游民社区平台</p>
      <div className="mt-8 flex flex-col gap-3 w-full max-w-xs">
        <Button asChild>
          <Link href="/login">登录</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/register">注册</Link>
        </Button>
      </div>
    </main>
  );
}
