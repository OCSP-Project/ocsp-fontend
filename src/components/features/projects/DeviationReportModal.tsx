"use client";

import { useState } from "react";
import { notification } from "antd";
import type { DeviationType } from "@/types/model-tracking.types";

interface DeviationReportModalProps {
  elementId: string;
  elementName: string;
  onClose: () => void;
  onSave: (report: {
    deviation_type: DeviationType;
    severity: "low" | "medium" | "high" | "critical";
    description: string;
    photos: File[];
    priority: number;
  }) => void;
}

export default function DeviationReportModal({
  elementId,
  elementName,
  onClose,
  onSave,
}: DeviationReportModalProps) {
  const [deviationType, setDeviationType] = useState<DeviationType>("delay");
  const [severity, setSeverity] = useState<
    "low" | "medium" | "high" | "critical"
  >("medium");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string[]>([]);
  const [priority, setPriority] = useState(3);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotos(files);

    const previews = files.map((file) => URL.createObjectURL(file));
    setPhotoPreview(previews);
  };

  const handleSubmit = () => {
    if (!description.trim()) {
      notification.warning({
        message: "Chưa nhập mô tả",
        description: "Vui lòng nhập mô tả sai lệch!",
      });
      return;
    }

    if (photos.length === 0) {
      notification.warning({
        message: "Chưa upload ảnh",
        description: "Vui lòng upload ít nhất 1 ảnh chứng minh sai lệch!",
      });
      return;
    }

    onSave({
      deviation_type: deviationType,
      severity,
      description,
      photos,
      priority,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-[#2a2a2a] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-red-400">
              🚨 Báo cáo sai lệch
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          {/* Element Info */}
          <div className="bg-blue-600/20 border border-blue-500 rounded-lg p-4 mb-4">
            <div className="text-sm text-gray-300">Phần tử:</div>
            <div className="text-lg font-bold text-white">{elementName}</div>
            <div className="text-xs text-gray-400">ID: {elementId}</div>
          </div>

          {/* Deviation Type */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-white mb-2">
              📋 Loại sai lệch
            </label>
            <select
              value={deviationType}
              onChange={(e) =>
                setDeviationType(e.target.value as DeviationType)
              }
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white"
            >
              <option value="delay">⏰ Chậm tiến độ</option>
              <option value="quality">🎯 Chất lượng không đạt</option>
              <option value="material">🧱 Vật liệu sai</option>
              <option value="specification">📐 Thiết kế sai</option>
              <option value="other">⚠️ Khác</option>
            </select>
          </div>

          {/* Severity */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-white mb-2">
              🔴 Mức độ nghiêm trọng
            </label>
            <select
              value={severity}
              onChange={(e) =>
                setSeverity(
                  e.target.value as "low" | "medium" | "high" | "critical"
                )
              }
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white"
            >
              <option value="low">🟢 Thấp - Cần theo dõi</option>
              <option value="medium">🟡 Trung bình - Cần xử lý</option>
              <option value="high">🟠 Cao - Cần xử lý ngay</option>
              <option value="critical">🔴 Nghiêm trọng - Dừng thi công</option>
            </select>
          </div>

          {/* Priority */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-white mb-2">
              ⭐ Độ ưu tiên: {priority}
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={priority}
              onChange={(e) => setPriority(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs mt-1 text-gray-400">
              <span>1 - Thấp</span>
              <span>2</span>
              <span>3 - Trung bình</span>
              <span>4</span>
              <span>5 - Cao</span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-white mb-2">
              📝 Mô tả chi tiết sai lệch *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Mô tả chi tiết sai lệch đã phát hiện..."
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white resize-none"
            />
          </div>

          {/* Photo Upload */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-white mb-2">
              📸 Ảnh chứng minh * (Tối thiểu 1 ảnh)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="w-full text-sm text-white bg-gray-800 border border-gray-600 rounded p-2"
            />

            {/* Photo Previews */}
            {photoPreview.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {photoPreview.map((preview, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-24 object-cover rounded border border-red-500"
                    />
                    <div className="absolute top-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                      {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={!description.trim() || photos.length === 0}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition"
            >
              🚨 Gửi báo cáo
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition"
            >
              Hủy
            </button>
          </div>

          {(!description.trim() || photos.length === 0) && (
            <div className="mt-2 text-xs text-yellow-300 text-center">
              ⚠️ Vui lòng điền đầy đủ thông tin và upload ảnh để gửi báo cáo
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
