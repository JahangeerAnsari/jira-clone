import { DATABASES_ID, IMAGES_ID, PROJECT_ID, TASK_ID } from "@/config";
import { getMember } from "@/features/members/utils";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import {endOfMonth,startOfMonth,subMonths} from "date-fns"
import { z } from "zod";
import { createProjectSchema, UpdateProjectSchema } from "../schema";
import { Project } from "../types";
import { TaskStatus } from "@/features/tasks/types";

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
  )

  .patch(
    "/:projectId",
    sessionMiddleware,
    zValidator("form", UpdateProjectSchema),
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
      );
      const member = await getMember({
        databases,
        workspaceId: existingProject.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthrized" }, 401);
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
        uploadImageUrl = image;
      }

      const project = await databases.updateDocument(
        DATABASES_ID,
        PROJECT_ID,
        projectId,
        {
          name,
          imageUrl: uploadImageUrl,
        }
      );
      return c.json({ data: project });
    }
  )
  .get("/:projectId", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const databases = c.get("databases");
    const { projectId } = c.req.param();
    const project = await databases.getDocument<Project>(
      DATABASES_ID,
      PROJECT_ID,
      projectId
    );
    const member = await getMember({
      databases,
      workspaceId: project.workspaceId,
      userId: user.$id,
    });
    if (!member) {
      return c.json({ error: "Unauthrized" }, 401);
    }
    return c.json({ data: project });
  })
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
      const projects = await databases.listDocuments<Project>(DATABASES_ID, PROJECT_ID, [
        Query.equal("workspaceId", workspaceId),
        Query.orderDesc("$createdAt"),
      ]);
      return c.json({ data: projects });
    }
  )
  .delete("/:projectId", sessionMiddleware, async (c) => {
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
    if (!member) {
      return c.json({ error: "Unauthrized" }, 401);
    }
    // delete task related to project
    await databases.deleteDocument(DATABASES_ID, PROJECT_ID, projectId);
    return c.json({ data: { $id: existingProject.$id } });
  })
  .get("/:projectId/analytics", sessionMiddleware, async (c) => {
    const databases = c.get("databases");
    const user = c.get("user");
    const { projectId } = c.req.param();
    const project = await databases.getDocument<Project>(
      DATABASES_ID,
      PROJECT_ID,
      projectId
    );
    const member = await getMember({
      databases,
      workspaceId: project.workspaceId,
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
        Query.equal("projectId", projectId),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
      ]
    );
    // last month tasks
     const lastMonthTasks = await databases.listDocuments(
       DATABASES_ID,
       TASK_ID,
       [
         Query.equal("projectId", projectId),
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
        Query.equal("projectId", projectId),
        Query.equal("assigneeId",member.$id),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
      ]
    );
    const lastMonthAssignedTasks = await databases.listDocuments(
      DATABASES_ID,
      TASK_ID,
      [
        Query.equal("projectId", projectId),
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
        Query.equal("projectId", projectId),
        Query.notEqual("status", TaskStatus.DONE),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
      ]
    );   
    const lastMonthIncompleteTasks = await databases.listDocuments(
      DATABASES_ID,
      TASK_ID,
      [
        Query.equal("projectId", projectId),
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
        Query.equal("projectId", projectId),
        Query.equal("status", TaskStatus.DONE),
        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
      ]
    );
    const lastMonthcompleteTasks = await databases.listDocuments(
      DATABASES_ID,
      TASK_ID,
      [
        Query.equal("projectId", projectId),
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
         Query.equal("projectId", projectId),
         Query.equal("status", TaskStatus.DONE),
         Query.lessThan("dueDate",now.toISOString()),
         Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
         Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
       ]
     );
     const lastMonthOverdueTasks = await databases.listDocuments(
       DATABASES_ID,
       TASK_ID,
       [
         Query.equal("projectId", projectId),
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
