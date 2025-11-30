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
  const [selectedMeshes, setSelectedMeshes] = useState<number[]>([]);
  const [name, setName] = useState("");
  const [elementType, setElementType] = useState(1); // Wall
  const [floorLevel, setFloorLevel] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const model = await modelAnalysisApi.getModelById(modelId);
        setGlbUrl(model.fileUrl);
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
        description: error?.response?.data?.message || error?.message || "Có lỗi xảy ra",
      });
    }
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

  return (
    <>
      <Header />
      <div className="h-screen pt-16 flex bg-stone-900">
        {/* Left Panel: Form */}
        <div className="w-[400px] bg-stone-800 border-r border-stone-700 overflow-y-auto p-6">
          <h1 className="text-2xl font-bold text-white mb-4">
            ➕ Tạo Building Element
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-bold text-stone-300 mb-2">
                Tên element *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Tường tầng 1"
                className="w-full bg-stone-700 text-white rounded-lg px-4 py-2 border border-stone-600 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            {/* Element Type */}
            <div>
              <label className="block text-sm font-bold text-stone-300 mb-2">
                Loại element *
              </label>
              <select
                value={elementType}
                onChange={(e) => setElementType(parseInt(e.target.value))}
                className="w-full bg-stone-700 text-white rounded-lg px-4 py-2 border border-stone-600"
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
              <label className="block text-sm font-bold text-stone-300 mb-2">
                Tầng *
              </label>
              <input
                type="number"
                value={floorLevel}
                onChange={(e) => setFloorLevel(parseInt(e.target.value))}
                min={0}
                className="w-full bg-stone-700 text-white rounded-lg px-4 py-2 border border-stone-600"
              />
            </div>

            {/* Selected Meshes */}
            <div>
              <label className="block text-sm font-bold text-stone-300 mb-2">
                Meshes đã chọn ({selectedMeshes.length})
              </label>
              <div className="bg-stone-700 rounded-lg p-3 max-h-32 overflow-y-auto">
                {selectedMeshes.length === 0 ? (
                  <div className="text-stone-400 text-sm">
                    👆 Click vào model bên phải để chọn meshes
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {selectedMeshes
                      .sort((a, b) => a - b)
                      .map((idx) => (
                        <span
                          key={idx}
                          className="bg-green-600 text-white text-xs px-2 py-1 rounded"
                        >
                          {idx}
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
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 text-white font-bold py-3"
            >
              ✅ Tạo Element
            </Button>

            <Button
              type="button"
              onClick={() => router.back()}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3"
            >
              ← Quay lại
            </Button>
          </form>

          {/* Instructions */}
          <div className="mt-6 bg-blue-600/20 border border-blue-500 rounded-lg p-4">
            <h3 className="text-blue-300 font-bold mb-2">💡 Hướng dẫn</h3>
            <ul className="text-sm text-stone-300 space-y-1">
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
            elements={[]} // No elements yet
            selectionMode="mesh" // ⭐ Mesh selection mode
            onMeshesSelected={setSelectedMeshes}
          />

          {/* Info overlay */}
          <div className="absolute bottom-4 left-4 bg-black/80 text-white p-4 rounded-lg">
            <div className="text-sm font-bold mb-2">
              📌 Meshes đã chọn: {selectedMeshes.length}
            </div>
            <div className="text-xs text-stone-300">
              Click vào model để chọn/bỏ chọn meshes
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
