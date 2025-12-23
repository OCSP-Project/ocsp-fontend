"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { notification } from "antd";
import Header from "@/components/layout/Header";
import ModelViewer3D from "@/components/features/projects/ModelViewer3D";
import { modelAnalysisApi } from "@/lib/model-analysis/model-analysis.api";
import { buildingElementsApi } from "@/lib/building-elements/building-elements.api";
import { Button } from "@/components/ui";

export default function CreateElementPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const modelId = params.modelId as string;

  const [glbUrl, setGlbUrl] = useState("");
  const [existingElements, setExistingElements] = useState<any[]>([]);
  const [selectedMeshes, setSelectedMeshes] = useState<number[]>([]);
  const [name, setName] = useState("");
  const [elementType, setElementType] = useState(1); // Wall
  const [floorLevel, setFloorLevel] = useState(1);
  const [loading, setLoading] = useState(true);
  const [interactionMode, setInteractionMode] = useState<"view" | "selection">(
    "view"
  );

  useEffect(() => {
    const load = async () => {
      try {
        const [model, elements] = await Promise.all([
          modelAnalysisApi.getModelById(modelId),
          buildingElementsApi.getByModel(modelId),
        ]);
        setGlbUrl(model.fileUrl);
        setExistingElements(elements);
      } catch (error) {
        console.error("Load error:", error);
      } finally {
        setLoading(false);
      }
    };
    if (modelId) load();
  }, [modelId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedMeshes.length === 0) {
      notification.warning({
        message: "Chưa chọn mesh",
        description: "Vui lòng chọn ít nhất 1 mesh từ model 3D!",
      });
      return;
    }

    try {
      await buildingElementsApi.create({
        modelId,
        name,
        elementType,
        floorLevel,
        meshIndices: selectedMeshes,
      });

      notification.success({
        message: "Thành công",
        description: "Đã tạo element thành công!",
      });
      router.push(`/projects/${projectId}/3d-model/${modelId}/tracking`);
    } catch (error: any) {
      notification.error({
        message: "Lỗi",
        description:
          error?.response?.data?.message || error?.message || "Có lỗi xảy ra",
      });
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="h-screen pt-16 flex items-center justify-center bg-white relative overflow-hidden">
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
          <div className="text-gray-700 relative z-10">Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="h-screen pt-16 flex bg-white relative overflow-hidden">
        {/* Background gradient glow */}
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
        {/* Left Panel: Form */}
        <div className="w-[400px] bg-white/95 backdrop-blur-xl border-r border-gray-200 overflow-y-auto p-6 relative z-10 shadow-xl">
          <h1
            className="text-2xl font-bold mb-4"
            style={{
              background: "linear-gradient(135deg, #38c1b6 0%, #667eea 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            ➕ Tạo Building Element
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Tên element *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Tường tầng 1"
                className="w-full bg-gray-50/80 backdrop-blur-sm text-gray-900 rounded-xl px-4 py-2.5 border-2 border-gray-200 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
                required
              />
            </div>

            {/* Element Type */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Loại element *
              </label>
              <select
                value={elementType}
                onChange={(e) => setElementType(parseInt(e.target.value))}
                className="w-full bg-gray-50/80 backdrop-blur-sm text-gray-900 rounded-xl px-4 py-2.5 border-2 border-gray-200 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
              >
                <option value={1}>🧱 Wall (Tường)</option>
                <option value={2}>🏛️ Column (Cột)</option>
                <option value={3}>⬜ Slab (Sàn)</option>
                <option value={4}>➖ Beam (Dầm)</option>
                <option value={5}>🔲 Foundation (Móng)</option>
                <option value={6}>🏠 Roof (Mái)</option>
                <option value={7}>🪜 Stair (Cầu thang)</option>
                <option value={8}>🪟 Window (Cửa sổ)</option>
                <option value={9}>🚪 Door (Cửa ra vào)</option>
                <option value={10}>📦 Other (Khác)</option>
              </select>
            </div>

            {/* Floor Level */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Tầng *
              </label>
              <input
                type="number"
                value={floorLevel}
                onChange={(e) => setFloorLevel(parseInt(e.target.value))}
                min={0}
                className="w-full bg-gray-50/80 backdrop-blur-sm text-gray-900 rounded-xl px-4 py-2.5 border-2 border-gray-200 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
              />
            </div>

            {/* Selected Meshes */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-gray-700">
                  Meshes đã chọn ({selectedMeshes.length})
                </label>
                {selectedMeshes.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedMeshes([])}
                    className="text-xs bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-1.5 rounded-lg transition-all shadow-sm hover:shadow-md"
                  >
                    🗑️ Xóa tất cả
                  </button>
                )}
              </div>
              <div className="bg-gray-50/80 backdrop-blur-sm rounded-xl p-3 max-h-32 overflow-y-auto border-2 border-gray-200">
                {selectedMeshes.length === 0 ? (
                  <div className="text-gray-500 text-sm">
                    👆 Click vào model bên phải để chọn meshes
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedMeshes
                      .sort((a, b) => a - b)
                      .map((idx) => (
                        <span
                          key={idx}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2.5 py-1 rounded-lg cursor-pointer hover:from-green-600 hover:to-emerald-600 transition-all shadow-sm hover:shadow-md"
                          onClick={() =>
                            setSelectedMeshes((prev) =>
                              prev.filter((i) => i !== idx)
                            )
                          }
                          title="Click để xóa mesh này"
                        >
                          {idx} ×
                        </span>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={selectedMeshes.length === 0}
              className="w-full text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
              style={{
                background:
                  selectedMeshes.length === 0
                    ? "#9ca3af"
                    : "linear-gradient(135deg, #38c1b6 0%, #667eea 100%)",
              }}
            >
              ✅ Tạo Element
            </Button>

            <Button
              type="button"
              onClick={() => router.back()}
              className="w-full bg-black backdrop-blur-sm hover:bg-white text-gray-700 font-bold py-3.5 rounded-xl border-2 border-gray-200 transition-all hover:border-gray-300 shadow-sm hover:shadow-md"
              style={{
                background: "linear-gradient(135deg, #38c1b6 0%, #667eea 100%)",
              }}
            >
              ← Quay lại
            </Button>
          </form>

          {/* Instructions */}
          <div className="mt-6 bg-gradient-to-br from-teal-50/90 to-purple-50/90 backdrop-blur-sm border-2 border-teal-200/50 rounded-xl p-4 shadow-sm">
            <h3
              className="font-bold mb-2"
              style={{
                background: "linear-gradient(135deg, #38c1b6 0%, #667eea 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              💡 Hướng dẫn
            </h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>1️⃣ Click vào các mesh trong model 3D</li>
              <li>2️⃣ Mesh được chọn sẽ đổi màu xanh lá</li>
              <li>3️⃣ Click lại để bỏ chọn</li>
              <li>4️⃣ Điền thông tin và click "Tạo Element"</li>
            </ul>
          </div>
        </div>

        {/* Right Panel: 3D Viewer */}
        <div className="flex-1 relative">
          <ModelViewer3D
            glbUrl={glbUrl}
            elements={existingElements} // Pass existing elements to show assigned meshes as red
            selectionMode="mesh" // ⭐ Mesh selection mode
            onMeshesSelected={setSelectedMeshes}
            selectedMeshIndices={selectedMeshes} // ⭐ Sync selected meshes from parent
            interactionMode={interactionMode}
          />

          {/* Mode toggle button */}
          <div className="absolute top-4 right-4 flex gap-2 z-20">
            <button
              onClick={() => setInteractionMode("view")}
              className={`px-4 py-2.5 rounded-xl font-bold transition-all shadow-md ${
                interactionMode === "view"
                  ? "text-white shadow-lg"
                  : "bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white border-2 border-gray-200"
              }`}
              style={
                interactionMode === "view"
                  ? {
                      background:
                        "linear-gradient(135deg, #38c1b6 0%, #667eea 100%)",
                    }
                  : {}
              }
            >
              🔍 View Mode
            </button>
            <button
              onClick={() => setInteractionMode("selection")}
              className={`px-4 py-2.5 rounded-xl font-bold transition-all shadow-md ${
                interactionMode === "selection"
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                  : "bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white border-2 border-gray-200"
              }`}
            >
              ✏️ Selection Mode
            </button>
          </div>

          {/* Info overlay */}
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-xl border-2 border-gray-200 text-gray-800 p-4 rounded-xl shadow-xl z-20">
            <div
              className="text-sm font-bold mb-2"
              style={{
                background:
                  interactionMode === "view"
                    ? "linear-gradient(135deg, #38c1b6 0%, #667eea 100%)"
                    : "linear-gradient(to-r, #10b981 0%, #059669 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {interactionMode === "view"
                ? "🔍 View Mode"
                : "✏️ Selection Mode"}
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              {interactionMode === "view" ? (
                <>
                  <div>• Left-click + drag: Xoay model</div>
                  <div>• Right-click + drag: Pan</div>
                  <div>• Scroll: Zoom</div>
                </>
              ) : (
                <>
                  <div>• Meshes đã chọn: {selectedMeshes.length}</div>
                  <div>• Left-click + drag: Chọn meshes</div>
                  <div>• Right-click: Xoay model</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
