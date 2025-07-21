import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";
interface UseGetTaskProps {
  workspaceId: string;
}
export const useGetTasks = ({ workspaceId }: UseGetTaskProps) => {
  const query = useQuery({
    // workspaceId added on the query it will reload everytime changed (workspacId)
    queryKey: ["tasks", workspaceId],
    queryFn: async () => {
      // here we are using fetch method not axios so not using trycatch
      const response = await client.api.tasks.$get({
        query: { workspaceId },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const { data } = await response.json();
      return data;
    },
  });
  return query;
};
