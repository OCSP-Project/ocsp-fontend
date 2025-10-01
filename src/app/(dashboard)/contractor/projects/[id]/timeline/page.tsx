// src/app/(dashboard)/contractor/projects/[id]/timeline/page.tsx
"use client";

import { useParams } from "next/navigation";

const ProjectTimelinePage = () => {
  const params = useParams();
  const projectId = params.id as string;

  return (
    <div>
      <h1>Tiến độ dự án #{projectId}</h1>
    </div>
  );
};

export default ProjectTimelinePage;


