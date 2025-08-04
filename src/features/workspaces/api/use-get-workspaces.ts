import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

export const useGetWorkspaces = () => {
 return useQuery({
   queryKey: ["workspaces"],
   queryFn: async () => {
     const response = await client.api.workspaces.$get();

     if (!response.ok) {
       throw new Error("Failed to fetch workspaces");
     }

     const { data } = await response.json();

     // normalize response shape
     if ("documents" in data && Array.isArray(data.documents)) {
       return data.documents;
     }

     return []; // fallback empty array
   },
 });
 
};
