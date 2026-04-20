import Link from "next/link";
import { ArrowRight, Compass, GraduationCap, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="px-5 pt-6 pb-10 space-y-10">
      <section className="space-y-4">
        <p className="text-sm text-muted-foreground tracking-widest uppercase">
          一个属于数字游民的家
        </p>
        <h1 className="text-4xl font-serif font-bold leading-tight">
          慢下来，
          <br />
          长在路上。
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          SeeDAO 把分散在山林、海岛、古镇、店铺里的基地与共学活动连接起来，
          让你在旅途中认识同行者、习得新技能、创造作品、被看见。
        </p>
        <div className="flex gap-3 pt-2">
          <Button asChild size="lg">
            <Link href="/register">
              申请加入
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/bases">先看看</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-3">
        <FeatureCard
          icon={<Compass className="size-5" />}
          title="探索基地"
          desc="散落在中国各地的数字游民驻地，看看在地生活、技能交换、共建项目。"
          href="/bases"
        />
        <FeatureCard
          icon={<GraduationCap className="size-5" />}
          title="共学活动"
          desc="来自基地与社区成员的工作坊、系列课、师徒制——按技能或时间筛选。"
          href="/co-learning"
        />
        <FeatureCard
          icon={<Sprout className="size-5" />}
          title="我的旅程"
          desc="记录你旅居过的基地、学过教过的课、创作的作品，并按需对外分享。"
          href="/journey"
        />
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="p-5 hover:border-primary/50 transition-colors">
        <div className="flex items-start gap-3">
          <span className="size-9 rounded-full bg-primary/10 text-primary grid place-items-center shrink-0 mt-0.5">
            {icon}
          </span>
          <div className="space-y-1.5">
            <h3 className="font-serif font-semibold text-lg">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
