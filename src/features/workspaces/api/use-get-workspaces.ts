import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

export const useGetWorkspaces = () => {
  const query = useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      // here we are using fetch method not axios so not using trycatch
      const response = await client.api.workspaces.$get();
      if (!response.ok) {
        throw new Error("Failed to fetch workspaces")
      }
      const { data } = await response.json();
      return data;
    },
  });
  return query;
};
