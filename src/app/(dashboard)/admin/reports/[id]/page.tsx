// src/app/(dashboard)/admin/reports/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";

const AdminReportDetailPage = () => {
  const params = useParams();
  const reportId = params.id as string;

  return (
    <div>
      <h1>Chi tiet bao cao #{reportId}</h1>
      <p>Trang quan tri chi tiet bao cao - Coming soon</p>
    </div>
  );
};

export default AdminReportDetailPage;
