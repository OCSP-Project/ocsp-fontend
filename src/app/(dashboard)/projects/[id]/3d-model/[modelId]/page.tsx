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
        <div className="min-h-[calc(100vh-4rem)] bg-stone-900 pt-20 flex items-center justify-center">
          <div className="text-stone-300">Đang tải mô hình…</div>
        </div>
      </>
    );
  }

  if (error || !model) {
    return (
      <>
        <Header />
        <div className="min-h-[calc(100vh-4rem)] bg-stone-900 pt-20">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
              <div className="text-red-400 font-semibold mb-2">
                Không thể tải mô hình
              </div>
              <div className="text-stone-300 text-sm">{error}</div>
              <div className="mt-4">
                <Button
                  onClick={() => router.push(`/projects/${projectId}/3d-model`)}
                  className="bg-stone-700 hover:bg-stone-600"
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
      <div className="h-screen bg-stone-900 pt-16 flex flex-col">
        <div className="bg-stone-800/90 backdrop-blur border-b border-stone-700 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/projects/${projectId}/3d-model`}
              className="text-stone-400 hover:text-stone-300"
            >
              ← Danh sách mô hình
            </Link>
            <div>
              <h1 className="text-lg font-bold text-amber-200">
                🏗️ {model.fileName}
              </h1>
              <p className="text-xs text-stone-400">
                {model.fileSizeMB.toFixed(2)}MB • {model.totalMeshes} meshes
              </p>
            </div>
          </div>
          <Button
            onClick={() =>
              router.push(`/projects/${projectId}/3d-model/${modelId}/tracking`)
            }
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold"
          >
            📊 Tracking & Quản lý Elements
          </Button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 relative">
            <ModelViewer3D glbUrl={model.fileUrl} elements={elements} />
          </div>
          <div className="w-80 bg-stone-800/90 border-l border-stone-700 p-4 overflow-y-auto">
            <div className="text-sm text-stone-300 font-semibold mb-2">
              📊 Thống kê
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-400">Tổng meshes</span>
                <span className="text-white font-semibold">
                  {model.totalMeshes}
                </span>
              </div>
              {statistics && (
                <>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Tổng elements</span>
                    <span className="text-white font-semibold">
                      {statistics.total_elements}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">% hoàn thành</span>
                    <span className="text-blue-400 font-bold">
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
