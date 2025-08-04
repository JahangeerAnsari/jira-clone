import { sessionMiddleware } from "@/lib/session-middleware";
import { createTaskSchema } from "../schema";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { getMember } from "@/features/members/utils";
import { DATABASES_ID, MEMBER_ID, PROJECT_ID, TASK_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { z } from "zod";
import { Task, TaskStatus } from "../types";
import { createAdminClient } from "@/lib/appwrite";
import { Project } from "@/features/projects/types";


const app = new Hono()
  .delete("/:taskId", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const databases = c.get("databases");
    const { taskId } = c.req.param();
    const task = await databases.getDocument<Task>(
      DATABASES_ID,
      TASK_ID,
      taskId
    );
    const member = await getMember({
      databases,
      workspaceId: task.workspaceId,
      userId: user.$id,
    });
    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    await databases.deleteDocument(DATABASES_ID, TASK_ID, taskId);
    return c.json({ data: { $id: task.$id } });
  })
  .get(
    "/",
    sessionMiddleware,
    zValidator(
      "query",
      z.object({
        workspaceId: z.string(),
        projectId: z.string().nullish(),
        assigneeId: z.string().nullish(),
        status: z.nativeEnum(TaskStatus).nullish(),
        search: z.string().nullish(),
        dueDate: z.string().nullish(),
      })
    ),
    async (c) => {
      const { users } = await createAdminClient();
      const databases = c.get("databases");
      const user = c.get("user");
      const { workspaceId, assigneeId, dueDate, projectId, search, status } =
        c.req.valid("query");
      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });
      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }
      const query = [
        Query.equal("workspaceId", workspaceId),
        Query.orderDesc("$createdAt"),
      ];
      if (projectId) {
        console.log("projectId:", projectId);
        query.push(Query.equal("projectId", projectId));
      }
      if (status) {
        console.log("status:", status);
        query.push(Query.equal("status", status));
      }
      if (assigneeId) {
        console.log("assigneeId:", assigneeId);
        query.push(Query.equal("assigneeId", assigneeId));
      }
      if (dueDate) {
        console.log("dueDate:", dueDate);
        query.push(Query.equal("dueDate", dueDate));
      }
      if (search) {
        console.log("search:", search);
        query.push(Query.search("name ", search));
      }

      const tasks = await databases.listDocuments<Task>(
        DATABASES_ID,
        TASK_ID,
        query
      );
      const projectIds = tasks.documents.map((task) => task.projectId);
      const assigneeIds = tasks.documents.map((task) => task.assigneeId);
      const projects = await databases.listDocuments<Project>(
        DATABASES_ID,
        PROJECT_ID,
        projectIds.length > 0 ? [Query.contains("$id", projectIds)] : []
      );
      const memebers = await databases.listDocuments(
        DATABASES_ID,
        MEMBER_ID,
        assigneeIds.length > 0 ? [Query.contains("$id", assigneeIds)] : []
      );
      const assignees = await Promise.all(
        memebers.documents.map(async (member) => {
          const user = await users.get(member.userId);
          return {
            ...member,
            name: user.name,
            email: user.email,
          };
        })
      );
      const populateTasks = tasks.documents.map((task) => {
        const project = projects.documents.find(
          (project) => project.$id === task.projectId
        );
        const assignee = assignees.find(
          (assignee) => assignee.$id === task.assigneeId
        );

        return {
          ...task,
          project,
          assignee,
        };
      });
      return c.json({
        data: {
          ...tasks,
          documents: populateTasks,
        },
      });
    }
  )
  .post(
    "/",
    sessionMiddleware,
    zValidator("json", createTaskSchema),
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");
      const {
        name,
        assigneeId,
        dueDate,
        projectId,
        status,
        
        workspaceId,
      } = c.req.valid("json");

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });
      // if there is no member not allowed to create task inside the workspace
      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }
      const highestPositionTask = await databases.listDocuments(
        DATABASES_ID,
        TASK_ID,
        [
          Query.equal("status", status),
          Query.equal("workspaceId", workspaceId),
          Query.orderAsc("position"),
          Query.limit(1),
        ]
      );
      const newPosition =
        highestPositionTask.documents.length > 0
          ? highestPositionTask.documents[0].position + 1000
          : 1000;
      const task = await databases.createDocument(
        DATABASES_ID,
        TASK_ID,
        ID.unique(),
        {
          name,
          status,
          workspaceId,
          projectId,
          dueDate,
          assigneeId,
          position: newPosition,
        }
      );
      return c.json({ data: task });
    }
  )
  .patch(
    "/:taskId",
    sessionMiddleware,
    zValidator("json", createTaskSchema.partial()),
    async (c) => {
      const databases = c.get("databases");
      const { taskId } = c.req.param();
      const user = c.get("user");
      const { name, assigneeId, dueDate, projectId, status, description } =
        c.req.valid("json");
      const existingTasks = await databases.getDocument<Task>(
        DATABASES_ID,
        TASK_ID,
        taskId
      );

      const member = await getMember({
        databases,
        workspaceId: existingTasks.workspaceId,
        userId: user.$id,
      });
      // if there is no member not allowed to create task inside the workspace
      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const task = await databases.updateDocument<Task>(
        DATABASES_ID,
        TASK_ID,
        taskId,
        {
          name,
          status,
          projectId,
          dueDate,
          assigneeId,
          description,
        }
      );
      return c.json({ data: task });
    }
  )
  .get("/:taskId", sessionMiddleware, async (c) => {
    const currentUser = c.get("user");
    const databases = c.get("databases");
    const {  users } = await createAdminClient();
    const { taskId } = c.req.param();
    const task = await databases.getDocument<Task>(
      DATABASES_ID,
      TASK_ID,
      taskId
    );
    const currentMember = await getMember({
      databases,
      workspaceId: task.workspaceId,
      userId: currentUser.$id,
    });
    if (!currentMember) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const project = await databases.getDocument<Project>(
      DATABASES_ID,
      PROJECT_ID,
      task.projectId
    );
    const member = await databases.getDocument(
      DATABASES_ID,
      MEMBER_ID,
      task.assigneeId
    );
    const user = await users.get(member.userId);
    const assignee = {
      ...member,
      name: user.name,
      email: user.email,
    };
    return c.json({
      data: {
        ...task,
        project,
        assignee,
      },
    });
  })
  .post("/bulk-update", sessionMiddleware,
    zValidator(
      "json",
      z.object({
        tasks: z.array(
          z.object({
            $id: z.string(),
            status: z.nativeEnum(TaskStatus),
            position:z.number().int().positive().min(1000).max(1_000_000),
          })
        )
      })
    ), async (c) => {
      const databases = c.get("databases");
      const user = c.get("user")
      const { tasks } =  c.req.valid("json");
      const taskToUpdate = await databases.listDocuments<Task>(
        DATABASES_ID,
        TASK_ID,
        [Query.contains("$id",tasks.map((task) => task.$id))]
      )
     const workspaceIds = new Set(
       taskToUpdate.documents.map((task) => task.workspaceId)
     );

     if (workspaceIds.size !== 1) {
       return c.json({ error: "All tasks must belong to the same workspace" });
     }

     const workspaceId = workspaceIds.values().next().value as string;

     const member = await getMember({
       databases,
       workspaceId,
       userId: user.$id,
     });

      if (!member) {
        return c.json({error:"Unauthrized"},401)
      }
      const updateTasks = await Promise.all(
        tasks.map(async (task) => {
          const { $id, position, status } = task;
          return databases.updateDocument<Task>(
            DATABASES_ID,
            TASK_ID,
            $id,
            { status, position }
          )
        })
      );
      return c.json({data:updateTasks})

    }
  );
export default app;
