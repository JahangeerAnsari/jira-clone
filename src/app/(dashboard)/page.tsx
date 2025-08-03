import { getCurrent } from "@/features/auth/queries";
import { getWorkspaces } from "@/features/workspaces/queries";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getCurrent();

  if (!user) {
    redirect("/sign-in");
  }

  const workspaces = await getWorkspaces();

  if (workspaces.total === 0 || !workspaces.document?.[0]?.$id) {
    redirect("/workspaces/create");
  }

  redirect(`/workspaces/${workspaces.document[0].$id}`);
}
