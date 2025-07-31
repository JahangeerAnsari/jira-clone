"use client";

import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { useGetTaskById } from "@/features/tasks/api/use-get-task-by-id";
import { TaskBreadcrumbs } from "@/features/tasks/components/task-breadcrumbs";
import { useTaskId } from "@/features/tasks/hooks/use-task-id";

export const TaskIdClient = () => {
    const taskId = useTaskId();
    const { data, isLoading } = useGetTaskById({ taskId });
    if (isLoading) {
        return (
             <PageLoader/>
         )
    }
    if (!data) {
        return(<PageError message="Task not found"/>)
    }
    return (
        <TaskBreadcrumbs project={data.project}  task={data} />
    )
}