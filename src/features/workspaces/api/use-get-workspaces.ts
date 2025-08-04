import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";
import { WorkspacesResponse } from "../types";


export const useGetWorkspaces = () => {
  return useQuery<WorkspacesResponse>({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const response = await client.api.workspaces.$get();
      if (!response.ok) {
        throw new Error("Failed to fetch workspaces");
      }

      const json = await response.json();
      return json.data as WorkspacesResponse; // ✅ explicit type assertion
    },
  });
};
