import { notFound } from "next/navigation";
import { getBaseById } from "@/lib/features/bases/repo";
import { BaseForm } from "@/components/features/admin/base-form";

export default async function EditBasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const base = await getBaseById(id);
  if (!base) notFound();
  return (
    <div className="max-w-3xl space-y-5">
      <h1 className="text-2xl font-serif font-bold">编辑基地 — {base.name}</h1>
      <BaseForm mode="edit" baseId={id} initial={base} />
    </div>
  );
}
