import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";
import { InferResponseType } from "hono";
interface UseGetProjectsProps{
    workspaceId: string;
}
export type analyticsResponseType = InferResponseType<typeof client.api.workspaces[":workspaceId"]["analytics"]["$get"],200>
export const useGetWorkspaceAnalytics = ({ workspaceId }: UseGetProjectsProps) => {
  const query = useQuery({
    // workspaceId added on the query it will reload everytime changed (workspacId)
    queryKey: ["workspace-analytics", workspaceId],
    queryFn: async () => {
      // here we are using fetch method not axios so not using trycatch
      const response = await client.api.workspaces[":workspaceId"][
        "analytics"
      ].$get({
        param: { workspaceId },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch workspace analytics");
      }
      const { data } = await response.json();
      return data;
    },
  });
  return query;
};
