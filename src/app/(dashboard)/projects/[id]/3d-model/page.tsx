"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import ModelViewer3D from "@/components/features/projects/ModelViewer3D";
import ComponentTrackingPanel from "@/components/features/projects/ComponentTrackingPanel";
import DeviationReportModal from "@/components/features/projects/DeviationReportModal";
import { modelAnalysisApi } from "@/lib/model-analysis/model-analysis.api";
import {
  BuildingElement,
  TrackingStatistics,
  TrackingStatus,
  DeviationType,
} from "@/types/model-tracking.types";
import { Button } from "@/components/ui";

export default function Project3DModelPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [elements, setElements] = useState<BuildingElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<
    BuildingElement | undefined
  >();
  const [statistics, setStatistics] = useState<TrackingStatistics>({
    total_elements: 0,
    by_type: { walls: 0, columns: 0, slabs: 0, beams: 0 },
    total_volume: 0,
    by_status: { completed: 0, in_progress: 0, not_started: 0 },
    completion_percentage: 0,
  });
  const [viewMode, setViewMode] = useState<
    "normal" | "exploded" | "section" | "xray"
  >("normal");
  const [explodeFactor, setExplodeFactor] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showDeviationModal, setShowDeviationModal] = useState(false);
  const [deviationElement, setDeviationElement] = useState<string>("");

  // Load data
  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      setLoading(true);

      // Try to load from API
      try {
        const modelInfo = await modelAnalysisApi.getModelInfo(projectId);
        const buildingElements = await modelAnalysisApi.getBuildingElements(
          modelInfo.id
        );
        const stats = await modelAnalysisApi.getStatistics(projectId);

        setElements(buildingElements);
        setStatistics(stats);
      } catch (error) {
        console.log("API not ready, loading demo data...");
        loadDemoData();
      }
    } catch (error) {
      console.error("Error loading project data:", error);
      loadDemoData();
    } finally {
      setLoading(false);
    }
  };

  // Load demo data for testing
  const loadDemoData = () => {
    const demoElements: BuildingElement[] = [];

    // Create a more realistic building structure
    const buildingWidth = 10;
    const buildingLength = 12;
    const floorHeight = 3;

    // Floor 1 - Foundation and ground floor
    demoElements.push({
      id: "foundation-1",
      name: "Móng tầng 1",
      element_type: "foundation",
      dimensions: { width: buildingWidth, length: buildingLength, height: 0.5 },
      center: [0, 0, 0],
      volume_m3: buildingWidth * buildingLength * 0.5,
      floor_level: 1,
      tracking_status: "completed",
      completion_percentage: 100,
      can_track: true,
    });

    // Columns for support
    const columns = 9;
    for (let i = 0; i < columns; i++) {
      const colX = ((i % 3) - 1) * 4;
      const colZ = (Math.floor(i / 3) - 1) * 4;
      demoElements.push({
        id: `column-1-${i}`,
        name: `Cột tầng 1 - C${i + 1}`,
        element_type: "column",
        dimensions: { width: 0.4, length: 0.4, height: floorHeight },
        center: [colX, floorHeight / 2, colZ],
        volume_m3: 0.5,
        floor_level: 1,
        tracking_status:
          i < 4 ? "completed" : i < 7 ? "in_progress" : "not_started",
        completion_percentage: i < 4 ? 100 : i < 7 ? 50 : 0,
        can_track: true,
      });
    }

    // Walls for floor 1
    const walls = [
      {
        name: "Tường trước",
        center: [0, floorHeight / 2, buildingLength / 2],
        width: buildingWidth,
        height: floorHeight,
        thickness: 0.2,
      },
      {
        name: "Tường sau",
        center: [0, floorHeight / 2, -buildingLength / 2],
        width: buildingWidth,
        height: floorHeight,
        thickness: 0.2,
      },
      {
        name: "Tường trái",
        center: [-buildingWidth / 2, floorHeight / 2, 0],
        width: buildingLength,
        height: floorHeight,
        thickness: 0.2,
      },
      {
        name: "Tường phải",
        center: [buildingWidth / 2, floorHeight / 2, 0],
        width: buildingLength,
        height: floorHeight,
        thickness: 0.2,
      },
    ];

    walls.forEach((wall, idx) => {
      demoElements.push({
        id: `wall-1-${idx}`,
        name: wall.name,
        element_type: "wall",
        dimensions: {
          width: wall.width,
          length: wall.thickness,
          height: wall.height,
        },
        center: [wall.center[0], wall.center[1], wall.center[2]],
        volume_m3: wall.width * wall.height * wall.thickness,
        floor_level: 1,
        tracking_status:
          idx < 2 ? "completed" : idx < 3 ? "in_progress" : "not_started",
        completion_percentage: idx < 2 ? 100 : idx < 3 ? 50 : 25,
        can_track: true,
      });
    });

    // Slab for floor 1 (roof/ceiling)
    demoElements.push({
      id: "slab-1",
      name: "Sàn tầng 1",
      element_type: "slab",
      dimensions: { width: buildingWidth, length: buildingLength, height: 0.2 },
      center: [0, floorHeight, 0],
      volume_m3: buildingWidth * buildingLength * 0.2,
      floor_level: 1,
      tracking_status: "completed",
      completion_percentage: 60,
      can_track: true,
    });

    // Floor 2
    demoElements.push({
      id: "column-2-1",
      name: "Cột tầng 2 - C1",
      element_type: "column",
      dimensions: { width: 0.4, length: 0.4, height: floorHeight },
      center: [-4, floorHeight + floorHeight / 2, -4],
      volume_m3: 0.5,
      floor_level: 2,
      tracking_status: "in_progress",
      completion_percentage: 45,
      can_track: true,
    });

    demoElements.push({
      id: "wall-2-1",
      name: "Tường trước tầng 2",
      element_type: "wall",
      dimensions: { width: buildingWidth, length: 0.2, height: floorHeight },
      center: [0, floorHeight + floorHeight / 2, buildingLength / 2],
      volume_m3: buildingWidth * floorHeight * 0.2,
      floor_level: 2,
      tracking_status: "in_progress",
      completion_percentage: 30,
      can_track: true,
    });

    // Roof
    demoElements.push({
      id: "roof-1",
      name: "Mái nhà",
      element_type: "roof",
      dimensions: { width: buildingWidth, length: buildingLength, height: 2 },
      center: [0, floorHeight * 2 + 1, 0],
      volume_m3: buildingWidth * buildingLength * 2,
      floor_level: 2,
      tracking_status: "not_started",
      completion_percentage: 0,
      can_track: true,
    });

    setElements(demoElements);
    updateStatistics(demoElements);
  };

  // Update statistics
  const updateStatistics = (elements: BuildingElement[]) => {
    const stats: TrackingStatistics = {
      total_elements: elements.length,
      by_type: {
        walls: elements.filter((e) => e.element_type === "wall").length,
        columns: elements.filter((e) => e.element_type === "column").length,
        slabs: elements.filter((e) => e.element_type === "slab").length,
        beams: elements.filter((e) => e.element_type === "beam").length,
      },
      total_volume: elements.reduce((sum, e) => sum + e.volume_m3, 0),
      by_status: {
        completed: elements.filter((e) => e.tracking_status === "completed")
          .length,
        in_progress: elements.filter((e) => e.tracking_status === "in_progress")
          .length,
        not_started: elements.filter((e) => e.tracking_status === "not_started")
          .length,
      },
      completion_percentage: 0,
    };

    stats.completion_percentage =
      stats.total_elements > 0
        ? (stats.by_status.completed / stats.total_elements) * 100
        : 0;

    setStatistics(stats);
  };

  // Handle element selection
  const handleElementSelect = (element: BuildingElement) => {
    setSelectedElement(element);
  };

  // Handle completion update with photos
  const handleUpdateCompletion = async (
    elementId: string,
    percentage: number,
    photos: File[]
  ) => {
    try {
      // Determine status based on percentage
      const status: TrackingStatus =
        percentage === 0
          ? "not_started"
          : percentage === 100
          ? "completed"
          : "in_progress";

      // Update local state
      const updatedElements = elements.map((elem) => {
        if (elem.id === elementId) {
          return {
            ...elem,
            tracking_status: status,
            completion_percentage: percentage,
          };
        }
        return elem;
      });
      setElements(updatedElements);
      updateStatistics(updatedElements);

      // Update selected element
      if (selectedElement?.id === elementId) {
        setSelectedElement({
          ...selectedElement,
          tracking_status: status,
          completion_percentage: percentage,
        });
      }

      // Try to update via API
      try {
        // 1. Upload photos
        const uploadedPhotos = await modelAnalysisApi.uploadTrackingPhotos(
          elementId,
          photos
        );
        console.log("Photos uploaded:", uploadedPhotos);

        // 2. Update completion percentage
        await modelAnalysisApi.updateCompletionPercentage(
          elementId,
          percentage
        );
        console.log("Completion updated:", percentage);
      } catch (error) {
        console.log("API not ready, only updating local state");
      }

      alert(
        `✅ Đã lưu tracking: ${selectedElement?.name}\n📊 Hoàn thành: ${percentage}%\n📸 Ảnh: ${photos.length} file`
      );
    } catch (error) {
      console.error("Error updating completion:", error);
      alert("❌ Lỗi khi lưu tracking!");
    }
  };

  // Handle deviation report
  const handleReportDeviation = (elementId: string) => {
    setDeviationElement(elementId);
    setShowDeviationModal(true);
  };

  const handleSaveDeviation = async (report: {
    deviation_type: DeviationType;
    severity: "low" | "medium" | "high" | "critical";
    description: string;
    photos: File[];
    priority: number;
  }) => {
    try {
      const selectedEl = elements.find((e) => e.id === deviationElement);
      if (!selectedEl) return;

      // Upload photos
      const uploadedPhotos = await modelAnalysisApi.uploadTrackingPhotos(
        deviationElement,
        report.photos
      );

      // Save deviation report
      const deviationData = {
        element_name: selectedEl.name,
        deviation_type: report.deviation_type,
        severity: report.severity,
        description: report.description,
        photos: uploadedPhotos,
        priority: report.priority,
        reported_by: "current-user-id", // TODO: Get from auth
      };

      await modelAnalysisApi.reportDeviation(deviationElement, deviationData);

      alert("✅ Đã gửi báo cáo sai lệch thành công!");
      setShowDeviationModal(false);
      setDeviationElement("");
    } catch (error) {
      console.error("Error reporting deviation:", error);
      alert("❌ Lỗi khi gửi báo cáo!");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1a1a1a] text-white">
        <div className="text-2xl">⏳ Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#1a1a1a]">
      {/* Left Panel - Tracking Info */}
      <ComponentTrackingPanel
        selectedElement={selectedElement}
        statistics={statistics}
        onUpdateCompletion={handleUpdateCompletion}
        onReportDeviation={handleReportDeviation}
      />

      {/* Right Side - 3D Viewer */}
      <div className="flex-1 flex flex-col">
        {/* View Mode Controls */}
        <div className="bg-[#2a2a2a] border-b border-gray-700 p-4 flex gap-4 items-center">
          <div className="flex gap-2">
            <Button
              className={`${
                viewMode === "normal" ? "bg-blue-600" : "bg-gray-700"
              } text-white hover:bg-blue-700`}
              onClick={() => setViewMode("normal")}
            >
              🏠 Bình thường
            </Button>
            <Button
              className={`${
                viewMode === "exploded" ? "bg-blue-600" : "bg-gray-700"
              } text-white hover:bg-blue-700`}
              onClick={() => setViewMode("exploded")}
            >
              📊 Tách rời
            </Button>
          </div>

          {viewMode === "exploded" && (
            <div className="flex items-center gap-3 flex-1">
              <span className="text-white text-sm">Mức độ tách rời:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={explodeFactor}
                onChange={(e) => setExplodeFactor(parseFloat(e.target.value))}
                className="flex-1 max-w-xs"
              />
              <span className="text-white text-sm">
                {(explodeFactor * 100).toFixed(0)}%
              </span>
            </div>
          )}
        </div>

        {/* 3D Viewer */}
        <div className="flex-1">
          <ModelViewer3D
            elements={elements}
            onElementSelect={handleElementSelect}
            selectedElementId={selectedElement?.id}
            viewMode={viewMode}
            explodeFactor={explodeFactor}
          />
        </div>
      </div>

      {/* Deviation Report Modal */}
      {showDeviationModal && selectedElement && (
        <DeviationReportModal
          elementId={selectedElement.id}
          elementName={selectedElement.name}
          onClose={() => {
            setShowDeviationModal(false);
            setDeviationElement("");
          }}
          onSave={handleSaveDeviation}
        />
      )}
    </div>
  );
}
