"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { modelAnalysisApi } from "@/lib/model-analysis/model-analysis.api";
import { useAuth, UserRole } from "@/hooks/useAuth";
import { Project3DModel } from "@/types/model-tracking.types";
import { Button } from "@/components/ui";

export default function Project3DModelIndexPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const projectId = params.id as string;

  const [models, setModels] = useState<Project3DModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
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
    if (projectId) load();
  }, [projectId]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-[calc(100vh-4rem)] bg-stone-900 pt-20 flex items-center justify-center">
          <div className="text-stone-300">Đang tải danh sách mô hình…</div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-[calc(100vh-4rem)] bg-stone-900 pt-20">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-red-400">
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
      <div className="min-h-[calc(100vh-4rem)] bg-stone-900 pt-16">
        <div className="bg-stone-800/90 backdrop-blur border-b border-stone-700 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/projects/${projectId}`}
              className="text-stone-400 hover:text-stone-300"
            >
              ← Quay lại
            </Link>
            <h1 className="text-lg font-bold text-amber-200">
              Danh sách mô hình 3D
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {user?.role === UserRole.Supervisor && (
              <Button
                onClick={() =>
                  router.push(`/projects/${projectId}/3d-model/upload`)
                }
                className="bg-amber-600 hover:bg-amber-500 text-stone-900 font-bold"
              >
                📤 Upload mới
              </Button>
            )}
            <Button
              onClick={() =>
                router.push(`/projects/${projectId}/3d-model/history`)
              }
              className="bg-stone-700 hover:bg-stone-600"
            >
              📜 Lịch sử
            </Button>
          </div>
        </div>

        {models.length === 0 ? (
          <div className="max-w-4xl mx-auto px-4 py-10">
            <div className="bg-stone-800/60 backdrop-blur-xl rounded-xl border border-stone-700 p-8 text-center">
              <div className="text-6xl mb-4">🏗️</div>
              <h2 className="text-2xl font-bold text-stone-200 mb-4">
                Chưa có mô hình 3D
              </h2>
              <p className="text-stone-400 mb-6">
                Dự án này chưa có mô hình 3D nào được upload.
              </p>
              {user?.role === UserRole.Supervisor && (
                <Button
                  onClick={() =>
                    router.push(`/projects/${projectId}/3d-model/upload`)
                  }
                  className="bg-amber-600 hover:bg-amber-500 text-stone-900 font-bold px-6 py-3"
                >
                  📤 Upload mô hình 3D
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {models.map((m) => (
              <div
                key={(m as any).modelId || (m as any).id}
                className="bg-stone-800/60 border border-stone-700 rounded-lg p-4 hover:border-stone-600 transition"
              >
                <div className="text-stone-200 font-semibold mb-1">
                  {m.fileName}
                </div>
                <div className="text-stone-400 text-sm mb-3">
                  {m.fileSizeMB.toFixed(2)}MB • {m.totalMeshes} meshes
                </div>
                <div className="flex justify-between items-center">
                  <Button
                    className="bg-blue-600 hover:bg-blue-500"
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
                  <Link
                    href={m.fileUrl}
                    target="_blank"
                    className="text-stone-400 hover:text-stone-200 text-sm"
                  >
                    Tải file
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
