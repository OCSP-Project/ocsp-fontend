// src/app/(dashboard)/contractor/projects/[id]/team/page.tsx
"use client";

import { useParams } from "next/navigation";

const ProjectTeamPage = () => {
  const params = useParams();
  const projectId = params.id as string;

  return (
    <div>
      <h1>Đội ngũ dự án #{projectId}</h1>
    </div>
  );
};

export default ProjectTeamPage;


