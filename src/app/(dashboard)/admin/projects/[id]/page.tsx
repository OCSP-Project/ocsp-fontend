// src/app/(dashboard)/admin/projects/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";

const AdminProjectDetailPage = () => {
  const params = useParams();
  const projectId = params.id as string;

  return (
    <div>
      <h1>Chi tiet du an #{projectId}</h1>
      <p>Trang quan tri chi tiet du an - Coming soon</p>
    </div>
  );
};

export default AdminProjectDetailPage;
