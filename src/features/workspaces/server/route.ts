import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createWorkspaceSchema, updateWorkspaceSchema } from "../schemas";
import { sessionMiddleware } from "@/lib/session-middleware";
import { DATABASES_ID, IMAGES_ID, MEMBER_ID, TASK_ID, WORKSPACES_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { MemberRole } from "@/features/members/types";
import { generateInviteCode } from "@/lib/utils";
import { getMember } from "@/features/members/utils";
import { z } from "zod";

import { Workspace } from "../types";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { TaskStatus } from "@/features/tasks/types";


const app = new Hono()
  .get('/', sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    // let get the workspace with currently login
    const user = c.get("user")
    
    const members = await databases.listDocuments(DATABASES_ID, MEMBER_ID,
      [Query.equal("userId", user.$id)]
    )
    if (members.total === 0) {
      return c.json({data:{documents:[],total:0}})
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
)
  .patch("/:workspaceId", sessionMiddleware, zValidator("form", updateWorkspaceSchema),
    async (c) => {
      const databases = c.get("databases");
      const storage = c.get("storage");
      const user = c.get("user");
      const { workspaceId } = c.req.param();
      const { image, name } = c.req.valid("form");
      const member = await getMember({
        databases,
        workspaceId,
        userId:user.$id
      })
        
      if (!member || member.role !== MemberRole.ADMIN) {
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

      const workspace = await databases.updateDocument(
        DATABASES_ID,
        WORKSPACES_ID,
        workspaceId,{
          name,
          imageUrl:uploadImageUrl
        }
      );
      return c.json({data:workspace})
       
    }
  
).delete("/:workspaceId", sessionMiddleware, async (c) => {
  const databases = c.get("databases");
  const user = c.get("user");
  const { workspaceId } = c.req.param();
  const member = await getMember({
    databases,
    workspaceId,
    userId:user.$id
  })
  if (!member || member.role !== MemberRole.ADMIN) {
    return c.json({error:"Unauthrized"},401)
  }
  await databases.deleteDocument(
    DATABASES_ID,
    WORKSPACES_ID,
    workspaceId
  )
  return c.json({data:{$id:workspaceId}})
}).post("/:workspaceId/reset-invite-code", sessionMiddleware, async (c) => {
  const databases = c.get("databases");
  const user = c.get("user");
  const { workspaceId } = c.req.param();
  const member = await getMember({
    databases,
    workspaceId,
    userId:user.$id
  })
  if (!member || member.role !== MemberRole.ADMIN) {
    return c.json({error:"Unauthrized"},401)
  }
  const workspace = await databases.updateDocument(
    DATABASES_ID,
    WORKSPACES_ID,
    workspaceId,
    {
      inviteCode:generateInviteCode(6)
    }
  )
  return c.json({ data: workspace });
}).
  post("/:workspaceId/join", sessionMiddleware,
    zValidator("json", z.object({ code: z.string() })),
    
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");
      const { workspaceId } = c.req.param();
      const { code } = c.req.valid("json");
      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id
      });
      if (member) {
        return c.json({ error: "Already have an member" }, 400);
      }
      const workspace = await databases.getDocument<Workspace>(
        DATABASES_ID,
        WORKSPACES_ID,
        workspaceId
      );
      if (workspace.inviteCode !== code) {
        return c.json({error:'Invalid invite code'},400)
      }
      await databases.createDocument(
        DATABASES_ID,
        MEMBER_ID,
        ID.unique(),
        {
          workspaceId,
          userId: user.$id,
          role:MemberRole.MEMBER
        }
      )
      return c.json({
        data: workspace
      })

      
}).get("/:workspaceId/analytics", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");
    const { workspaceId } = c.req.param();
   
    const member = await getMember({
      databases,
      workspaceId,
      userId: user.$id,
    });
    if (!member) {
      return c.json({ error: "Unauthrized" }, 401);
    }
    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1))
    // for this month task
    const thisMonthTasks = await databases.listDocuments(
      DATABASES_ID,
      TASK_ID,
      [
        Query.equal("workspaceId", workspaceId),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
      ]
    );
    // last month tasks
     const lastMonthTasks = await databases.listDocuments(
       DATABASES_ID,
       TASK_ID,
       [
         Query.equal("workspaceId", workspaceId),
         Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
         Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
       ]
     );
    const taskCount = thisMonthTasks.total;
    const taskDiffernce = taskCount - lastMonthTasks.total;
    const thisMonthAssignedTasks = await databases.listDocuments(
      DATABASES_ID,
      TASK_ID,
      [
        Query.equal("workspaceId", workspaceId),
        Query.equal("assigneeId", member.$id),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
      ]
    );
    const lastMonthAssignedTasks = await databases.listDocuments(
      DATABASES_ID,
      TASK_ID,
      [
        Query.equal("workspaceId", workspaceId),
        Query.equal("assigneeId", member.$id),
        Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
      ]
    );
    const assignedTasksCount = thisMonthAssignedTasks.total;
    const assignedTaskDiffrence = assignedTasksCount - lastMonthAssignedTasks.total;
    const thisMonthIncompleteTasks = await databases.listDocuments(
      DATABASES_ID,
      TASK_ID,
      [
        Query.equal("workspaceId", workspaceId),
        Query.notEqual("status", TaskStatus.DONE),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
      ]
    );   
    const lastMonthIncompleteTasks = await databases.listDocuments(
      DATABASES_ID,
      TASK_ID,
      [
        Query.equal("workspaceId", workspaceId),
        Query.notEqual("status", TaskStatus.DONE),
        Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
      ]
    );
    const incompletedTaskCount = thisMonthIncompleteTasks.total;
    const incompletedTaskCountDiffernce =
      incompletedTaskCount - lastMonthIncompleteTasks.total;
    // Completed tasks
    const thisMonthCompleteTasks = await databases.listDocuments(
      DATABASES_ID,
      TASK_ID,
      [
        Query.equal("workspaceId", workspaceId),
        Query.equal("status", TaskStatus.DONE),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
      ]
    );
    const lastMonthcompleteTasks = await databases.listDocuments(
      DATABASES_ID,
      TASK_ID,
      [
        Query.equal("workspaceId", workspaceId),
        Query.equal("status", TaskStatus.DONE),
        Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
      ]
    );
    const completedTaskCount = thisMonthCompleteTasks.total;
    const completedTaskCountDiffernce =
      completedTaskCount - lastMonthcompleteTasks.total;
    // Overdue taksk
     const thisMonthOvedueTasks = await databases.listDocuments(
       DATABASES_ID,
       TASK_ID,
       [
         Query.equal("workspaceId", workspaceId),
         Query.equal("status", TaskStatus.DONE),
         Query.lessThan("dueDate", now.toISOString()),
         Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
         Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
       ]
     );
     const lastMonthOverdueTasks = await databases.listDocuments(
       DATABASES_ID,
       TASK_ID,
       [
         Query.equal("workspaceId", workspaceId),
         Query.equal("status", TaskStatus.DONE),
         Query.lessThan("dueDate", now.toISOString()),
         Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
         Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
       ]
     );
     const overDueTaskCount = thisMonthOvedueTasks.total;
     const overDueTaskCountDiffernce =
      overDueTaskCount - lastMonthOverdueTasks.total;
    return c.json({
      data: {
        taskCount,
        taskDiffernce,
        assignedTasksCount,
        assignedTaskDiffrence,
        completedTaskCount,
        completedTaskCountDiffernce,
        incompletedTaskCount,
        incompletedTaskCountDiffernce,
        overDueTaskCount,
        overDueTaskCountDiffernce
      },
    });
  });
export default app;
