"use server";

import {  Query } from "node-appwrite";

import { DATABASES_ID, MEMBER_ID, WORKSPACES_ID } from "@/config";
import { getMember } from "../members/utils";
import { Workspace } from "./types";
import { createSessionClient } from "@/lib/appwrite";

export const getWorkspaces = async () => {
 
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
 
};
interface WorkspaceProps {
  workspaceId: string;
}
export const getWorkspace = async ({ workspaceId }: WorkspaceProps) => {
 
    const { account, databases } = await createSessionClient();
    const user = await account.get();
    const member = await getMember({
      databases,
      userId: user.$id,
      workspaceId,
    });
    if (!member) {
     throw new Error("Unauthorized")
    }
    const workspace = await databases.getDocument<Workspace>(
      DATABASES_ID,
      WORKSPACES_ID,
      workspaceId
    );

    return workspace;
 
};
interface getWorkspaceInfoProps {
  workspaceId: string;
}
export const getWorkspaceInfo = async ({ workspaceId }: getWorkspaceInfoProps) => {

    const {  databases } = await createSessionClient();
    const workspace = await databases.getDocument<Workspace>(
      DATABASES_ID,
      WORKSPACES_ID,
      workspaceId
    );

    return {name:workspace.name};
 
};