"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { notification, Modal } from "antd";
import Header from "@/components/layout/Header";
import { modelAnalysisApi } from "@/lib/model-analysis/model-analysis.api";
import { useAuth, UserRole } from "@/hooks/useAuth";
import { Project3DModel } from "@/types/model-tracking.types";
import { Button } from "@/components/ui";

const { confirm } = Modal;

export default function Project3DModelIndexPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const projectId = params.id as string;

  const [models, setModels] = useState<Project3DModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadModels = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await modelAnalysisApi.listProjectModels(projectId);
      setModels(list);
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Không thể tải danh sách mô hình"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) loadModels();
  }, [projectId]);

  const handleDeleteModel = (modelId: string, fileName: string) => {
    confirm({
      title: "Xóa mô hình 3D",
      content: `Bạn có chắc muốn xóa mô hình "${fileName}"? File trên S3 cũng sẽ bị xóa và không thể khôi phục.`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setDeleting(modelId);
          await modelAnalysisApi.deleteModel(modelId);
          notification.success({
            message: "Đã xóa mô hình",
            description: `Mô hình "${fileName}" đã được xóa thành công.`,
          });
          // Reload models list
          await loadModels();
        } catch (e: any) {
          notification.error({
            message: "Lỗi xóa mô hình",
            description:
              e?.response?.data?.message ||
              e?.message ||
              "Có lỗi xảy ra khi xóa mô hình",
          });
        } finally {
          setDeleting(null);
        }
      },
    });
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-[calc(100vh-4rem)] bg-white relative overflow-hidden pt-20 flex items-center justify-center">
          <div className="absolute inset-0 bg-white">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                radial-gradient(circle at top left, rgba(56, 193, 182, 0.5), transparent 70%),
                radial-gradient(circle at bottom right, rgba(102, 126, 234, 0.3), transparent 70%)
              `,
                filter: "blur(80px)",
              }}
            ></div>
          </div>
          <div className="text-gray-700 relative z-10">
            Đang tải danh sách mô hình…
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-[calc(100vh-4rem)] bg-white relative overflow-hidden pt-20">
          <div className="absolute inset-0 bg-white">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                radial-gradient(circle at top left, rgba(56, 193, 182, 0.5), transparent 70%),
                radial-gradient(circle at bottom right, rgba(102, 126, 234, 0.3), transparent 70%)
              `,
                filter: "blur(80px)",
              }}
            ></div>
          </div>
          <div className="max-w-4xl mx-auto px-4 relative z-10">
            <div className="bg-red-50/90 backdrop-blur-sm border-2 border-red-200 rounded-xl p-6 text-red-700">
              {error}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-4rem)] bg-white relative overflow-hidden pt-16">
        <div className="absolute inset-0 bg-white">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
              radial-gradient(circle at top left, rgba(56, 193, 182, 0.5), transparent 70%),
              radial-gradient(circle at bottom right, rgba(102, 126, 234, 0.3), transparent 70%)
            `,
              filter: "blur(80px)",
            }}
          ></div>
        </div>
        <div className="bg-white/95 backdrop-blur-xl border-b-2 border-gray-200 px-4 py-3 flex items-center justify-between relative z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <Link
              href={`/projects/${projectId}`}
              className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              ← Quay lại
            </Link>
            <h1
              className="text-lg font-bold"
              style={{
                background: "linear-gradient(135deg, #38c1b6 0%, #667eea 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Danh sách mô hình 3D
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {user?.role === UserRole.Supervisor && (
              <Button
                onClick={() =>
                  router.push(`/projects/${projectId}/3d-model/upload`)
                }
                className="text-white font-bold px-4 py-2 rounded-xl shadow-md hover:shadow-xl transition-all"
                style={{
                  background:
                    "linear-gradient(135deg, #38c1b6 0%, #667eea 100%)",
                }}
              >
                📤 Upload mới
              </Button>
            )}
            <Button
              onClick={() =>
                router.push(`/projects/${projectId}/3d-model/history`)
              }
              className="bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 font-bold px-4 py-2 rounded-xl border-2 border-gray-200 transition-all hover:border-gray-300 shadow-sm hover:shadow-md"
            >
              📜 Lịch sử
            </Button>
          </div>
        </div>

        {models.length === 0 ? (
          <div className="max-w-4xl mx-auto px-4 py-10 relative z-10">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl border-2 border-gray-200 p-8 text-center shadow-xl">
              <div className="text-6xl mb-4">🏗️</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Chưa có mô hình 3D
              </h2>
              <p className="text-gray-600 mb-6">
                Dự án này chưa có mô hình 3D nào được upload....
              </p>
              {user?.role === UserRole.Supervisor && (
                <Button
                  onClick={() =>
                    router.push(`/projects/${projectId}/3d-model/upload`)
                  }
                  className="text-white font-bold px-6 py-3 rounded-xl shadow-md hover:shadow-xl transition-all"
                  style={{
                    background:
                      "linear-gradient(135deg, #38c1b6 0%, #667eea 100%)",
                  }}
                >
                  📤 Upload mô hình 3D
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
            {models.map((m) => (
              <div
                key={(m as any).modelId || (m as any).id}
                className="bg-white/95 backdrop-blur-xl border-2 border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-all shadow-md hover:shadow-xl"
              >
                <div className="text-gray-800 font-semibold mb-1">
                  {m.fileName}
                </div>
                <div className="text-gray-600 text-sm mb-3">
                  {m.fileSizeMB.toFixed(2)}MB • {m.totalMeshes} meshes
                </div>
                <div className="flex gap-2 items-center mb-2">
                  <Button
                    className="flex-1 text-white font-bold rounded-xl shadow-sm hover:shadow-md transition-all"
                    style={{
                      background:
                        "linear-gradient(135deg, #38c1b6 0%, #667eea 100%)",
                    }}
                    onClick={() =>
                      router.push(
                        `/projects/${projectId}/3d-model/${
                          (m as any).modelId || (m as any).id
                        }`
                      )
                    }
                  >
                    👁️ Xem
                  </Button>
                  {user?.role === UserRole.Supervisor && (
                    <Button
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl shadow-sm hover:shadow-md transition-all"
                      onClick={() =>
                        handleDeleteModel(
                          (m as any).modelId || (m as any).id,
                          m.fileName
                        )
                      }
                      disabled={
                        deleting === ((m as any).modelId || (m as any).id)
                      }
                    >
                      {deleting === ((m as any).modelId || (m as any).id)
                        ? "⏳"
                        : "🗑️"}
                    </Button>
                  )}
                </div>
                <Link
                  href={m.fileUrl}
                  target="_blank"
                  className="text-gray-600 hover:text-gray-800 text-sm block text-center font-medium transition-colors"
                >
                  Tải file
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
