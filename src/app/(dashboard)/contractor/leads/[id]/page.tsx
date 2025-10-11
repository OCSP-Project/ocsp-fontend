// src/app/(dashboard)/contractor/leads/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";

const LeadDetailPage = () => {
  const params = useParams();
  const leadId = params.id as string;

  return (
    <div>
      <h1>Chi tiết cơ hội #{leadId}</h1>
    </div>
  );
};

export default LeadDetailPage;


