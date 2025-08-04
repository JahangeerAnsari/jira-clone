import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";
interface UseGetProjectsProps{
    projectId: string;
}
export const   useGetProjectById = ({ projectId }: UseGetProjectsProps) => {
  const query = useQuery({
    // workspaceId added on the query it will reload everytime changed (workspacId)
    queryKey: ["projects", projectId],
    queryFn: async () => {
      // here we are using fetch method not axios so not using trycatch
      const response = await client.api.projects[":projectId"].$get({
        param: { projectId  },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }
      const { data } = await response.json();
      return data;
    },
  });
  return query;
};
