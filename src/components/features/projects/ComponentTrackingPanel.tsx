"use client";

import { useState } from "react";
import {
  BuildingElement,
  TrackingStatistics,
} from "@/types/model-tracking.types";
import { Button } from "@/components/ui";

interface ComponentTrackingPanelProps {
  selectedElement?: BuildingElement;
  statistics: TrackingStatistics;
  onUpdateStatus: (
    elementId: string,
    status: "not_started" | "in_progress" | "completed"
  ) => void;
}

export default function ComponentTrackingPanel({
  selectedElement,
  statistics,
  onUpdateStatus,
}: ComponentTrackingPanelProps) {
  const [notes, setNotes] = useState("");

  const statusText = {
    not_started: "❌ Chưa bắt đầu",
    in_progress: "⏳ Đang thi công",
    completed: "✅ Hoàn thành",
  };

  return (
    <div className="w-[350px] bg-[#2a2a2a] border-r-2 border-gray-700 overflow-y-auto p-5">
      <h1 className="text-xl font-bold mb-5 text-green-500">
        🏗️ Daily Tracking System
      </h1>

      {/* Statistics Card */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-4 rounded-lg mb-5 text-center">
        <div className="text-4xl font-bold mb-1">
          {statistics.total_elements}
        </div>
        <div className="text-sm opacity-90">Tổng phần tử có thể tracking</div>
      </div>

      {/* Project Info */}
      <div className="bg-[#333] p-4 rounded-lg mb-5">
        <h3 className="text-sm font-bold text-orange-400 mb-3">
          📋 Thông tin công trình
        </h3>
        <div className="space-y-2">
          <InfoItem
            label="Tổng phần tử"
            value={statistics.total_elements.toString()}
          />
          <InfoItem label="Tường" value={statistics.by_type.walls.toString()} />
          <InfoItem label="Cột" value={statistics.by_type.columns.toString()} />
          <InfoItem label="Sàn" value={statistics.by_type.slabs.toString()} />
          <InfoItem label="Dầm" value={statistics.by_type.beams.toString()} />
          <InfoItem
            label="Tổng khối lượng"
            value={`${statistics.total_volume.toFixed(2)} m³`}
          />
        </div>
      </div>

      {/* Progress Info */}
      <div className="bg-[#333] p-4 rounded-lg mb-5">
        <h3 className="text-sm font-bold text-orange-400 mb-3">
          📊 Tiến độ thi công
        </h3>
        <div className="space-y-2">
          <InfoItem
            label="Hoàn thành"
            value={statistics.by_status.completed.toString()}
          />
          <InfoItem
            label="Đang thi công"
            value={statistics.by_status.in_progress.toString()}
          />
          <InfoItem
            label="Chưa bắt đầu"
            value={statistics.by_status.not_started.toString()}
          />
        </div>
        <div className="mt-4 text-center">
          <div className="text-3xl font-bold text-green-400">
            {statistics.completion_percentage.toFixed(1)}%
          </div>
          <div className="text-xs opacity-80">Tỷ lệ hoàn thành</div>
        </div>
      </div>

      {/* Selected Element Info */}
      {selectedElement && (
        <div className="bg-blue-600 p-4 rounded-lg mb-5">
          <h3 className="text-lg font-bold mb-3">📦 {selectedElement.name}</h3>
          <div className="space-y-2 text-sm">
            <div>🏗️ Loại: {selectedElement.element_type}</div>
            <div>
              📏 Kích thước: {selectedElement.dimensions.width.toFixed(2)}m ×{" "}
              {selectedElement.dimensions.length.toFixed(2)}m ×{" "}
              {selectedElement.dimensions.height.toFixed(2)}m
            </div>
            <div>📦 Khối lượng: {selectedElement.volume_m3} m³</div>
            <div>🏢 Tầng: {selectedElement.floor_level}</div>
            <div>📊 {statusText[selectedElement.tracking_status]}</div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold"
              onClick={() => onUpdateStatus(selectedElement.id, "completed")}
            >
              ✅ Hoàn thành
            </Button>
            <Button
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold"
              onClick={() => onUpdateStatus(selectedElement.id, "in_progress")}
            >
              ⏳ Đang làm
            </Button>
          </div>

          <Button
            className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white font-bold"
            onClick={() => onUpdateStatus(selectedElement.id, "not_started")}
          >
            ❌ Reset
          </Button>

          {/* Notes */}
          <div className="mt-4">
            <label className="text-sm font-bold block mb-2">📝 Ghi chú:</label>
            <textarea
              className="w-full bg-blue-700 border border-blue-500 rounded p-2 text-white text-sm"
              rows={3}
              placeholder="Nhập ghi chú về tiến độ..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-[#333] p-4 rounded-lg text-sm">
        <h3 className="text-orange-400 font-bold mb-2">💡 Hướng dẫn</h3>
        <ul className="space-y-1 text-gray-300">
          <li>1️⃣ Click chọn phần tử trên mô hình 3D</li>
          <li>2️⃣ Xem thông tin chi tiết phần tử</li>
          <li>3️⃣ Cập nhật trạng thái thi công</li>
          <li>4️⃣ Thêm ghi chú và lưu tiến độ</li>
        </ul>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-600 last:border-0">
      <span className="text-gray-400 text-sm">{label}:</span>
      <span className="text-white font-bold text-sm">{value}</span>
    </div>
  );
}
