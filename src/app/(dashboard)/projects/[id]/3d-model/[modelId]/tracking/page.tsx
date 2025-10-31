"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/layout/Header";
import ModelViewer3D from "@/components/features/projects/ModelViewer3D";
import ComponentTrackingPanel from "@/components/features/projects/ComponentTrackingPanel";
import { modelAnalysisApi } from "@/lib/model-analysis/model-analysis.api";
import { buildingElementsApi } from "@/lib/building-elements/building-elements.api";
import { BuildingElement, ModelSummary } from "@/types/model-tracking.types";

export default function TrackingPage() {
  const params = useParams();
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
      const model = await modelAnalysisApi.getModelById(modelId);
      setGlbUrl(model.fileUrl);

      const els = await buildingElementsApi.getByModel(modelId);
      setElements(els as any);

      const sum = await buildingElementsApi.getModelSummary(modelId);
      setSummary(sum);
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

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <Header />
      <div className="h-screen pt-16 flex">
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
    </>
  );
}
