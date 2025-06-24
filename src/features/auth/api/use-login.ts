import { useMutation, useQueryClient } from "@tanstack/react-query";
import {InferRequestType,InferResponseType } from "hono";
import {client} from "@/lib/rpc";
import { useRouter } from "next/navigation";

type ResponseType = InferResponseType<typeof client.api.auth.login["$post"]>;
type RequestType = InferRequestType<typeof client.api.auth.login["$post"]>["json"];

export const useLogin = () => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const mutation = useMutation<ResponseType, Error, RequestType>({
      mutationFn: async (json) => {
        const response = await client.api.auth.login["$post"]({ json });
        return await response.json();
      },
      onSuccess: () => {
        // once user logout we are going to refetched the current user
        //    the the data will deleted and redirected to the sign-in page
        router.refresh();
        queryClient.invalidateQueries({ queryKey: ["current"] });
      },
    });
    return mutation;
}
