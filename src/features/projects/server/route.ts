import { DATABASES_ID, IMAGES_ID, PROJECT_ID } from "@/config";
import { getMember } from "@/features/members/utils";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { z } from "zod";
import { createProjectSchema, UpdateProjectSchema } from "../schema";
import { Project } from "../types";

const app = new Hono()
  .post(
    "/",
    sessionMiddleware,
    zValidator("form", createProjectSchema),
    async (c) => {
      const databases = c.get("databases");
      const storage = c.get("storage");
      const user = c.get("user");
      const { name, image, workspaceId } = c.req.valid("form");
      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });
      // if there is no member not allowed to create project
      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }
      let uploadImageUrl: string | undefined;
      if (image instanceof File) {
        const file = await storage.createFile(IMAGES_ID, ID.unique(), image);
        const arrayBuffer = await storage.getFileDownload(IMAGES_ID, file.$id);
        uploadImageUrl = `data:image/png;base64,${Buffer.from(
          arrayBuffer
        ).toString("base64")}`;
      }

      const project = await databases.createDocument(
        DATABASES_ID,
        PROJECT_ID,
        ID.unique(),
        {
          name,

          imageUrl: uploadImageUrl,
          workspaceId,
        }
      );

      return c.json({ data: project });
    }
  ).patch("/:projectId", sessionMiddleware, zValidator("form", UpdateProjectSchema),
      async (c) => {
        const databases = c.get("databases");
        const storage = c.get("storage");
        const user = c.get("user");
        const { projectId } = c.req.param();
        const { image, name } = c.req.valid("form");
        const existingProject = await databases.getDocument<Project>(
          DATABASES_ID,
          PROJECT_ID,
          projectId
        )
        const member = await getMember({
          databases,
          workspaceId:existingProject.workspaceId,
          userId: user.$id,
        });
          
        if (!member) {
          return c.json({error:"Unauthrized"},401)
        }
  
        //  update the image
        let uploadImageUrl: string | undefined;
        if (image instanceof File) {
          const file = await storage.createFile(IMAGES_ID, ID.unique(), image);
          const arrayBuffer = await storage.getFileDownload(IMAGES_ID, file.$id);
          uploadImageUrl = `data:image/png;base64,${Buffer.from(
            arrayBuffer
          ).toString("base64")}`;
        } else {
          uploadImageUrl = image
        }
  
        const project = await databases.updateDocument(
          DATABASES_ID,
          PROJECT_ID,
          projectId,{
            name,
            imageUrl:uploadImageUrl
          }
        );
        return c.json({ data: project });
         
      }
    
  )
  .get(
    "/",
    sessionMiddleware,
    zValidator("query", z.object({ workspaceId: z.string() })),
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const { workspaceId } = c.req.valid("query");
      if (!workspaceId) {
        return c.json({ error: "Missing workspaceId" }, 400);
      }
      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });
      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }
      const projects = await databases.listDocuments(DATABASES_ID, PROJECT_ID, [
        Query.equal("workspaceId", workspaceId),
        Query.orderDesc("$createdAt"),
      ]);
      return c.json({ data: projects });
    }
  ).delete("/:projectId", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");
    const { projectId } = c.req.param();
    const existingProject = await databases.getDocument<Project>(
      DATABASES_ID,
      PROJECT_ID,
      projectId
    );
    const member = await getMember({
      databases,
      workspaceId: existingProject.workspaceId,
      userId: user.$id,
    });
    if (!member ) {
      return c.json({error:"Unauthrized"},401)
    }
    // delete task related to project
    await databases.deleteDocument(
      DATABASES_ID,
      PROJECT_ID,
      projectId
    )
    return c.json({data:{$id:existingProject.$id}})
  })
export default app;
