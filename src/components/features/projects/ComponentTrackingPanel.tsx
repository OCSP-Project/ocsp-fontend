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
    <div className="w-[350px] bg-white/95 backdrop-blur-xl border-r-2 border-gray-200 overflow-y-auto p-5 shadow-xl">
      <h1 className="text-xl font-bold mb-5" style={{
        background: 'linear-gradient(135deg, #38c1b6 0%, #667eea 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        🏗️ Daily Tracking System
      </h1>

      {/* Selected Element - Tracking Form */}
      {selectedElement && (
        <div className="bg-gradient-to-br from-teal-50/90 to-purple-50/90 backdrop-blur-sm border-2 border-gray-200 p-4 rounded-xl mb-5 shadow-md">
          <h3 className="text-lg font-bold mb-3 text-gray-800">📦 {selectedElement.name}</h3>

          {/* Completion Percentage Slider */}
          <div className="bg-white/80 backdrop-blur-sm border-2 border-gray-200 p-3 rounded-xl mb-4">
            <label className="text-sm font-bold block mb-2 text-gray-700">
              📊 % Hoàn thành:
            </label>
            <div
              className={`text-3xl font-bold mb-2 ${getPercentageColor(
                completionPercentage
              )}`}
            >
              {completionPercentage}%
            </div>
            <div className="text-sm text-gray-600 mb-3">
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
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right,
                  #f44336 0%,
                  #ff5722 25%,
                  #ffa726 50%,
                  #ffeb3b 75%,
                  #4caf50 100%)`,
              }}
            />
            <div className="flex justify-between text-xs mt-1 text-gray-500">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Photo Upload */}
          <div className="bg-white/80 backdrop-blur-sm border-2 border-gray-200 p-3 rounded-xl mb-4">
            <label className="text-sm font-bold block mb-2 text-gray-700">
              📸 Ảnh hiện trường *
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="w-full text-sm text-gray-700 bg-gray-50 border-2 border-gray-200 rounded-lg p-2"
            />
            <div className="text-xs text-gray-500 mt-1">
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
                      className="w-full h-20 object-cover rounded-lg border-2 border-gray-300"
                    />
                    <div className="absolute top-1 right-1 bg-gray-800/80 text-white text-xs px-1.5 py-0.5 rounded">
                      {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="text-sm font-bold block mb-2 text-gray-700">📝 Ghi chú:</label>
            <textarea
              className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-2 text-gray-700 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              rows={3}
              placeholder="Nhập ghi chú về tiến độ, vật liệu..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mb-2">
            <Button
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-2 rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-50"
              onClick={handleSaveTracking}
              disabled={uploadedPhotos.length === 0}
            >
              💾 Lưu tracking
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-2 rounded-xl shadow-sm hover:shadow-md transition-all"
              onClick={() => onReportDeviation?.(selectedElement.id)}
            >
              🚨 Báo cáo sai lệch
            </Button>
          </div>
          {uploadedPhotos.length === 0 && (
            <div className="text-xs text-yellow-600 mt-2 text-center bg-yellow-50 py-1.5 px-2 rounded-lg border border-yellow-200">
              ⚠️ Cần upload ảnh để lưu tracking
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gradient-to-br from-teal-50/90 to-purple-50/90 backdrop-blur-sm border-2 border-gray-200 p-4 rounded-xl text-sm shadow-sm">
        <h3 className="font-bold mb-2" style={{
          background: 'linear-gradient(135deg, #38c1b6 0%, #667eea 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>💡 Hướng dẫn</h3>
        <ul className="space-y-1 text-gray-700">
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
    <div className="flex justify-between py-2 border-b border-gray-200 last:border-0">
      <span className="text-gray-600 text-sm">{label}:</span>
      <span className="text-gray-800 font-bold text-sm">{value}</span>
    </div>
  );
}
