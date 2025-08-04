import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";
import { InferResponseType } from "hono";
interface UseGetProjectsProps{
    projectId: string;
}
export type analyticsResponseType = InferResponseType<typeof client.api.projects[":projectId"]["analytics"]["$get"],200>
export const useGetProjectAnalytics = ({ projectId }: UseGetProjectsProps) => {

  const query = useQuery({
    // workspaceId added on the query it will reload everytime changed (workspacId)
    queryKey: ["project-analytics", projectId],
    queryFn: async () => {
      // here we are using fetch method not axios so not using trycatch
      const response = await client.api.projects[":projectId"]["analytics"].$get({
        param: { projectId  },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch project analytics");
      }
      const { data } = await response.json();
      return data;
    },
  });
  return query;
};
