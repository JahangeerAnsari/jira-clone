import { getCurrent } from "@/features/auth/queries";
import { MemberList } from "@/features/workspaces/components/member-list";
import { redirect } from "next/navigation";

const WorkspaceIdMemberPage = async () => {
    const user = await getCurrent()
    if (!user) {
           redirect("/sign-in")
       }
    return ( 
        <div>
        <MemberList/>
        </div>
     );
}
 
export default WorkspaceIdMemberPage;