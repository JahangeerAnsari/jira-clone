import { useMutation, useQueryClient } from "@tanstack/react-query";
import {InferRequestType,InferResponseType } from "hono";
import {client} from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.auth.login["$post"]>;
type RequestType = InferRequestType<typeof client.api.auth.login["$post"]>["json"];

export const useLogin = () => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const mutation = useMutation<ResponseType, Error, RequestType>({
      mutationFn: async (json) => {
        const response = await client.api.auth.login["$post"]({ json });
        if (!response.ok) {
          throw new Error("Failed to login");
        }
        return await response.json();
      },
      onSuccess: () => {
        // once user logout we are going to refetched the current user
        //    the the data will deleted and redirected to the sign-in page
        toast.success('Logged In')
        router.refresh();
        queryClient.invalidateQueries({ queryKey: ["current"] });
      },
      onError: () => {
        toast.error("Failed to login");
      }
    });
    return mutation;
}
