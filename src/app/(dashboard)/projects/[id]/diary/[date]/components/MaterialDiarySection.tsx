"use client";

import { useState, useEffect } from "react";
import { notification, Modal } from "antd";
import type {
  DiaryMaterialEntry,
  MaterialSummary,
} from "@/types/construction-diary.types";
import { materialService } from "@/services/materialService";
import {
  MaterialDto,
  MaterialRequestStatus,
  calculateVariance,
} from "@/types/material.types";

interface MaterialDiarySectionProps {
  projectId: string;
  materialEntries: DiaryMaterialEntry[];
  onMaterialEntriesChange: (entries: DiaryMaterialEntry[]) => void;
}

export function MaterialDiarySection({
  projectId,
  materialEntries,
  onMaterialEntriesChange,
}: MaterialDiarySectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(
    null
  );
  const [availableMaterials, setAvailableMaterials] = useState<MaterialDto[]>(
    []
  );
  const [loading, setLoading] = useState(false);

  // Fetch approved materials from API
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        const [materialsData, requestsData] = await Promise.all([
          materialService.getMaterialsByProject(projectId),
          materialService.getRequestsByProject(projectId),
        ]);

        // Filter only approved materials
        const approvedRequestIds = new Set(
          requestsData
            .filter(
              (r) =>
                r.status === "Approved" ||
                r.status === MaterialRequestStatus.Approved
            )
            .map((r) => r.id)
        );

        const approvedMaterials = materialsData.filter((m) =>
          approvedRequestIds.has(m.materialRequestId)
        );
        setAvailableMaterials(approvedMaterials);
      } catch (error) {
        console.error("Error fetching materials:", error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchMaterials();
    }
  }, [projectId]);

  const filteredMaterials = availableMaterials.filter(
    (material) =>
      material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectMaterial = (material: MaterialDto) => {
    // Check if already added
    if (materialEntries.find((m) => m.materialId === material.id)) {
      notification.warning({
        message: "Vật tư đã tồn tại",
        description: "Vật tư này đã được thêm!",
      });
      return;
    }

    const newMaterialEntry: DiaryMaterialEntry = {
      id: crypto.randomUUID(),
      materialId: material.id,
      materialName: material.name,
      code: material.code,
      unit: material.unit || "",
      contractQuantity: material.contractQuantity || 0,
      actualQuantity: material.actualQuantity || 0,
      variance: calculateVariance(
        material.contractQuantity,
        material.actualQuantity
      ),
    };

    onMaterialEntriesChange([...materialEntries, newMaterialEntry]);
    setSearchQuery("");
    setShowSearchResults(false);
    setSelectedMaterialId(newMaterialEntry.id);
  };

  const handleRemoveMaterial = (id: string) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc muốn xóa vật tư này?",
      okText: "Xóa",
      cancelText: "Hủy",
      onOk: () => {
        onMaterialEntriesChange(materialEntries.filter((m) => m.id !== id));
        if (selectedMaterialId === id) {
          setSelectedMaterialId(null);
        }
      },
    });
  };

  const handleUpdateMaterial = (
    id: string,
    updates: Partial<DiaryMaterialEntry>
  ) => {
    onMaterialEntriesChange(
      materialEntries.map((m) => {
        if (m.id === id) {
          const updated = { ...m, ...updates };
          // Recalculate variance when actualQuantity changes
          if ("actualQuantity" in updates) {
            updated.variance = calculateVariance(
              updated.contractQuantity,
              updated.actualQuantity
            );
          }
          return updated;
        }
        return m;
      })
    );
  };

  const selectedMaterial = materialEntries.find(
    (m) => m.id === selectedMaterialId
  );

  const getVarianceColor = (variance?: number): string => {
    if (variance === undefined) return "text-gray-500";
    if (variance > 0) return "text-red-600"; // Vượt dự toán
    if (variance < 0) return "text-green-600"; // Tiết kiệm
    return "text-gray-500";
  };

  return (
    <div className="space-y-6">
      {/* Materials Section */}
      <div className="bg-white backdrop-blur-sm rounded-xl border border-gray-200 shadow-xl">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <svg
              className="w-6 h-6 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            Nhật ký vật tư
          </h2>
        </div>

        <div className="p-6 space-y-4">
          {/* Search Material */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm vật tư
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => setShowSearchResults(true)}
                placeholder="Nhập tên hoặc mã vật tư..."
                className="w-full px-4 py-3 pl-11 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Search Results Dropdown */}
            {showSearchResults && searchQuery && (
              <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-2xl max-h-64 overflow-y-auto">
                {loading ? (
                  <div className="py-8 text-center text-gray-500">
                    <svg
                      className="animate-spin h-6 w-6 mx-auto mb-2 text-purple-600"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Đang tải vật tư...
                  </div>
                ) : filteredMaterials.length > 0 ? (
                  <div className="py-2">
                    {filteredMaterials.map((material) => (
                      <button
                        key={material.id}
                        onClick={() => handleSelectMaterial(material)}
                        className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left flex items-center justify-between group"
                      >
                        <div>
                          <div className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                            {material.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {material.code} • {material.contractQuantity}{" "}
                            {material.unit}
                          </div>
                        </div>
                        <svg
                          className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center text-gray-500">
                    Không tìm thấy vật tư
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Selected Materials List */}
          {materialEntries.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <p className="text-gray-600">Chưa có vật tư nào</p>
              <p className="text-gray-500 text-sm mt-1">
                Tìm kiếm và chọn vật tư để thêm vào nhật ký
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {materialEntries.map((entry) => (
                <div
                  key={entry.id}
                  className={`
                    p-4 rounded-lg border transition-all cursor-pointer
                    ${
                      selectedMaterialId === entry.id
                        ? "bg-purple-50 border-purple-300 shadow-lg shadow-purple-200"
                        : "bg-gray-50 border-gray-200 hover:border-gray-300"
                    }
                  `}
                  onClick={() => setSelectedMaterialId(entry.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 mb-1">
                        {entry.materialName}
                      </div>
                      <div className="text-sm text-gray-600">
                        Mã: {entry.code} • ĐV: {entry.unit}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveMaterial(entry.id);
                      }}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                    >
                      <svg
                        className="w-5 h-5 text-gray-400 group-hover:text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Material Details */}
      {selectedMaterial && (
        <div className="bg-white backdrop-blur-sm rounded-xl border border-gray-200 shadow-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Chi tiết: {selectedMaterial.materialName}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã vật tư
              </label>
              <input
                type="text"
                value={selectedMaterial.code || "-"}
                readOnly
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đơn vị
              </label>
              <input
                type="text"
                value={selectedMaterial.unit}
                readOnly
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                KL hợp đồng
              </label>
              <input
                type="text"
                value={`${selectedMaterial.contractQuantity.toLocaleString(
                  "vi-VN",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )} ${selectedMaterial.unit}`}
                readOnly
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                KL thực tế
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={selectedMaterial.actualQuantity}
                  onChange={(e) => {
                    const actualQty = Number(e.target.value);
                    handleUpdateMaterial(selectedMaterial.id, {
                      actualQuantity: actualQty,
                    });
                  }}
                  placeholder="0"
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 min-w-[80px] flex items-center justify-center">
                  {selectedMaterial.unit}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chênh lệch
              </label>
              <div
                className={`px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg font-semibold ${getVarianceColor(
                  selectedMaterial.variance
                )}`}
              >
                {selectedMaterial.variance !== undefined
                  ? `${
                      selectedMaterial.variance > 0 ? "+" : ""
                    }${selectedMaterial.variance.toFixed(2)}%`
                  : "-"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
