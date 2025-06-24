import { client } from "@/lib/rpc"
import { useQuery } from "@tanstack/react-query"

export const useCurrent = () => {
    const query = useQuery({
        queryKey: ["current"],
        queryFn: async () => {
            // here we are using fetch method not axios so not using trycatch
            const response = await client.api.auth.current.$get();
            if (!response.ok) {
                // we are not thow error we always attempt to fetch this
                return null
            }
            const { data } = await response.json();
            return data;
        }
    })
    return query;
}