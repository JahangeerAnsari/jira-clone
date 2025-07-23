import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";
interface UseGetTaskByIdProps {
  taskId: string;
}
export const useGetTaskById = ({ taskId }: UseGetTaskByIdProps) => {
  const query = useQuery({
    // workspaceId added on the query it will reload everytime changed (workspacId)
    queryKey: ["task", taskId],
    queryFn: async () => {
      // here we are using fetch method not axios so not using trycatch
      const response = await client.api.tasks[":taskId"].$get({
        param: {
          taskId,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch task");
      }
      const { data } = await response.json();
      return data;
    },
  });
  return query;
};
