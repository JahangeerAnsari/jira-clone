import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ExternalLinkIcon, PencilIcon, TrashIcon } from "lucide-react";
import { useDeleteTask } from "../api/use-delete-task";
import { useRouter } from "next/navigation";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useUpdateTaskModal } from "../hooks/use-update-task-modal";
interface TaskActionsProps {
  id: string;
  projectId: string;
  children: React.ReactNode;
}
export const TaskActions = ({ children, id, projectId }: TaskActionsProps) => {
    const router = useRouter();
    const {open} = useUpdateTaskModal()
    const workspaceId = useWorkspaceId()
    const { mutate, isPending: isDeleteTaskPending } = useDeleteTask();
    const handleDeleteTask = () => {
        mutate({param:{taskId:id}})
    }
    const handleOpenTask = () => {
        router.push(`/workspaces/${workspaceId}/tasks/${id}`)
    }
    const handleOpenProject = () => {
        router.push(`/workspaces/${workspaceId}/projects/${projectId}`);
    }
    return (
      <div className="flex justify-end">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={handleOpenTask}
              disabled={false}
              className="font-medium p-[10px]"
            >
              <ExternalLinkIcon className="size-4 mr-2 storke-2" />
              Task Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() =>open(id)} className="font-medium p-[10px]">
              <PencilIcon className="size-4 mr-2 storke-2" />
              Edit Task
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleOpenProject}
              className="font-medium p-[10px]"
            >
              <ExternalLinkIcon className="size-4 mr-2 storke-2" />
              Open Project
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDeleteTask}
              disabled={isDeleteTaskPending}
              className="text-amber-700 focus:text-amber-700 font-medium p-[10px]"
            >
              <TrashIcon className="size-4 mr-2 storke-2" />
              Delete Task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
};
