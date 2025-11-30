"use client";

import { useState } from "react";
import { notification, Modal } from "antd";
import type {
  DiaryLaborEntry,
  LaborDto,
} from "@/types/construction-diary.types";

interface LaborEntryProps {
  workItemId: string;
  laborEntries: DiaryLaborEntry[];
  onLaborEntriesChange: (entries: DiaryLaborEntry[]) => void;
}

// Mock data - sẽ thay bằng API call
const MOCK_LABOR: LaborDto[] = [
  { id: "1", name: "Nguyễn Văn A", position: "Thợ chính", hourlyRate: 50000 },
  { id: "2", name: "Trần Văn B", position: "Thợ phụ", hourlyRate: 40000 },
  { id: "3", name: "Lê Thị C", position: "Thợ hàn", hourlyRate: 55000 },
  { id: "4", name: "Phạm Văn D", position: "Thợ điện", hourlyRate: 60000 },
  { id: "5", name: "Hoàng Văn E", position: "Thợ sơn", hourlyRate: 45000 },
];

export function LaborEntry({
  workItemId,
  laborEntries,
  onLaborEntriesChange,
}: LaborEntryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  const filteredLabor = MOCK_LABOR.filter(
    (labor) =>
      labor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      labor.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddLabor = (labor: LaborDto) => {
    // Check if already added
    if (laborEntries.find((l) => l.laborId === labor.id)) {
      notification.warning({
        message: "Nhân công đã tồn tại",
        description: "Nhân công này đã được thêm!",
      });
      return;
    }

    const newEntry: DiaryLaborEntry = {
      id: crypto.randomUUID(),
      laborId: labor.id,
      laborName: labor.name,
      workHours: "",
      team: "",
      shift: "",
      quantity: 0,
      unit: "Công",
    };

    onLaborEntriesChange([...laborEntries, newEntry]);
    setSearchQuery("");
    setShowSearchResults(false);
  };

  const handleRemoveLabor = (id: string) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc muốn xóa nhân công này?",
      okText: "Xóa",
      cancelText: "Hủy",
      onOk: () => {
        onLaborEntriesChange(laborEntries.filter((l) => l.id !== id));
      },
    });
  };

  const handleUpdateLabor = (id: string, updates: Partial<DiaryLaborEntry>) => {
    onLaborEntriesChange(
      laborEntries.map((l) => (l.id === id ? { ...l, ...updates } : l))
    );
  };

  return (
    <div className="bg-white backdrop-blur-sm rounded-xl border border-gray-200 shadow-xl">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200 px-6 py-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          Nhân công
        </h3>
      </div>

      <div className="p-6 space-y-4">
        {/* Search Labor */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tìm kiếm nhân công
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
              placeholder="Nhập tên hoặc vị trí..."
              className="w-full px-4 py-2.5 pl-11 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
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
            <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-2xl max-h-48 overflow-y-auto">
              {filteredLabor.length > 0 ? (
                <div className="py-2">
                  {filteredLabor.map((labor) => (
                    <button
                      key={labor.id}
                      onClick={() => handleAddLabor(labor)}
                      className="w-full px-4 py-2.5 hover:bg-gray-50 transition-colors text-left flex items-center justify-between group"
                    >
                      <div>
                        <div className="font-medium text-gray-900 group-hover:text-green-600">
                          {labor.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {labor.position}
                        </div>
                      </div>
                      <svg
                        className="w-5 h-5 text-gray-400 group-hover:text-green-600"
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
                <div className="px-4 py-6 text-center text-gray-500 text-sm">
                  Không tìm thấy nhân công
                </div>
              )}
            </div>
          )}
        </div>

        {/* Labor Entries Table */}
        {laborEntries.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <p className="text-gray-600 text-sm">Chưa có nhân công</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Table Header - Desktop only */}
            <div className="hidden lg:grid grid-cols-12 gap-3 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-600">
              <div className="col-span-1">STT</div>
              <div className="col-span-2">Nhân công</div>
              <div className="col-span-2">Giờ làm</div>
              <div className="col-span-2">Nhóm</div>
              <div className="col-span-2">Ca làm</div>
              <div className="col-span-2">Số lượng</div>
              <div className="col-span-1"></div>
            </div>

            {/* Table Rows */}
            {laborEntries.map((entry, index) => (
              <div
                key={entry.id}
                className="grid grid-cols-1 lg:grid-cols-12 gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                {/* Mobile: Labor Name Header */}
                <div className="lg:hidden col-span-1 font-medium text-gray-900 mb-2">
                  {index + 1}. {entry.laborName}
                </div>

                {/* STT - Desktop */}
                <div className="hidden lg:flex col-span-1 items-center text-gray-700">
                  {index + 1}
                </div>

                {/* Name - Desktop */}
                <div className="hidden lg:flex col-span-2 items-center">
                  <span className="font-medium text-gray-900">
                    {entry.laborName}
                  </span>
                </div>

                {/* Work Hours */}
                <div className="col-span-1 lg:col-span-2">
                  <label className="block lg:hidden text-xs text-gray-600 mb-1">
                    Giờ làm
                  </label>
                  <input
                    type="text"
                    value={entry.workHours}
                    onChange={(e) =>
                      handleUpdateLabor(entry.id, { workHours: e.target.value })
                    }
                    placeholder="VD: 3.5/7"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Team */}
                <div className="col-span-1 lg:col-span-2">
                  <label className="block lg:hidden text-xs text-gray-600 mb-1">
                    Nhóm
                  </label>
                  <input
                    type="text"
                    value={entry.team}
                    onChange={(e) =>
                      handleUpdateLabor(entry.id, { team: e.target.value })
                    }
                    placeholder="VD: Nhóm 2"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Shift */}
                <div className="col-span-1 lg:col-span-2">
                  <label className="block lg:hidden text-xs text-gray-600 mb-1">
                    Ca làm
                  </label>
                  <input
                    type="text"
                    value={entry.shift}
                    onChange={(e) =>
                      handleUpdateLabor(entry.id, { shift: e.target.value })
                    }
                    placeholder="VD: 7h00-17h00"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Quantity */}
                <div className="col-span-1 lg:col-span-2">
                  <label className="block lg:hidden text-xs text-gray-600 mb-1">
                    Số lượng ({entry.unit})
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={entry.quantity}
                      onChange={(e) =>
                        handleUpdateLabor(entry.id, {
                          quantity: Number(e.target.value),
                        })
                      }
                      placeholder="0"
                      className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <div className="hidden lg:flex px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 text-sm items-center">
                      {entry.unit}
                    </div>
                  </div>
                </div>

                {/* Delete Button */}
                <div className="col-span-1 lg:col-span-1 flex items-center justify-end">
                  <button
                    onClick={() => handleRemoveLabor(entry.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                    title="Xóa"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
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
  );
}
