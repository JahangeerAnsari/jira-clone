"use client";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { CirclePlus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorkpsaceAvatar } from "./workspace-avatar";
export const WorkspaceSwitcher = () => {
  const { data: workspaces } = useGetWorkspaces();
  console.log("workspaces====>", workspaces?.documents);

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase text-neutral-500">Workspaces</p>
        <CirclePlus className="size-5 text-neutral-500 cursor-pointer hover:opacity-75 transition" />
      </div>
      <Select>
        <SelectTrigger className="w-full bg-neutral-200 font-medium p-1">
          <SelectValue placeholder="No Workpsace selected " />
        </SelectTrigger>
        <SelectContent>
          {workspaces?.documents.map((workspace) => (
              <SelectItem key={workspace.$id} value={workspace.$id}>
                  <div className="flex justify-start items-center gap-3 font-medium">
                      <WorkpsaceAvatar name={workspace.name} image={workspace.imageUrl} />
                      <span className="truncate">{workspace.name}</span>
                  </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
