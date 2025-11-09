"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Spin } from "antd";
import { projectsApi } from "@/lib/projects/projects.api";

const ProjectChat = dynamic(
  () => import("@/components/features/chat/components/ProjectChat"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" tip="Đang tải chat..." />
      </div>
    ),
  }
);

export default function InspectionChatPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string; // In inspection context, id is projectId

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyProject = async () => {
      if (!projectId) {
        setError("Không tìm thấy dự án");
        setLoading(false);
        return;
      }

      try {
        // Verify project exists and user has access
        await projectsApi.getProject(projectId);
      } catch (e: any) {
        setError(e?.response?.data?.message || "Không thể truy cập dự án này");
      } finally {
        setLoading(false);
      }
    };

    verifyProject();
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }

  if (error || !projectId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-rose-400 mb-4">
            {error || "Không tìm thấy dự án"}
          </h1>
          <button
            onClick={() => router.push("/supervisor/inspections")}
            className="px-4 py-2 bg-amber-600 text-stone-900 rounded-md hover:bg-amber-500 transition"
          >
            Quay lại danh sách kiểm tra
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProjectChat
      projectId={projectId}
      onBack={() => router.push(`/supervisor/inspections/${projectId}`)}
    />
  );
}
