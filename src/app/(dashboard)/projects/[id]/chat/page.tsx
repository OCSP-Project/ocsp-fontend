"use client";

import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Spin } from "antd";

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

export default function ProjectChatPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  if (!projectId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-rose-400 mb-4">
            Không tìm thấy dự án
          </h1>
          <button
            onClick={() => router.push("/projects")}
            className="px-4 py-2 bg-amber-600 text-stone-900 rounded-md hover:bg-amber-500 transition"
          >
            Quay lại danh sách dự án
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProjectChat
      projectId={projectId}
      onBack={() => router.push(`/projects/${projectId}`)}
    />
  );
}
