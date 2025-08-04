import { analyticsResponseType } from "@/features/projects/api/use-get-project-analytics";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { AnalyticsCard } from "./analytics-card";
import { DottedSeparator } from "./dotted-separator";

export const Analytics = ({ data }: analyticsResponseType) => {
  if (!data) {
    return null;
  }
  return (
    <ScrollArea className="border rounded-lg w-full whitespace-nowrap shrink-0">
      <div className="w-full flex flex-row">
        <div className="flex items-center flex-1">
          <AnalyticsCard
            title="Total tasks"
            value={data.taskCount}
            variant={data.taskDiffernce > 0 ? "up" : "down"}
            increaseValue={data.taskDiffernce}
          />
          <DottedSeparator direction="vertical" />
        </div>
        <div className="flex items-center flex-1">
          <AnalyticsCard
            title="Assigned tasks"
            value={data.assignedTasksCount}
            variant={data.assignedTaskDiffrence > 0 ? "up" : "down"}
            increaseValue={data.assignedTaskDiffrence}
          />
          <DottedSeparator direction="vertical" />
        </div>
        <div className="flex items-center flex-1">
          <AnalyticsCard
            title="Completed tasks"
            value={data.completedTaskCount}
            variant={data.completedTaskCountDiffernce > 0 ? "up" : "down"}
            increaseValue={data.completedTaskCountDiffernce}
          />
          <DottedSeparator direction="vertical" />
        </div>
        <div className="flex items-center flex-1">
          <AnalyticsCard
            title="Overdue tasks"
            value={data.overDueTaskCount}
            variant={data.overDueTaskCountDiffernce > 0 ? "up" : "down"}
            increaseValue={data.overDueTaskCountDiffernce}
          />
          <DottedSeparator direction="vertical" />
        </div>
        <div className="flex items-center flex-1">
          <AnalyticsCard
            title="Incompleted  tasks"
            value={data.incompletedTaskCount}
            variant={data.incompletedTaskCountDiffernce > 0 ? "up" : "down"}
            increaseValue={data.incompletedTaskCountDiffernce}
          />
              </div>
              
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};
