import { listBases } from "@/lib/features/bases/repo";
import { BasesExplorer } from "@/components/features/bases/bases-explorer";

export default async function BasesPage() {
  const bases = await listBases();
  return (
    <div className="px-5 pt-4 pb-8 space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-serif font-bold">探索基地</h1>
        <p className="text-sm text-muted-foreground">
          在中国各地，散落着 SeeDAO 的基地——一起去看看
        </p>
      </div>
      <BasesExplorer initialBases={bases} />
    </div>
  );
}
