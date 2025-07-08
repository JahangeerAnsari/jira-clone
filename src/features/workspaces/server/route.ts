import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createWorkspaceSchema } from "../schemas";
import { sessionMiddleware } from "@/lib/session-middleware";
import { DATABASES_ID, IMAGES_ID, MEMBER_ID, WORKSPACES_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { MemberRole } from "@/features/members/types";
import { generateInviteCode } from "@/lib/utils";


const app = new Hono()
  .get('/', sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    // let get the workspace with currently login
    const user = c.get("user")
    
    const members = await databases.listDocuments(DATABASES_ID, MEMBER_ID,
      [Query.equal("userId", user.$id)]
    )
    if (members.total === 0) {
      return c.json({data:{document:[],total:0}})
    }
    const workspaceIds = members.documents.map((member) => member.workspaceId);
    const workspaces = await databases.listDocuments(
      DATABASES_ID,
      WORKSPACES_ID,
      [
        Query.orderDesc("$createdAt"),
        Query.contains("$id", workspaceIds)]
    );
    return c.json({data:workspaces})
  })
  .post(
  "/",
  zValidator("form", createWorkspaceSchema),
  sessionMiddleware,
  async (c) => {
    const databases = c.get("databases");
    const storage = c.get("storage");
    const user = c.get("user");
    const { name, image } = c.req.valid("form");
    let uploadImageUrl: string | undefined;
    if (image instanceof File) {
      const file = await storage.createFile(IMAGES_ID, ID.unique(), image);
      const arrayBuffer = await storage.getFileDownload(IMAGES_ID, file.$id);
      uploadImageUrl = `data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`
    }
    
    const workspace = await databases.createDocument(
      DATABASES_ID,
      WORKSPACES_ID,
      ID.unique(),
        {
            name,
          userId: user.$id,
          imageUrl: uploadImageUrl,
          inviteCode: generateInviteCode(6),
       }
    );
    await databases.createDocument(
      DATABASES_ID,
      MEMBER_ID,
      ID.unique(), {
        userId: user.$id,
        workspaceId: workspace.$id,
        role:MemberRole.ADMIN
      }
    )
      return c.json({data:workspace})
  }
);
export default app;
