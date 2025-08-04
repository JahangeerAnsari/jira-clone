import { DATABASES_ID, MEMBER_ID } from "@/config";
import { Databases, Query } from "node-appwrite"

interface GetMemberProps{
    databases: Databases;
    workspaceId: string;
    userId: string;
}
export const getMember = async ({databases,userId,workspaceId}:GetMemberProps) => {
    const members = await databases.listDocuments(DATABASES_ID, MEMBER_ID, [
        Query.equal("workspaceId", workspaceId),
        Query.equal("userId",userId)
    ]);
    // first member
    return members.documents[0];
}