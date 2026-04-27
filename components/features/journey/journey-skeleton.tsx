import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function JourneySkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <Skeleton className="size-18 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
      {Array.from({ length: 2 }).map((_, i) => (
        <section key={i} className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Card className="p-4 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-2/3" />
          </Card>
        </section>
      ))}
    </div>
  );
}
