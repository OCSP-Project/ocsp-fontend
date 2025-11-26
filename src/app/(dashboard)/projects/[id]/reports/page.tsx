"use client";
import { useParams } from "next/navigation";

export default function ProjectReportsPage() {
  const params = useParams();
  const projectId = params.id as string;
  
  return (
    <div>
      <h1>Bao cao du an #{projectId}</h1>
      <p>Coming soon</p>
    </div>
  );
}
