import { BaseForm } from "@/components/features/admin/base-form";

export default function NewBasePage() {
  return (
    <div className="max-w-3xl space-y-5">
      <h1>新建基地</h1>
      <BaseForm mode="create" />
    </div>
  );
}
