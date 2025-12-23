"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import ModelViewer3D from "@/components/features/projects/ModelViewer3D";
import { modelAnalysisApi } from "@/lib/model-analysis/model-analysis.api";
import {
  BuildingElement,
  Project3DModel,
  TrackingStatistics,
} from "@/types/model-tracking.types";
import { Button } from "@/components/ui";

export default function ProjectModelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const modelId = params.modelId as string;

  const [model, setModel] = useState<Project3DModel | null>(null);
  const [elements, setElements] = useState<BuildingElement[]>([]);
  const [statistics, setStatistics] = useState<TrackingStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const m = await modelAnalysisApi.getModelById(modelId);
        setModel(m);
        const [els, stats] = await Promise.all([
          modelAnalysisApi.getBuildingElements(modelId).catch(() => []),
          modelAnalysisApi.getStatistics(projectId).catch(() => null),
        ]);
        setElements(els);
        // @ts-ignore allow null statistics shape gracefully
        setStatistics(stats);
      } catch (e: any) {
        setError(e?.response?.data?.message || "Không thể tải mô hình");
      } finally {
        setLoading(false);
      }
    };
    if (projectId && modelId) load();
  }, [projectId, modelId]);

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
          <div className="text-gray-700 relative z-10">Đang tải mô hình…</div>
        </div>
      </>
    );
  }

  if (error || !model) {
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
              <div className="font-semibold mb-2">Không thể tải mô hình</div>
              <div className="text-sm">{error}</div>
              <div className="mt-4">
                <Button
                  onClick={() => router.push(`/projects/${projectId}/3d-model`)}
                  className="text-white font-bold px-4 py-2 rounded-xl shadow-md hover:shadow-xl transition-all"
                  style={{
                    background:
                      "linear-gradient(135deg, #38c1b6 0%, #667eea 100%)",
                  }}
                >
                  ← Quay lại danh sách mô hình
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="h-screen bg-white pt-16 flex flex-col relative overflow-hidden">
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
              href={`/projects/${projectId}/3d-model`}
              className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              ← Danh sách mô hình
            </Link>
            <div>
              <h1
                className="text-lg font-bold"
                style={{
                  background:
                    "linear-gradient(135deg, #38c1b6 0%, #667eea 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                🏗️ {model.fileName}
              </h1>
              <p className="text-xs text-gray-600">
                {model.fileSizeMB.toFixed(2)}MB • {model.totalMeshes} meshes
              </p>
            </div>
          </div>
          <Button
            onClick={() =>
              router.push(`/projects/${projectId}/3d-model/${modelId}/tracking`)
            }
            className="text-white font-bold px-4 py-2 rounded-xl shadow-md hover:shadow-xl transition-all"
            style={{
              background: "linear-gradient(135deg, #38c1b6 0%, #667eea 100%)",
            }}
          >
            📊 Tracking & Quản lý Elements
          </Button>
        </div>

        <div className="flex-1 flex overflow-hidden relative z-10">
          <div className="flex-1 relative">
            <ModelViewer3D glbUrl={model.fileUrl} elements={elements} />
          </div>
          <div className="w-80 bg-white/95 backdrop-blur-xl border-l-2 border-gray-200 p-4 overflow-y-auto shadow-sm">
            <div
              className="text-sm font-semibold mb-2"
              style={{
                background: "linear-gradient(135deg, #38c1b6 0%, #667eea 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              📊 Thống kê
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng meshes</span>
                <span className="text-gray-800 font-semibold">
                  {model.totalMeshes}
                </span>
              </div>
              {statistics && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tổng elements</span>
                    <span className="text-gray-800 font-semibold">
                      {statistics.total_elements}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">% hoàn thành</span>
                    <span
                      className="font-bold"
                      style={{
                        background:
                          "linear-gradient(135deg, #38c1b6 0%, #667eea 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      {statistics.completion_percentage.toFixed(1)}%
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
