'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { MaterialDto, UpdateActualQuantityDto } from '@/types/material.types';
import { materialService } from '@/services/materialService';

interface ActualQuantityModalProps {
  isOpen: boolean;
  material: MaterialDto | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ActualQuantityModal({
  isOpen,
  material,
  onClose,
  onSuccess,
}: ActualQuantityModalProps) {
  const [actualQuantity, setActualQuantity] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && material) {
      // Pre-fill with current actual quantity if exists
      setActualQuantity(
        material.actualQuantity !== null && material.actualQuantity !== undefined
          ? material.actualQuantity.toString()
          : ''
      );
      setNotes('');
      setError(null);
    }
  }, [isOpen, material]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!material) return;

    const qty = parseFloat(actualQuantity);
    if (isNaN(qty) || qty < 0) {
      setError('Vui lòng nhập khối lượng hợp lệ');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const dto: UpdateActualQuantityDto = {
        actualQuantity: qty,
        notes: notes.trim() || undefined,
      };

      await materialService.updateActualQuantity(material.id, dto);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Không thể cập nhật khối lượng thực tế');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !material) return null;

  const variance = actualQuantity
    ? ((parseFloat(actualQuantity) - material.contractQuantity) /
        material.contractQuantity) *
      100
    : undefined;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex items-center justify-between rounded-t-lg">
          <h2 className="text-xl font-semibold text-white">
            Cập nhật khối lượng thực tế
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-white hover:bg-green-500 rounded p-1 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Material Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Thông tin vật tư</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500">Mã số</label>
                <p className="text-sm font-medium text-gray-900">{material.code}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Hạng mục</label>
                <p className="text-sm font-medium text-gray-900">{material.name}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Đơn vị</label>
                <p className="text-sm font-medium text-gray-900">{material.unit}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">KL theo hợp đồng</label>
                <p className="text-sm font-semibold text-blue-700">
                  {material.contractQuantity != null
                    ? material.contractQuantity.toLocaleString('vi-VN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : '-'}{' '}
                  {material.unit}
                </p>
              </div>
            </div>
          </div>

          {/* Actual Quantity Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Khối lượng thực tế <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={actualQuantity}
                onChange={(e) => setActualQuantity(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Nhập khối lượng thực tế"
                required
                disabled={loading}
              />
              <span className="absolute right-4 top-2 text-gray-500 text-sm">
                {material.unit}
              </span>
            </div>

            {/* Variance Preview */}
            {variance !== undefined && !isNaN(variance) && (
              <div
                className={`mt-2 p-3 rounded-lg ${
                  variance > 0
                    ? 'bg-red-50 border border-red-200'
                    : variance < 0
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <AlertCircle
                    className={`w-4 h-4 ${
                      variance > 0
                        ? 'text-red-600'
                        : variance < 0
                        ? 'text-green-600'
                        : 'text-gray-600'
                    }`}
                  />
                  <p
                    className={`text-sm font-medium ${
                      variance > 0
                        ? 'text-red-700'
                        : variance < 0
                        ? 'text-green-700'
                        : 'text-gray-700'
                    }`}
                  >
                    Chênh lệch: {variance > 0 ? '+' : ''}
                    {variance.toFixed(2)}%
                    {variance > 0 && ' (Vượt dự toán)'}
                    {variance < 0 && ' (Tiết kiệm)'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
              placeholder="Ghi chú về khối lượng thực tế (tùy chọn)"
              disabled={loading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || !actualQuantity}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {loading ? 'Đang cập nhật...' : 'Cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
