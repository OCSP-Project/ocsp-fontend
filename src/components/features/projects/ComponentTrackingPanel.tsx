"use client";

import { useState, useEffect } from "react";
import { notification } from "antd";
import { buildingElementsApi } from "@/lib/building-elements/building-elements.api";
import type {
  BuildingElement,
  TrackingStatistics,
} from "@/types/model-tracking.types";
import { Button } from "@/components/ui";

interface ComponentTrackingPanelProps {
  selectedElement?: BuildingElement;
  statistics: TrackingStatistics;
  onUpdateCompletion: (
    elementId: string,
    percentage: number,
    photos: File[]
  ) => void;
  onReportDeviation?: (elementId: string) => void;
}

export default function ComponentTrackingPanel({
  selectedElement,
  statistics,
  onUpdateCompletion,
  onReportDeviation,
}: ComponentTrackingPanelProps) {
  const [notes, setNotes] = useState("");
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string[]>([]);

  // Update percentage when selected element changes
  useEffect(() => {
    if (selectedElement) {
      setCompletionPercentage(selectedElement.completion_percentage || 0);
    }
  }, [selectedElement]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedPhotos(files);

    // Create previews
    const previews = files.map((file) => URL.createObjectURL(file));
    setPhotoPreview(previews);
  };

  const handleSaveTracking = async () => {
    if (!selectedElement) return;
    if (uploadedPhotos.length === 0) {
      notification.warning({
        message: "Chưa upload ảnh",
        description: "Vui lòng upload ít nhất 1 ảnh!",
      });
      return;
    }

    try {
      const newStatus = mapStatusToNumber(
        completionPercentage === 100
          ? "completed"
          : completionPercentage > 0
          ? "in_progress"
          : "not_started"
      );

      const history = await buildingElementsApi.addTracking(selectedElement.id, {
        newStatus,
        newPercentage: completionPercentage,
        notes,
      });

      for (const file of uploadedPhotos) {
        await buildingElementsApi.addPhoto(
          history.id,
          file,
          `Progress at ${completionPercentage}%`
        );
      }

      onUpdateCompletion(selectedElement.id, completionPercentage, uploadedPhotos);

      setUploadedPhotos([]);
      setPhotoPreview([]);
      setNotes("");
      notification.success({
        message: "Thành công",
        description: "Đã lưu tracking thành công!",
      });
    } catch (error: any) {
      console.error("Save tracking error:", error);
      notification.error({
        message: "Lỗi",
        description: error?.response?.data?.message || error?.message || "Có lỗi xảy ra",
      });
    }
  };

  function mapStatusToNumber(status: string): number {
    const map: Record<string, number> = {
      not_started: 0,
      in_progress: 1,
      completed: 2,
      on_hold: 3,
    };
    return map[status] ?? 0;
  }

  const getPercentageColor = (percentage: number) => {
    if (percentage === 0) return "text-red-500";
    if (percentage <= 25) return "text-orange-600";
    if (percentage <= 50) return "text-orange-500";
    if (percentage <= 75) return "text-yellow-500";
    if (percentage < 100) return "text-green-400";
    return "text-green-500";
  };

  const getPercentageLabel = (percentage: number) => {
    if (percentage === 0) return "🔴 Chưa bắt đầu";
    if (percentage <= 25) return "🟠 Khởi công";
    if (percentage <= 50) return "🟠 Đang thi công";
    if (percentage <= 75) return "🟡 Gần hoàn thành";
    if (percentage < 100) return "🟢 Sắp xong";
    return "✅ Hoàn thành";
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
        <div className="text-sm opacity-90">Tổng phần tử tracking</div>
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

      {/* Selected Element - Tracking Form */}
      {selectedElement && (
        <div className="bg-blue-600 p-4 rounded-lg mb-5">
          <h3 className="text-lg font-bold mb-3">📦 {selectedElement.name}</h3>
          <div className="space-y-2 text-sm mb-4">
            <div>🏗️ Loại: {selectedElement.element_type}</div>
            <div>
              📏 Kích thước: {selectedElement.dimensions.width.toFixed(2)}m ×{" "}
              {selectedElement.dimensions.length.toFixed(2)}m ×{" "}
              {selectedElement.dimensions.height.toFixed(2)}m
            </div>
            <div>📦 Khối lượng: {selectedElement.volume_m3.toFixed(2)} m³</div>
            <div>🏢 Tầng: {selectedElement.floor_level}</div>
          </div>

          {/* Completion Percentage Slider */}
          <div className="bg-blue-700 p-3 rounded-lg mb-4">
            <label className="text-sm font-bold block mb-2">
              📊 % Hoàn thành:
            </label>
            <div
              className={`text-3xl font-bold mb-2 ${getPercentageColor(
                completionPercentage
              )}`}
            >
              {completionPercentage}%
            </div>
            <div className="text-sm opacity-90 mb-3">
              {getPercentageLabel(completionPercentage)}
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={completionPercentage}
              onChange={(e) =>
                setCompletionPercentage(parseInt(e.target.value))
              }
              className="w-full h-2 bg-blue-800 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, 
                  #f44336 0%, 
                  #ff5722 25%, 
                  #ffa726 50%, 
                  #ffeb3b 75%, 
                  #4caf50 100%)`,
              }}
            />
            <div className="flex justify-between text-xs mt-1 opacity-70">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Photo Upload */}
          <div className="bg-blue-700 p-3 rounded-lg mb-4">
            <label className="text-sm font-bold block mb-2">
              📸 Ảnh hiện trường *
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="w-full text-sm text-white bg-blue-800 border border-blue-500 rounded p-2"
            />
            <div className="text-xs opacity-70 mt-1">
              * Bắt buộc tải lên ít nhất 1 ảnh
            </div>

            {/* Photo Previews */}
            {photoPreview.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {photoPreview.map((preview, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-20 object-cover rounded border border-blue-500"
                    />
                    <div className="absolute top-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                      {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="text-sm font-bold block mb-2">📝 Ghi chú:</label>
            <textarea
              className="w-full bg-blue-700 border border-blue-500 rounded p-2 text-white text-sm"
              rows={3}
              placeholder="Nhập ghi chú về tiến độ, vật liệu..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mb-2">
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2"
              onClick={handleSaveTracking}
              disabled={uploadedPhotos.length === 0}
            >
              💾 Lưu tracking
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2"
              onClick={() => onReportDeviation?.(selectedElement.id)}
            >
              🚨 Báo cáo sai lệch
            </Button>
          </div>
          {uploadedPhotos.length === 0 && (
            <div className="text-xs text-yellow-300 mt-2 text-center">
              ⚠️ Cần upload ảnh để lưu tracking
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-[#333] p-4 rounded-lg text-sm">
        <h3 className="text-orange-400 font-bold mb-2">💡 Hướng dẫn</h3>
        <ul className="space-y-1 text-gray-300">
          <li>1️⃣ Click chọn phần tử trên mô hình 3D</li>
          <li>2️⃣ Upload ảnh chụp hiện trường</li>
          <li>3️⃣ Kéo thanh % để ước tính hoàn thành</li>
          <li>4️⃣ Thêm ghi chú nếu cần</li>
          <li>5️⃣ Click "Lưu tracking"</li>
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
