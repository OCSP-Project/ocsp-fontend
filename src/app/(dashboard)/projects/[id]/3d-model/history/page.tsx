"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { modelAnalysisApi } from "@/lib/model-analysis/model-analysis.api";
import { Button } from "@/components/ui";
import type { Project3DModel } from "@/types/model-tracking.types";

export default function ModelHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [current, setCurrent] = useState<Project3DModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const model = await modelAnalysisApi.getModelInfo(projectId);
        setCurrent(model);
      } catch (e: any) {
        setError(e?.response?.data?.message || "Không thể tải lịch sử mô hình");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [projectId]);

  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-stone-900 to-stone-900 pt-20">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href={`/projects/${projectId}/3d-model`}
                className="text-stone-400 hover:text-stone-300"
              >
                ← Quay lại 3D Model
              </Link>
              <span className="text-stone-600">/</span>
              <h1 className="text-2xl font-bold text-amber-200">
                📜 Lịch sử mô hình
              </h1>
            </div>
            <Button
              onClick={() =>
                router.push(`/projects/${projectId}/3d-model/upload`)
              }
              className="bg-amber-600 hover:bg-amber-500 text-stone-900 font-bold"
            >
              📤 Upload mới
            </Button>
          </div>

          {loading ? (
            <div className="text-stone-300">Đang tải...</div>
          ) : error ? (
            <div className="text-red-400">{error}</div>
          ) : !current ? (
            <div className="text-stone-300">Chưa có mô hình nào.</div>
          ) : (
            <div className="space-y-4">
              <div className="bg-stone-800/60 border border-stone-700 rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-stone-200 font-semibold">
                      Phiên bản hiện tại
                    </div>
                    <div className="text-stone-400 text-sm">
                      {current.fileName} • {current.fileSizeMB.toFixed(2)}MB •{" "}
                      {current.totalMeshes} meshes
                    </div>
                  </div>
                  <Button
                    onClick={() =>
                      router.push(`/projects/${projectId}/3d-model`)
                    }
                    className="bg-stone-700 hover:bg-stone-600"
                  >
                    Xem
                  </Button>
                </div>
              </div>

              {/* Gợi ý: Backend có thể cung cấp danh sách phiên bản trong tương lai */}
              <div className="text-stone-500 text-sm">
                Hiện chỉ hiển thị phiên bản mới nhất. Hỗ trợ nhiều phiên bản sẽ
                được cập nhật khi API sẵn sàng.
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
