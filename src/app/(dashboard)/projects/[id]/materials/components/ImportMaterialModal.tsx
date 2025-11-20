'use client';

import { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { materialService } from '@/services/materialService';

interface ImportMaterialModalProps {
  isOpen: boolean;
  requestId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ImportMaterialModal({
  isOpen,
  requestId,
  onClose,
  onSuccess,
}: ImportMaterialModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];

    if (!validTypes.includes(file.type)) {
      setError('Chỉ chấp nhận file Excel (.xlsx, .xls)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      setError('File quá lớn. Kích thước tối đa 10MB');
      return;
    }

    setSelectedFile(file);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!requestId || !selectedFile) return;

    setLoading(true);
    setError(null);

    try {
      await materialService.importMaterials(requestId, selectedFile);
      onSuccess();
      onClose();
      setSelectedFile(null);
    } catch (err: any) {
      setError(err.message || 'Không thể import vật tư. Vui lòng kiểm tra file và thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    if (!loading) {
      setSelectedFile(null);
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between rounded-t-lg">
          <h2 className="text-xl font-semibold text-white">Import vật tư từ Excel</h2>
          <button
            onClick={handleCloseModal}
            disabled={loading}
            className="text-white hover:bg-blue-500 rounded p-1 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              Hướng dẫn file Excel
            </h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>File Excel phải có các cột: Mã số, Hạng mục, Đơn vị, Đơn giá, Khối lượng theo hợp đồng</li>
              <li>Các cột tùy chọn: Khối lượng theo NKTC</li>
              <li>Dữ liệu bắt đầu từ dòng 2 (dòng 1 là tiêu đề)</li>
              <li>Kích thước tối đa: 10MB</li>
            </ul>
          </div>

          {/* Upload Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 bg-gray-50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleChange}
              className="hidden"
              disabled={loading}
            />

            {!selectedFile ? (
              <div className="space-y-3">
                <FileSpreadsheet className="w-16 h-16 mx-auto text-gray-400" />
                <div>
                  <p className="text-gray-700 mb-2">
                    Kéo thả file Excel vào đây hoặc
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    Chọn file
                  </button>
                </div>
                <p className="text-xs text-gray-500">Chấp nhận: .xlsx, .xls (tối đa 10MB)</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="inline-flex items-center gap-3 bg-white rounded-lg px-4 py-3 border border-gray-200">
                  <FileSpreadsheet className="w-8 h-8 text-green-600" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setError(null);
                  }}
                  disabled={loading}
                  className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
                >
                  Chọn file khác
                </button>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-700 mb-1">Lỗi import</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCloseModal}
              disabled={loading}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || !selectedFile}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {loading ? (
                'Đang import...'
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Import vật tư
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
