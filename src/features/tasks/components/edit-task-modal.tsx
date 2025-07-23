"use client";
import { ResponsiveModal } from "@/components/responsive-modal";
import { CreateTaskFormWrapper } from "./create-task-form-wrapper";
import { useUpdateTaskModal } from "../hooks/use-update-task-modal";
import { EditTaskFormWrapper } from "./edit-task-form-wrapper";

export const EditTaskModal = () => {
    const { taskId, close } = useUpdateTaskModal()
    return (
      <ResponsiveModal open={!!taskId} onOpenChange={close}>
        {taskId && <EditTaskFormWrapper id={taskId} onCancel={close} />}
      </ResponsiveModal>
    );
}