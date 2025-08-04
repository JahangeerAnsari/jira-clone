import { getCurrent } from "@/features/auth/queries";
import { redirect } from "next/navigation";
import { ProjectSettingClientIdPage } from "./client";

const ProjectIdSettingsPage = async () => {
  const user = await getCurrent();
  if (!user) {
    redirect("/sign-in");
  }
 
    return (
      <ProjectSettingClientIdPage/>
    );
};
 
export default ProjectIdSettingsPage;