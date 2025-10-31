"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import ModelViewer3D from "@/components/features/projects/ModelViewer3D";
import ComponentTrackingPanel from "@/components/features/projects/ComponentTrackingPanel";
import DeviationReportModal from "@/components/features/projects/DeviationReportModal";
import { modelAnalysisApi } from "@/lib/model-analysis/model-analysis.api";
import { useAuth, UserRole } from "@/hooks/useAuth";
import {
  BuildingElement,
  TrackingStatistics,
  TrackingStatus,
  DeviationType,
  Project3DModel,
} from "@/types/model-tracking.types";
import { Button } from "@/components/ui";

export default function Project3DModelPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const projectId = params.id as string;

  const [model, setModel] = useState<Project3DModel | null>(null);
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
    setLoading(true);
    try {
      // 1) Always load model first
      const modelInfo = await modelAnalysisApi.getModelInfo(projectId);
      setModel(modelInfo);

      // 2) Load elements and stats but don't fail the whole page if 404
      const [buildingElements, stats] = await Promise.all([
        modelAnalysisApi.getBuildingElements(modelInfo.modelId),
        modelAnalysisApi.getStatistics(projectId),
      ]);
      setElements(buildingElements);
      setStatistics(stats);
    } catch (error) {
      console.error("Error loading project data:", error);
      // Keep model null to show empty state; avoid crashing viewer
      setModel(null);
      setElements([]);
      setStatistics({
        total_elements: 0,
        by_type: { walls: 0, columns: 0, slabs: 0, beams: 0 },
        total_volume: 0,
        by_status: { completed: 0, in_progress: 0, not_started: 0 },
        completion_percentage: 0,
      });
    } finally {
      setLoading(false);
    }
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

      // Update via API
      try {
        // 1. Upload photos
        if (photos.length > 0) {
          const uploadedPhotos = await modelAnalysisApi.uploadTrackingPhotos(
            elementId,
            photos
          );
          console.log("Photos uploaded:", uploadedPhotos);
        }

        // 2. Update completion percentage
        await modelAnalysisApi.updateCompletionPercentage(
          elementId,
          percentage
        );
        console.log("Completion updated:", percentage);
      } catch (error) {
        console.error("Error updating via API:", error);
        throw error; // Re-throw to show error to user
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
      <>
        <Header />
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-stone-900 to-stone-900 pt-20 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-500 mx-auto mb-4"></div>
            <p className="text-stone-300">Đang tải mô hình 3D...</p>
          </div>
        </div>
      </>
    );
  }

  // Show message if no model uploaded
  if (!model) {
    return (
      <>
        <Header />
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-stone-900 to-stone-900 pt-20">
          <div className="max-w-4xl mx-auto px-4 py-10">
            <div className="bg-stone-800/60 backdrop-blur-xl rounded-xl border border-stone-700 p-8 text-center">
              <div className="text-6xl mb-4">🏗️</div>
              <h2 className="text-2xl font-bold text-stone-200 mb-4">
                Chưa có mô hình 3D
              </h2>
              <p className="text-stone-400 mb-6">
                Dự án này chưa có mô hình 3D nào được upload.
              </p>
              <div className="space-y-2 mb-6">
                <p className="text-sm text-stone-500">
                  Vui lòng upload file GLB để bắt đầu theo dõi tiến độ.
                </p>
              </div>

              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() =>
                    router.push(`/projects/${projectId}/3d-model/upload`)
                  }
                  className="bg-amber-600 hover:bg-amber-500 text-stone-900 font-bold px-6 py-3"
                >
                  📤 Upload mô hình 3D
                </Button>
                <Button
                  onClick={() => router.push(`/projects/${projectId}`)}
                  className="bg-stone-700 hover:bg-stone-600 px-6 py-3"
                >
                  ← Quay lại dự án
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
        {/* Top Bar */}
        <div className="bg-stone-800/90 backdrop-blur border-b border-stone-700 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/projects/${projectId}`}
              className="text-stone-400 hover:text-stone-300"
            >
              ← Quay lại
            </Link>
            <div>
              <h1 className="text-lg font-bold text-amber-200">
                🏗️ Mô hình 3D
              </h1>
              {model && (
                <p className="text-xs text-stone-400">
                  File: {model.fileName} • {model.fileSizeMB.toFixed(2)}MB •{" "}
                  {model.totalMeshes} meshes
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Buttons */}
            <div className="flex gap-2">
              <Button
                className={`${
                  viewMode === "normal"
                    ? "bg-blue-600 text-white"
                    : "bg-stone-700 text-stone-300"
                } hover:bg-blue-500`}
                onClick={() => setViewMode("normal")}
              >
                🏠 Bình thường
              </Button>
              <Button
                className={`${
                  viewMode === "exploded"
                    ? "bg-blue-600 text-white"
                    : "bg-stone-700 text-stone-300"
                } hover:bg-blue-500`}
                onClick={() => setViewMode("exploded")}
              >
                📊 Tách rời
              </Button>
            </div>

            {/* Upload Button (Supervisor only) */}
            {user?.role === UserRole.Supervisor && (
              <>
                <div className="h-6 w-px bg-stone-600" />
                <Button
                  onClick={() =>
                    router.push(`/projects/${projectId}/3d-model/upload`)
                  }
                  className="bg-amber-600 hover:bg-amber-500 text-stone-900 font-bold"
                >
                  📤 Upload mới
                </Button>
                <Button
                  onClick={() =>
                    router.push(`/projects/${projectId}/3d-model/history`)
                  }
                  className="bg-stone-700 hover:bg-stone-600"
                >
                  📜 Lịch sử
                </Button>
              </>
            )}

            {/* Elements Button */}
            <Button
              onClick={() => router.push(`/projects/${projectId}/elements`)}
              className="bg-green-600 hover:bg-green-500 text-white"
            >
              📦 Building Elements ({elements.length})
            </Button>
          </div>
        </div>

        {/* Explode Factor Slider */}
        {viewMode === "exploded" && (
          <div className="bg-stone-800/90 backdrop-blur border-b border-stone-700 px-4 py-2 flex items-center gap-4">
            <span className="text-sm text-stone-300">Mức độ tách rời:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={explodeFactor}
              onChange={(e) => setExplodeFactor(parseFloat(e.target.value))}
              className="flex-1 max-w-md"
            />
            <span className="text-sm text-stone-300 w-12">
              {(explodeFactor * 100).toFixed(0)}%
            </span>
          </div>
        )}

        {/* Main Content: 3D Viewer + Right Sidebar */}
        <div className="flex-1 flex overflow-hidden">
          {/* 3D Viewer */}
          <div className="flex-1 relative">
            <ModelViewer3D
              glbUrl={model?.fileUrl}
              elements={elements}
              onElementSelect={handleElementSelect}
              selectedElementId={selectedElement?.id}
              viewMode={viewMode}
              explodeFactor={explodeFactor}
            />
          </div>

          {/* Right Sidebar - Element Info */}
          <div className="w-80 bg-stone-800/90 backdrop-blur border-l border-stone-700 overflow-y-auto">
            {selectedElement ? (
              <div className="p-4">
                <h3 className="text-lg font-bold text-amber-200 mb-4">
                  📦 {selectedElement.name}
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-stone-700">
                    <span className="text-stone-400">Loại:</span>
                    <span className="text-white font-semibold">
                      {selectedElement.element_type}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-stone-700">
                    <span className="text-stone-400">Tầng:</span>
                    <span className="text-white font-semibold">
                      {selectedElement.floor_level}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-stone-700">
                    <span className="text-stone-400">Khối lượng:</span>
                    <span className="text-white font-semibold">
                      {selectedElement.volume_m3.toFixed(2)} m³
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-stone-700">
                    <span className="text-stone-400">Kích thước:</span>
                    <span className="text-white font-semibold text-xs">
                      {selectedElement.dimensions.width.toFixed(2)}m ×{" "}
                      {selectedElement.dimensions.length.toFixed(2)}m ×{" "}
                      {selectedElement.dimensions.height.toFixed(2)}m
                    </span>
                  </div>
                </div>

                {/* Progress */}
                <div className="mt-6 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-stone-300">Tiến độ:</span>
                    <span className="text-xl font-bold text-blue-400">
                      {selectedElement.completion_percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-stone-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${selectedElement.completion_percentage}%`,
                      }}
                    />
                  </div>
                  <div className="mt-2 text-xs text-stone-400">
                    Trạng thái:{" "}
                    <strong>{selectedElement.tracking_status}</strong>
                  </div>
                </div>

                {/* Actions */}
                {user?.role === UserRole.Supervisor && (
                  <div className="mt-6 space-y-2">
                    <Button
                      className="w-full bg-green-600 hover:bg-green-500"
                      onClick={() =>
                        router.push(
                          `/projects/${projectId}/elements/${selectedElement.id}/tracking`
                        )
                      }
                    >
                      📊 Cập nhật tiến độ
                    </Button>
                    <Button
                      className="w-full bg-amber-600 hover:bg-amber-500 text-stone-900"
                      onClick={() =>
                        router.push(
                          `/projects/${projectId}/elements/${selectedElement.id}`
                        )
                      }
                    >
                      🔧 Chỉnh sửa element
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 text-center text-stone-400">
                <div className="text-4xl mb-3">👆</div>
                <p className="text-sm">
                  Click vào phần tử trên mô hình 3D để xem chi tiết
                </p>
              </div>
            )}

            {/* Statistics */}
            <div className="p-4 border-t border-stone-700">
              <h4 className="text-sm font-bold text-stone-300 mb-3">
                📊 Thống kê
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-400">Tổng elements:</span>
                  <span className="text-white font-semibold">
                    {statistics.total_elements}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Hoàn thành:</span>
                  <span className="text-green-400 font-semibold">
                    {statistics.by_status.completed}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Đang thi công:</span>
                  <span className="text-orange-400 font-semibold">
                    {statistics.by_status.in_progress}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Chưa bắt đầu:</span>
                  <span className="text-red-400 font-semibold">
                    {statistics.by_status.not_started}
                  </span>
                </div>
                <div className="pt-2 border-t border-stone-700">
                  <div className="flex justify-between">
                    <span className="text-stone-400">% Hoàn thành:</span>
                    <span className="text-blue-400 font-bold">
                      {statistics.completion_percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
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
    </>
  );
}
