'use client';

import { useEffect, useState } from 'react';
import { X, TrendingUp, TrendingDown } from 'lucide-react';
import { MaterialDetailDto, calculateVariance, getVarianceColor } from '@/types/material.types';
import { materialService } from '@/services/materialService';

interface MaterialDetailModalProps {
  isOpen: boolean;
  materialId: string | null;
  onClose: () => void;
}

export function MaterialDetailModal({
  isOpen,
  materialId,
  onClose,
}: MaterialDetailModalProps) {
  const [material, setMaterial] = useState<MaterialDetailDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && materialId) {
      loadMaterialDetail();
    } else {
      setMaterial(null);
      setError(null);
    }
  }, [isOpen, materialId]);

  const loadMaterialDetail = async () => {
    if (!materialId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await materialService.getMaterialById(materialId);
      setMaterial(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải thông tin vật tư');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const variance = material
    ? calculateVariance(material.contractQuantity, material.actualQuantity)
    : undefined;
  const varianceColor = getVarianceColor(variance);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Chi tiết vật tư</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-500 rounded p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Đang tải...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          )}

          {material && !loading && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">
                  Thông tin cơ bản
                </h3>
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
                    <label className="text-xs text-gray-500">Đơn giá</label>
                    <p className="text-sm font-medium text-gray-900">
                      {material.unitPrice.toLocaleString('vi-VN')} VNĐ
                    </p>
                  </div>
                </div>
              </div>

              {/* Contract Information */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-700 mb-3 uppercase">
                  Theo hợp đồng
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-blue-600">Khối lượng</label>
                    <p className="text-lg font-bold text-blue-900">
                      {material.contractQuantity.toLocaleString('vi-VN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{' '}
                      <span className="text-sm font-normal">{material.unit}</span>
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-blue-600">Thành tiền</label>
                    <p className="text-lg font-bold text-blue-900">
                      {material.contractAmount.toLocaleString('vi-VN')} VNĐ
                    </p>
                  </div>
                </div>
              </div>

              {/* Estimated Information (if exists) */}
              {material.estimatedQuantity !== null &&
                material.estimatedQuantity !== undefined && (
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-purple-700 mb-3 uppercase">
                      Theo NKTC (Nhật ký thi công)
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-purple-600">Khối lượng</label>
                        <p className="text-lg font-bold text-purple-900">
                          {material.estimatedQuantity.toLocaleString('vi-VN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{' '}
                          <span className="text-sm font-normal">{material.unit}</span>
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-purple-600">Thành tiền</label>
                        <p className="text-lg font-bold text-purple-900">
                          {(material.estimatedAmount || 0).toLocaleString('vi-VN')} VNĐ
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              {/* Actual Information */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-green-700 mb-3 uppercase">
                  Nghiệm thu thực tế
                </h3>
                {material.actualQuantity !== null &&
                material.actualQuantity !== undefined ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-green-600">Khối lượng</label>
                      <p className="text-lg font-bold text-green-900">
                        {material.actualQuantity.toLocaleString('vi-VN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{' '}
                        <span className="text-sm font-normal">{material.unit}</span>
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-green-600">Thành tiền</label>
                      <p className="text-lg font-bold text-green-900">
                        {(material.actualAmount || 0).toLocaleString('vi-VN')} VNĐ
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">Chưa ghi nhận khối lượng thực tế</p>
                )}
              </div>

              {/* Variance Analysis */}
              {variance !== undefined && (
                <div
                  className={`rounded-lg p-4 ${
                    variance > 0
                      ? 'bg-red-50 border border-red-200'
                      : variance < 0
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase flex items-center gap-2">
                    {variance > 0 ? (
                      <TrendingUp className="w-4 h-4 text-red-600" />
                    ) : variance < 0 ? (
                      <TrendingDown className="w-4 h-4 text-green-600" />
                    ) : null}
                    Phân tích chênh lệch
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-gray-600">Chênh lệch %</label>
                      <p className={`text-2xl font-bold ${varianceColor}`}>
                        {variance > 0 ? '+' : ''}
                        {variance.toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Chênh lệch khối lượng</label>
                      <p className={`text-lg font-semibold ${varianceColor}`}>
                        {variance > 0 ? '+' : ''}
                        {(
                          (material.actualQuantity || 0) - material.contractQuantity
                        ).toLocaleString('vi-VN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{' '}
                        {material.unit}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Chênh lệch tiền</label>
                      <p className={`text-lg font-semibold ${varianceColor}`}>
                        {variance > 0 ? '+' : ''}
                        {(material.varianceAmount || 0).toLocaleString('vi-VN')} VNĐ
                      </p>
                    </div>
                  </div>
                  {variance > 0 && (
                    <p className="mt-3 text-sm text-red-700">
                      ⚠️ Vượt dự toán hợp đồng - Cần xem xét
                    </p>
                  )}
                  {variance < 0 && (
                    <p className="mt-3 text-sm text-green-700">
                      ✓ Tiết kiệm so với dự toán hợp đồng
                    </p>
                  )}
                </div>
              )}

              {/* Payments Section */}
              {material.payments && material.payments.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">
                    Lịch sử thanh toán
                  </h3>
                  <div className="space-y-2">
                    {material.payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="bg-white rounded p-3 border border-gray-200"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {payment.paidAmount.toLocaleString('vi-VN')} VNĐ
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(payment.paymentDate).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Còn lại</p>
                            <p className="text-sm font-medium text-orange-600">
                              {payment.remainingAmount.toLocaleString('vi-VN')} VNĐ
                            </p>
                          </div>
                        </div>
                        {payment.notes && (
                          <p className="text-xs text-gray-600 mt-2">{payment.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
