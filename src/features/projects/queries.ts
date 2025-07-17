import { createSessionClient } from "@/lib/appwrite";
import { getMember } from "../members/utils";
import { DATABASES_ID, PROJECT_ID } from "@/config";
import { Project } from "./types";

interface ProjectProps {
  projectId: string;
}
export const getProject = async ({ projectId }: ProjectProps) => {
  const { account, databases } = await createSessionClient();
  const user = await account.get();
  const project = await databases.getDocument<Project>(
    DATABASES_ID,
    PROJECT_ID,
    projectId
  );
  const member = await getMember({
    databases,
    userId: user.$id,
    workspaceId: project.workspaceId,
  });
  if (!member) {
    throw new Error("Unauthorized");
  }

  return project;
};
