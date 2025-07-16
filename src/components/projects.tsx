"use client";
import { useCreateProject } from "@/features/projects/api/use-create-project";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { useCreateProjectModal } from "@/features/projects/hooks/use-create-project-modal";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { cn } from "@/lib/utils";
import { CirclePlus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
export const Projects = () => {
    const projectId = null;
  const pathname = usePathname()
   const {open} = useCreateProjectModal()
    const workspaceId = useWorkspaceId()
    const {data:projects, isPending:isProjectsPending} = useGetProjects({workspaceId})
  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase text-neutral-500">Projects</p>
        <CirclePlus
          onClick={open}
          className="size-5 text-neutral-500 cursor-pointer hover:opacity-75 transition"
        />
      </div>
      {projects?.documents.map((project) => {
        const href = `workspaces/${workspaceId}/projects/${projectId}`;
        const isActive = pathname === href;
        return (
          <Link href={href} key={project.$id}>
            <div
              className={cn(
                "flex items-center gap-2.5 p-2.5 rounded-md transition hover:opacity-75 cursor-pointer",
                isActive && "bg-white shadow-sm hover:opacity-100 text-primary"
              )}
            >
              <ProjectAvatar image={project.imageUrl} name={project.name } />
              <span className="truncate">{project.name}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};
