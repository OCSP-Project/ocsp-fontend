'use client';

import { useState, useEffect } from 'react';
import { X, FileText, Calendar, User, CheckCircle, XCircle } from 'lucide-react';
import { MaterialRequestDetailDto } from '@/types/material.types';
import { materialService } from '@/services/materialService';

interface RequestDetailModalProps {
  isOpen: boolean;
  requestId: string | null;
  onClose: () => void;
}

export function RequestDetailModal({
  isOpen,
  requestId,
  onClose,
}: RequestDetailModalProps) {
  const [request, setRequest] = useState<MaterialRequestDetailDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && requestId) {
      loadRequestDetail();
    }
  }, [isOpen, requestId]);

  const loadRequestDetail = async () => {
    if (!requestId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await materialService.getRequestById(requestId);
      setRequest(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải chi tiết yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex items-center gap-3 text-white">
            <FileText className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-semibold">Chi tiết yêu cầu vật tư</h2>
              {request && (
                <p className="text-sm text-blue-100">
                  Mã: #{request.id.substring(0, 8)}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Đang tải...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && request && (
            <div className="space-y-6">
              {/* Request Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 rounded-lg p-4">
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <Calendar className="w-4 h-4" />
                    Ngày tạo
                  </div>
                  <p className="font-medium text-gray-900">
                    {new Date(request.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <User className="w-4 h-4" />
                    Nhà thầu
                  </div>
                  <p className="font-medium text-gray-900">{request.contractorName}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <FileText className="w-4 h-4" />
                    Số vật tư
                  </div>
                  <p className="font-semibold text-blue-600 text-lg">{request.materialCount}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    Trạng thái
                  </div>
                  <div className="flex items-center gap-1">
                    {request.approvedByHomeowner && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                    {!request.approvedByHomeowner && request.status === 'Pending' && (
                      <XCircle className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="text-sm font-medium">Chủ đầu tư</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {request.approvedBySupervisor && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                    {!request.approvedBySupervisor && request.status === 'Pending' && (
                      <XCircle className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="text-sm font-medium">Giám sát</span>
                  </div>
                </div>
              </div>

              {/* Materials Table */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Danh sách vật tư ({request.materials?.length || 0})
                </h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            STT
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Mã số
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                            Hạng mục
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Đơn vị
                          </th>
                          <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Đơn giá
                          </th>
                          <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            KL hợp đồng
                          </th>
                          <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            KL NKTC
                          </th>
                          <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Thành tiền
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {request.materials?.map((material, index) => (
                          <tr key={material.id} className="hover:bg-gray-50">
                            <td className="px-3 py-3 text-sm text-gray-900">
                              {index + 1}
                            </td>
                            <td className="px-3 py-3 text-sm text-gray-900 font-mono">
                              {material.code}
                            </td>
                            <td className="px-3 py-3 text-sm text-gray-900">
                              {material.name}
                            </td>
                            <td className="px-3 py-3 text-sm text-gray-900">
                              {material.unit}
                            </td>
                            <td className="px-3 py-3 text-sm text-gray-900 text-right">
                              {material.unitPrice.toLocaleString('vi-VN')}
                            </td>
                            <td className="px-3 py-3 text-sm text-gray-900 text-right">
                              {material.contractQuantity?.toLocaleString('vi-VN') || '-'}
                            </td>
                            <td className="px-3 py-3 text-sm text-gray-900 text-right font-medium">
                              {material.estimatedQuantity.toLocaleString('vi-VN')}
                            </td>
                            <td className="px-3 py-3 text-sm text-gray-900 text-right font-semibold">
                              {material.estimatedAmount.toLocaleString('vi-VN')} VNĐ
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan={7} className="px-3 py-3 text-sm font-semibold text-gray-900 text-right">
                            Tổng cộng:
                          </td>
                          <td className="px-3 py-3 text-sm font-bold text-blue-600 text-right">
                            {request.materials
                              ?.reduce((sum, m) => sum + m.estimatedAmount, 0)
                              .toLocaleString('vi-VN')}{' '}
                            VNĐ
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {request.notes && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-yellow-900 mb-2">Ghi chú</h4>
                  <p className="text-sm text-yellow-800">{request.notes}</p>
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
