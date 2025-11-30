"use client";

import { useState, useRef } from "react";
import { notification } from "antd";
import { workItemService } from "@/services";

interface ImportExcelDialogProps {
  projectId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ImportExcelDialog({
  projectId,
  onClose,
  onSuccess,
}: ImportExcelDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
    importedCount?: number;
    errorCount?: number;
    errors?: string[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (
        !selectedFile.name.endsWith(".xlsx") &&
        !selectedFile.name.endsWith(".xls")
      ) {
        notification.warning({
          message: "File không hợp lệ",
          description: "Vui lòng chọn file Excel (.xlsx hoặc .xls)",
        });
        return;
      }

      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        notification.warning({
          message: "File quá lớn",
          description: "Kích thước tối đa là 10MB",
        });
        return;
      }

      setFile(selectedFile);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      notification.warning({
        message: "Chưa chọn file",
        description: "Vui lòng chọn file để tải lên",
      });
      return;
    }

    try {
      setUploading(true);
      const result = await workItemService.importFromExcel(
        projectId,
        file,
        overwriteExisting
      );

      setUploadResult({
        success: result.success,
        message: result.message,
        importedCount: result.importedCount,
        errorCount: result.errorCount,
        errors: result.errors,
      });

      if (result.success && result.errorCount === 0) {
        // Auto close after 2 seconds on full success
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (error: any) {
      console.error("Error importing Excel:", error);
      setUploadResult({
        success: false,
        message: error.response?.data?.message || "Không thể import file Excel",
        errorCount: 1,
        errors: [error.response?.data?.message || "Lỗi không xác định"],
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (
        !droppedFile.name.endsWith(".xlsx") &&
        !droppedFile.name.endsWith(".xls")
      ) {
        notification.warning({
          message: "File không hợp lệ",
          description: "Vui lòng chọn file Excel (.xlsx hoặc .xls)",
        });
        return;
      }
      setFile(droppedFile);
      setUploadResult(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Import Dự toán từ Excel
          </h2>
          <button
            onClick={onClose}
            disabled={uploading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <svg
              className="w-5 h-5 text-gray-600"
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

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* File Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />

            <svg
              className="w-12 h-12 mx-auto mb-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>

            {file ? (
              <div>
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setUploadResult(null);
                  }}
                  className="mt-2 text-sm text-red-600 hover:text-red-700"
                >
                  Xóa file
                </button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600">
                  Kéo thả file Excel vào đây hoặc{" "}
                  <span className="text-blue-600 font-medium">
                    nhấn để chọn file
                  </span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Chấp nhận file .xlsx và .xls (tối đa 10MB)
                </p>
              </div>
            )}
          </div>

          {/* Options */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="overwrite"
              checked={overwriteExisting}
              onChange={(e) => setOverwriteExisting(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="overwrite"
              className="text-sm text-gray-700 cursor-pointer"
            >
              Ghi đè dữ liệu hiện có (nếu trùng mã công việc)
            </label>
          </div>

          {/* Upload Result */}
          {uploadResult && (
            <div
              className={`p-4 rounded-lg ${
                uploadResult.success
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <div className="flex items-start gap-3">
                {uploadResult.success ? (
                  <svg
                    className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
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
                )}
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      uploadResult.success ? "text-green-800" : "text-red-800"
                    }`}
                  >
                    {uploadResult.message}
                  </p>
                  {uploadResult.importedCount !== undefined && (
                    <p className="text-sm text-gray-600 mt-1">
                      Đã import: {uploadResult.importedCount} công việc
                      {uploadResult.errorCount! > 0 &&
                        ` - Lỗi: ${uploadResult.errorCount}`}
                    </p>
                  )}
                  {uploadResult.errors && uploadResult.errors.length > 0 && (
                    <div className="mt-2 max-h-40 overflow-y-auto">
                      <p className="text-sm font-medium text-red-800 mb-1">
                        Chi tiết lỗi:
                      </p>
                      <ul className="text-sm text-red-700 space-y-1">
                        {uploadResult.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Định dạng file Excel:</p>
                <ul className="space-y-1 text-blue-700">
                  <li>• Hàng 1-5: Header (sẽ được bỏ qua)</li>
                  <li>• Từ hàng 6: Dữ liệu công việc</li>
                  <li>
                    • Cột A (STT): Phân cấp công việc (I., II., III. / 1, 2, 3 /
                    1.1, 1.2)
                  </li>
                  <li>• Cột B: Tên công việc</li>
                  <li>• Cột C: Ngày bắt đầu</li>
                  <li>• Cột D: Ngày kết thúc</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {uploading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {uploading ? "Đang tải lên..." : "Tải lên"}
          </button>
        </div>
      </div>
    </div>
  );
}
