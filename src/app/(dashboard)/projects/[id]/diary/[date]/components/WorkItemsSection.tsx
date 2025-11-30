"use client";

import { useState, useEffect } from "react";
import { notification, Modal } from "antd";
import type {
  DiaryWorkItemEntry,
  WorkItemSummary,
} from "@/types/construction-diary.types";
import { LaborEntry } from "./LaborEntry";
import { EquipmentEntry } from "./EquipmentEntry";
import { MaterialSection } from "./MaterialSection";
import apiClient from "@/lib/api/client";

interface WorkItemsSectionProps {
  projectId: string;
  workItems: DiaryWorkItemEntry[];
  onWorkItemsChange: (workItems: DiaryWorkItemEntry[]) => void;
}

interface WorkItemApiResponse {
  id: string;
  name: string;
  code?: string;
  unit?: string;
  plannedQuantity?: number;
  children?: WorkItemApiResponse[];
}

export function WorkItemsSection({
  projectId,
  workItems,
  onWorkItemsChange,
}: WorkItemsSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedWorkItemId, setSelectedWorkItemId] = useState<string | null>(
    null
  );
  const [availableWorkItems, setAvailableWorkItems] = useState<
    WorkItemSummary[]
  >([]);
  const [loading, setLoading] = useState(false);

  // Fetch work items from API
  useEffect(() => {
    const fetchWorkItems = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<WorkItemApiResponse[]>(
          `/work-items/project/${projectId}?rootLevelOnly=false&includeChildren=true`
        );

        // Flatten nested work items
        const flattenWorkItems = (
          items: WorkItemApiResponse[]
        ): WorkItemSummary[] => {
          const result: WorkItemSummary[] = [];

          const flatten = (item: WorkItemApiResponse) => {
            result.push({
              id: item.id,
              name: item.name,
              code: item.code,
              unit: item.unit,
              plannedQuantity: item.plannedQuantity,
            });

            if (item.children && item.children.length > 0) {
              item.children.forEach(flatten);
            }
          };

          items.forEach(flatten);
          return result;
        };

        const flattened = flattenWorkItems(response.data);
        setAvailableWorkItems(flattened);
      } catch (error) {
        console.error("Error fetching work items:", error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchWorkItems();
    }
  }, [projectId]);

  const filteredWorkItems = availableWorkItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectWorkItem = (item: WorkItemSummary) => {
    // Check if already added
    if (workItems.find((w) => w.workItemId === item.id)) {
      notification.warning({
        message: "Công việc đã tồn tại",
        description: "Công việc này đã được thêm!",
      });
      return;
    }

    const newWorkItem: DiaryWorkItemEntry = {
      id: crypto.randomUUID(),
      workItemId: item.id,
      workItemName: item.name,
      constructionArea: "",
      plannedQuantity: item.plannedQuantity || 0,
      constructedQuantity: 0,
      remainingQuantity: item.plannedQuantity || 0,
      unit: item.unit || "",
      laborEntries: [],
      equipmentEntries: [],
    };

    onWorkItemsChange([...workItems, newWorkItem]);
    setSearchQuery("");
    setShowSearchResults(false);
    setSelectedWorkItemId(newWorkItem.id);
  };

  const handleRemoveWorkItem = (id: string) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc muốn xóa công việc này?",
      okText: "Xóa",
      cancelText: "Hủy",
      onOk: () => {
        onWorkItemsChange(workItems.filter((w) => w.id !== id));
        if (selectedWorkItemId === id) {
          setSelectedWorkItemId(null);
        }
      },
    });
  };

  const handleUpdateWorkItem = (
    id: string,
    updates: Partial<DiaryWorkItemEntry>
  ) => {
    onWorkItemsChange(
      workItems.map((w) => (w.id === id ? { ...w, ...updates } : w))
    );
  };

  const selectedWorkItem = workItems.find((w) => w.id === selectedWorkItemId);

  return (
    <div className="space-y-6">
      {/* Work Items Section */}
      <div className="bg-white backdrop-blur-sm rounded-xl border border-gray-200 shadow-xl">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
            Công việc thi công
          </h2>
        </div>

        <div className="p-6 space-y-4">
          {/* Search Work Item */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm công việc
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
                placeholder="Nhập tên hoặc mã công việc..."
                className="w-full px-4 py-3 pl-11 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                      className="animate-spin h-6 w-6 mx-auto mb-2 text-blue-600"
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
                    Đang tải công việc...
                  </div>
                ) : filteredWorkItems.length > 0 ? (
                  <div className="py-2">
                    {filteredWorkItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelectWorkItem(item)}
                        className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left flex items-center justify-between group"
                      >
                        <div>
                          <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                            {item.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {item.code} • {item.plannedQuantity} {item.unit}
                          </div>
                        </div>
                        <svg
                          className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors"
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
                    Không tìm thấy công việc
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Selected Work Items List */}
          {workItems.length === 0 ? (
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-gray-600">Chưa có công việc nào</p>
              <p className="text-gray-500 text-sm mt-1">
                Tìm kiếm và chọn công việc để thêm vào nhật ký
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {workItems.map((item) => (
                <div
                  key={item.id}
                  className={`
                    p-4 rounded-lg border transition-all cursor-pointer
                    ${
                      selectedWorkItemId === item.id
                        ? "bg-blue-50 border-blue-300 shadow-lg shadow-blue-200"
                        : "bg-gray-50 border-gray-200 hover:border-gray-300"
                    }
                  `}
                  onClick={() => setSelectedWorkItemId(item.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 mb-1">
                        {item.workItemName}
                      </div>
                      <div className="text-sm text-gray-600">
                        KH: {item.plannedQuantity} {item.unit} • TC:{" "}
                        {item.constructedQuantity} {item.unit} • CL:{" "}
                        {item.remainingQuantity} {item.unit}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveWorkItem(item.id);
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

      {/* Work Item Details */}
      {selectedWorkItem && (
        <div className="space-y-6">
          {/* Construction Area & Quantities */}
          <div className="bg-white backdrop-blur-sm rounded-xl border border-gray-200 shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Chi tiết: {selectedWorkItem.workItemName}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Khu vực thi công
                </label>
                <input
                  type="text"
                  value={selectedWorkItem.constructionArea}
                  onChange={(e) =>
                    handleUpdateWorkItem(selectedWorkItem.id, {
                      constructionArea: e.target.value,
                    })
                  }
                  placeholder="VD: Khu A - Tầng 1"
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  KL kế hoạch
                </label>
                <input
                  type="text"
                  value={`${selectedWorkItem.plannedQuantity} ${selectedWorkItem.unit}`}
                  readOnly
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  KL thi công
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={selectedWorkItem.constructedQuantity}
                    onChange={(e) => {
                      const constructed = Number(e.target.value);
                      const remaining =
                        selectedWorkItem.plannedQuantity - constructed;
                      handleUpdateWorkItem(selectedWorkItem.id, {
                        constructedQuantity: constructed,
                        remainingQuantity: remaining,
                      });
                    }}
                    placeholder="0"
                    className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 min-w-[60px] flex items-center justify-center">
                    {selectedWorkItem.unit}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Còn lại
                </label>
                <input
                  type="text"
                  value={`${selectedWorkItem.remainingQuantity} ${selectedWorkItem.unit}`}
                  readOnly
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Labor Entries */}
          <LaborEntry
            workItemId={selectedWorkItem.id}
            laborEntries={selectedWorkItem.laborEntries}
            onLaborEntriesChange={(entries) =>
              handleUpdateWorkItem(selectedWorkItem.id, {
                laborEntries: entries,
              })
            }
          />

          {/* Equipment Entries */}
          <EquipmentEntry
            workItemId={selectedWorkItem.id}
            equipmentEntries={selectedWorkItem.equipmentEntries}
            onEquipmentEntriesChange={(entries) =>
              handleUpdateWorkItem(selectedWorkItem.id, {
                equipmentEntries: entries,
              })
            }
          />
        </div>
      )}

      {/* Materials Section */}
      {selectedWorkItem && <MaterialSection workItemId={selectedWorkItem.id} />}
    </div>
  );
}
