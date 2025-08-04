import { getCurrent } from "@/features/auth/queries";
import { JoinWorkspacePageForm } from "@/features/workspaces/components/join-workspace-form";
import { getWorkspaceInfo } from "@/features/workspaces/queries";
import { redirect } from "next/navigation";
interface JoinWorkspacePageProps{
    params: {
        workspaceId: string; 
    }
}
const JoinWorkspacePage = async ({params}: JoinWorkspacePageProps) => {
    const user = await getCurrent();
    const workspace = await getWorkspaceInfo({
      workspaceId: params.workspaceId,
    });
  if (!user) {
    redirect("/sign-in");
    }
    if (!workspace) {
         redirect("/")
     }
    return (
      <div className="w-full lg:max-w-xl">
        <JoinWorkspacePageForm intialValues={workspace} />
      </div>
    );
};
 
export default JoinWorkspacePage;