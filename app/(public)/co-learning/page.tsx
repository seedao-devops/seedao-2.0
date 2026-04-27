import { CoLearningExplorer } from "@/components/features/co-learning/co-learning-explorer";

export default function CoLearningPage() {
  return (
    <div className="px-5 pt-4 pb-8 space-y-5">
      <div className="space-y-1">
        <h1>共学活动</h1>
        <p className="text-body text-muted-foreground">
          来自社区成员的工作坊、系列课与师徒制
        </p>
      </div>
      <CoLearningExplorer />
    </div>
  );
}
