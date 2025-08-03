import { Card, CardContent } from "@/components/ui/card";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { Loader } from "lucide-react";
import { useGetTaskById } from "../api/use-get-task-by-id";
import { EditTaskForm } from "./edit-task-form";
import { Project } from "@/features/projects/types";
import { Member } from "@/features/members/types";

interface EditTaskFormWrapperProps {
  onCancel: () => void;
  id: string;
}
export const EditTaskFormWrapper = ({ onCancel,id }: EditTaskFormWrapperProps) => {
  const workspaceId = useWorkspaceId();
  const { data: task, isLoading: isLoadingTask } = useGetTaskById({ taskId: id })
 
  // get project
  const { data: projects, isLoading: isLoadingProjects } = useGetProjects({
    workspaceId,
  });
  const { data: members, isLoading: isLoadingMembers } = useGetMembers({
    workspaceId,
  });
  const projectOptions = projects?.documents.map((project:Project) => ({
    id: project.$id,
    name: project.name,
    imageUrl: project.imageUrl,
  }));
  const memberOptions = members?.documents.map((member:Member) => ({
    id: member.$id,
    name: member.name,
  }));
  const isLoading = isLoadingMembers || isLoadingProjects || isLoadingTask;
  if (isLoading) {
    return (
      <Card className="w-full h-[714px] border-none shadow-none">
        <CardContent className="flex items-center justify-center h-full">
          <Loader className="size-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }
  if (!task) {
    return null;
  }
  return (
    <EditTaskForm
      memberOptions={memberOptions ?? []}
      projectOptions={projectOptions ?? []}
      onCancel={onCancel}
      task={task}
    />
  );
};
