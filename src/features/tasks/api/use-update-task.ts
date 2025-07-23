import { useMutation, useQueryClient } from "@tanstack/react-query";
import {InferRequestType,InferResponseType } from "hono";
import {client} from "@/lib/rpc";
import { toast } from "sonner";
import { useRouter } from "next/navigation";


type ResponseType = InferResponseType<typeof client.api.tasks[":taskId"]["$delete"],200>;
type RequestType = InferRequestType<
  (typeof client.api.tasks)[":taskId"]["$patch"]
>;

export const useUpdateTask = () => {
  const router = useRouter()
    const queryClient = useQueryClient();
    const mutation = useMutation<ResponseType, Error, RequestType>({
      mutationFn: async ({json,param}) => {
        const response = await client.api.tasks[":taskId"]["$patch"]({ json,param });
        if (!response.ok) {
          throw new Error("Failed to update task");
        }
        return await response.json();
      },
      onSuccess: ({data}) => {
        toast.success("Update Task");
        router.refresh()
        // when we create new workspaces we will refetched the workspaces the created one
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        queryClient.invalidateQueries({ queryKey: ["task",data.$id] });
      },
      onError: () => {
        toast.error("Failed to update task");
      }
    });
    return mutation;
}
