"use client";
import { DottedSeparator } from "@/components/dotted-separator";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { useJoinWorkspace } from "../api/use-join-workspace";
import { useInviteCode } from "../hooks/use-invite-code";
import { useWorkspaceId } from "../hooks/use-workspace-id";
import { useRouter } from "next/navigation";
interface JoinWorkspacePageFormProps {
  intialValues: {
    name: string;
  };
}
export const JoinWorkspacePageForm = ({
  intialValues,
}: JoinWorkspacePageFormProps) => {
  const router = useRouter();
  const { mutate, isPending: isWorkspaceJoinPending } = useJoinWorkspace();
  const inviteCode = useInviteCode();
  const workspaceId = useWorkspaceId();
  const onSubmit = () => {
    mutate(
      {
        param: { workspaceId },
        json: { code: inviteCode },
      },
      {
        onSuccess: ({ data }) => {
          router.push(`/workspaces/${data.$id}`);
        },
      }
    );
  };

  return (
    <Card className="w-full h-full border-none shadow-none">
      <CardHeader className="p-7">
        <CardTitle className="text-xl font-bold">Join workspace</CardTitle>
        <CardDescription>
          You have invited to join to{" "}
          <strong className="font-bold text-blue-500">
            {intialValues.name}
          </strong>{" "}
          workspace
        </CardDescription>
      </CardHeader>
      <div className="px-7">
        <DottedSeparator />
      </div>
      <CardContent className="p-7">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-1">
          <Button
            className="w-full lg:w-fit"
            variant="secondary"
            type="button"
            asChild
            size="lg"
            disabled={isWorkspaceJoinPending}
          >
            <Link href="/">Cancel</Link>
          </Button>
          <Button
            className="w-full lg:w-fit"
            size="lg"
            onClick={onSubmit}
            disabled={isWorkspaceJoinPending}
          >
            Join Workspace
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
