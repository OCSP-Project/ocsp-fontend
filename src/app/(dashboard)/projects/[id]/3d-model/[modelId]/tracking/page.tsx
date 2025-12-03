"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import ModelViewer3D from "@/components/features/projects/ModelViewer3D";
import ComponentTrackingPanel from "@/components/features/projects/ComponentTrackingPanel";
import { modelAnalysisApi } from "@/lib/model-analysis/model-analysis.api";
import { buildingElementsApi } from "@/lib/building-elements/building-elements.api";
import { BuildingElement, ModelSummary } from "@/types/model-tracking.types";
import { Button } from "@/components/ui";

export default function TrackingPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const modelId = params.modelId as string;

  const [glbUrl, setGlbUrl] = useState<string>("");
  const [elements, setElements] = useState<BuildingElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<BuildingElement>();
  const [summary, setSummary] = useState<ModelSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [model, els, sum] = await Promise.all([
        modelAnalysisApi.getModelById(modelId),
        buildingElementsApi.getByModel(modelId),
        buildingElementsApi.getModelSummary(modelId)
      ]);

      console.log("🔍 Model data:", model);
      console.log("🔍 Model fileUrl:", model.fileUrl);
      console.log("🔍 Loaded elements:", els);
      console.log("🔍 Elements count:", Array.isArray(els) ? els.length : 0);

      // Set glbUrl first to avoid race condition
      setGlbUrl(model.fileUrl);

      // Then set elements and summary in next render
      setTimeout(() => {
        setElements(els as any);
        setSummary(sum);
      }, 0);
    } catch (error) {
      console.error("Load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCompletion = async (
    _elementId: string,
    _percentage: number,
    _photos: File[]
  ) => {
    await loadData();
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="h-screen pt-16 flex items-center justify-center bg-stone-900">
          <div className="text-stone-300">Loading...</div>
        </div>
      </>
    );
  }

  // Empty state: no elements yet
  if (elements.length === 0) {
    return (
      <>
        <Header />
        <div className="h-screen pt-16 flex bg-stone-900">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="text-6xl mb-4">📦</div>
              <h2 className="text-2xl font-bold text-stone-200 mb-2">
                Chưa có Building Elements
              </h2>
              <p className="text-stone-400 mb-4">
                Tạo elements bằng cách chọn meshes từ mô hình 3D
              </p>
              <Button
                onClick={() =>
                  router.push(
                    `/projects/${projectId}/3d-model/${modelId}/elements/create`
                  )
                }
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-bold"
              >
                ➕ Tạo Element (Interactive)
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="h-screen pt-16 flex flex-col">
        {/* Top bar with create button */}
        <div className="bg-stone-800/90 backdrop-blur border-b border-stone-700 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-amber-200">
              📊 Tracking & Quản lý Elements
            </h1>
            <span className="text-xs text-stone-400">
              {elements.length} elements
            </span>
          </div>
          <Button
            onClick={() =>
              router.push(
                `/projects/${projectId}/3d-model/${modelId}/elements/create`
              )
            }
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold"
          >
            ➕ Tạo Element Mới (Selection Box)
          </Button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <ComponentTrackingPanel
            selectedElement={selectedElement as any}
            statistics={{
              total_elements: summary?.totalElements || 0,
              by_type: { walls: 0, columns: 0, slabs: 0, beams: 0 },
              by_status: {
                not_started: summary?.notStarted || 0,
                in_progress: summary?.inProgress || 0,
                completed: summary?.completed || 0,
              },
              total_volume: 0,
              completion_percentage: summary?.averageCompletion || 0,
            }}
            onUpdateCompletion={handleUpdateCompletion}
          />

          <div className="flex-1">
            <ModelViewer3D
              glbUrl={glbUrl}
              elements={elements}
              onElementSelect={setSelectedElement as any}
              selectedElementId={selectedElement?.id}
            />
          </div>
        </div>
      </div>
    </>
  );
}
