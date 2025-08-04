import { createAdminClient } from "@/lib/appwrite";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { getMember } from "../utils";
import { DATABASES_ID, MEMBER_ID } from "@/config";
import { Query } from "node-appwrite";
import { Member, MemberRole } from "../types";
const app = new Hono()
    .get(
        "/",
        sessionMiddleware,
        zValidator(
            "query",
            z.object({
                workspaceId: z.string(),
            })
        ),
        async (c) => {
            const { users } = await createAdminClient();
            const databases = c.get("databases");
            const user = c.get("user");
            const { workspaceId } = c.req.valid("query");
            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id,
            });
            if (!member) {
                return c.json({ error: "Unauthorized" }, 401);
            }
            const members = await databases.listDocuments<Member>(DATABASES_ID, MEMBER_ID, [
                Query.equal("workspaceId", workspaceId),
            ]);
            const populateMembers = await Promise.all(
                members.documents.map(async (member) => {
                    const user = await users.get(member.userId);
                    return {
                        ...member,
                        name: user.name,
                        email: user.email,
                    };
                })
            );
            return c.json({
                data: {
                    ...members,
                    documents: populateMembers,
                },
            });
        }
    )
    .delete("/:memberId", sessionMiddleware, async (c) => {
        const { memberId } = c.req.param();
        const user = c.get("user");
        const databases = c.get("databases");
        const memberDelete = await databases.getDocument(
            DATABASES_ID,
            MEMBER_ID,
            memberId
        );
        const allMembersInWorkspace = await databases.listDocuments(
            DATABASES_ID,
            MEMBER_ID,
            [Query.equal("workspaceId", memberDelete.workspaceId)]
        );
        const member = await getMember({
            databases,
            workspaceId: memberDelete.workspaceId,
            userId: user.$id,
        });
        if (!member) {
            return c.json({ error: "Unauthorized" }, 401);
        }
        if (member.$id !== memberDelete.$id && member.role !== MemberRole.ADMIN) {
            return c.json({ error: "Unauthorized" }, 401);
        }
        if (allMembersInWorkspace.total === 1) {
            return c.json({ error: "Cannot delete the only memeber" }, 401);
        }
        await databases.deleteDocument(DATABASES_ID, MEMBER_ID, memberId);
        return c.json({ data: { $id: memberDelete.$id } });
    })
    .patch(
        "/:memberId",
        sessionMiddleware,
        zValidator("json", z.object({ role: z.nativeEnum(MemberRole) })),
        async (c) => {
            const { memberId } = c.req.param();
            const {role} = c.req.valid("json")
      const user = c.get("user");
      const databases = c.get("databases");
      const memeberToUpdate = await databases.getDocument(
        DATABASES_ID,
        MEMBER_ID,
        memberId
      );
      const allMembersInWorkspace = await databases.listDocuments(
        DATABASES_ID,
        MEMBER_ID,
        [Query.equal("workspaceId", memeberToUpdate.workspaceId)]
      );
      const member = await getMember({
        databases,
        workspaceId: memeberToUpdate.workspaceId,
        userId: user.$id,
      });
      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }
      if (
        member.$id !== memeberToUpdate.$id &&
        member.role !== MemberRole.ADMIN
      ) {
        return c.json({ error: "Unauthorized" }, 401);
      }
      if (allMembersInWorkspace.total === 1) {
        return c.json({ error: "Cannot downgrade(role change) the only memeber" }, 401);
      }
            await databases.updateDocument(DATABASES_ID, MEMBER_ID, memberId, {
          role
      });
      return c.json({ data: { $id: memeberToUpdate.$id } });
    }
  );
export default app;