import { getCurrent } from "@/features/auth/actions";
import { getWorkspaces } from "@/features/workspaces/actions";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getCurrent();
  const workspaces = await getWorkspaces();
 
  if (!user) {
    redirect("/sign-in");
  }
  // if there is no workspace redirect to create workspace page
  if (workspaces.total === 0) {
     redirect("/workspaces/create")
  } else {
    // else redirect to the perticular workspace
    redirect(`/workspaces/${workspaces?.documents[0].$id}`)
   }
  return (
    <div className="bg-neutral-500 p-4 h-full">
     
    </div>
  );
}
