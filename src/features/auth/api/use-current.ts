import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

export const useCurrent = () => {
  return useQuery({
    queryKey: ["current"],
    queryFn: async () => {
      const response = await client.api.auth.current.$get(); // ✅ now works
      if (!response.ok) return null;
      const { data } = await response.json();
      return data;
    },
  });
};
