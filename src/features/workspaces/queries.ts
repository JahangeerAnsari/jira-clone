"use server";

import { Account, Client, Databases, Query } from "node-appwrite";

import { DATABASES_ID, MEMBER_ID, WORKSPACES_ID } from "@/config";
import { getMember } from "../members/utils";
import { Workspace } from "./types";
import { createSessionClient } from "@/lib/appwrite";

export const getWorkspaces = async () => {
  try {
    const { account, databases } = await createSessionClient();

    const user = await account.get();
    const members = await databases.listDocuments(DATABASES_ID, MEMBER_ID, [
      Query.equal("userId", user.$id),
    ]);
    if (members.total === 0) {
      return { document: [], total: 0 };
    }
    const workspaceIds = members.documents.map((member) => member.workspaceId);
    const workspaces = await databases.listDocuments(
      DATABASES_ID,
      WORKSPACES_ID,
      [Query.orderDesc("$createdAt"), Query.contains("$id", workspaceIds)]
    );

    return workspaces;
  } catch (error) {
    return { document: [], total: 0 };
  }
};
interface WorkspaceProps {
  workspaceId: string;
}
export const getWorkspace = async ({ workspaceId }: WorkspaceProps) => {
 
  try {
    const { account, databases } = await createSessionClient();
    const user = await account.get();
    const member = await getMember({
      databases,
      userId: user.$id,
      workspaceId,
    });    
    if (!member) {
      return null;
    }
    const workspace = await databases.getDocument<Workspace>(
      DATABASES_ID,
      WORKSPACES_ID,
      workspaceId
    );
   
    return workspace;
  } catch (error) {  
    return null;
  }
};
