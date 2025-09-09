// src/app/(dashboard)/contractor/projects/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";

const ProjectDetailPage = () => {
  const params = useParams();
  const projectId = params.id;

  // Fetch project data based on projectId

  return (
    <div>
      <h1>Chi tiết dự án #{projectId}</h1>
      {/* Project details, timeline, team, etc */}
    </div>
  );
};
