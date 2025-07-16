interface ProjectIdPageProps {
  params: {
    projectId: string;
  };
}
const ProjectIdPage = ({ params }: ProjectIdPageProps) => {
  return <div>{params.projectId}</div>;
};

export default ProjectIdPage;
