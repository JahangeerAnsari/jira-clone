import { useParams } from "next/navigation";

export const useWorkspaceId = () => {
    const param = useParams();
    return param.workspaceId as string;
}