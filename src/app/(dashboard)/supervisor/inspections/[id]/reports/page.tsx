"use client";
import { useParams } from "next/navigation";

export default function InspectionReportsPage() {
  const params = useParams();
  const inspectionId = params.id as string;
  
  return (
    <div>
      <h1>Bao cao kiem tra #{inspectionId}</h1>
      <p>Coming soon</p>
    </div>
  );
}
