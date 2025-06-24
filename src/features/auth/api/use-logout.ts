import { useMutation, useQueryClient } from "@tanstack/react-query";
import {  InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";

type ResponseType = InferResponseType<(typeof client.api.auth.logout)["$post"]>;


export const useLogout = () => {
  const queryClient = useQueryClient()
  const router = useRouter();
  const mutation = useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const response = await client.api.auth.logout["$post"]();
      return await response.json();
      },
      onSuccess: () => {
          // once user logout we are going to refetched the current user
        //    the the data will deleted and redirected to the sign-in page
        router.refresh()
          queryClient.invalidateQueries({queryKey:["current"]})
      }
  });
  return mutation;
};
