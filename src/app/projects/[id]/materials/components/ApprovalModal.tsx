'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import {
  MaterialRequestDetailDto,
  ApproveMaterialRequestDto,
  RejectMaterialRequestDto,
} from '@/types/material.types';
import { materialService } from '@/services/materialService';

interface ApprovalModalProps {
  isOpen: boolean;
  request: MaterialRequestDetailDto | null;
  mode: 'approve' | 'reject';
  approverType: 'homeowner' | 'supervisor';
  onClose: () => void;
  onSuccess: () => void;
}

export function ApprovalModal({
  isOpen,
  request,
  mode,
  approverType,
  onClose,
  onSuccess,
}: ApprovalModalProps) {
  const [notes, setNotes] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setNotes('');
      setReason('');
      setConfirmed(false);
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!request) return;

    if (mode === 'approve' && !confirmed) {
      setError('Vui lòng xác nhận đã kiểm tra yêu cầu');
      return;
    }

    if (mode === 'reject' && !reason.trim()) {
      setError('Vui lòng nhập lý do từ chối');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === 'approve') {
        const dto: ApproveMaterialRequestDto = {
          approved: true,
          notes: notes.trim() || undefined,
        };

        if (approverType === 'homeowner') {
          await materialService.approveByHomeowner(request.id, dto);
        } else {
          await materialService.approveBySupervisor(request.id, dto);
        }
      } else {
        const dto: RejectMaterialRequestDto = {
          reason: reason.trim(),
        };

        await materialService.rejectRequest(request.id, dto);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Không thể thực hiện thao tác');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !request) return null;

  const isApprove = mode === 'approve';
  const roleLabel = approverType === 'homeowner' ? 'Chủ đầu tư' : 'Giám sát chính';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div
          className={`px-6 py-4 flex items-center justify-between ${
            isApprove
              ? 'bg-gradient-to-r from-green-600 to-green-700'
              : 'bg-gradient-to-r from-red-600 to-red-700'
          }`}
        >
          <div className="flex items-center gap-3 text-white">
            {isApprove ? (
              <CheckCircle className="w-6 h-6" />
            ) : (
              <XCircle className="w-6 h-6" />
            )}
            <h2 className="text-xl font-semibold">
              {isApprove ? 'Phê duyệt' : 'Từ chối'} yêu cầu vật tư
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-white hover:bg-white/20 rounded p-1 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-160px)]">
          {/* Request Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Thông tin yêu cầu
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Mã yêu cầu:</span>
                <span className="ml-2 font-medium text-gray-900">
                  #{request.id.substring(0, 8)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Nhà thầu:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {request.contractorName}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Ngày tạo:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(request.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Số vật tư:</span>
                <span className="ml-2 font-semibold text-blue-600">
                  {request.materialCount}
                </span>
              </div>
            </div>
          </div>

          {/* Materials Preview */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Danh sách vật tư ({request.materials?.length || 0})
            </h3>
            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                      Mã số
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                      Hạng mục
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">
                      Khối lượng
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">
                      Thành tiền
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {request.materials?.map((material) => (
                    <tr key={material.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-xs text-gray-900">
                        {material.code}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-900">
                        {material.name}
                      </td>
                      <td className="px-3 py-2 text-xs text-right text-gray-900">
                        {material.contractQuantity.toLocaleString('vi-VN')} {material.unit}
                      </td>
                      <td className="px-3 py-2 text-xs text-right text-gray-900">
                        {material.contractAmount.toLocaleString('vi-VN')} VNĐ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Approve Mode */}
          {isApprove && (
            <>
              {/* Confirmation Checkbox */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    disabled={loading}
                    className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-green-900">
                      Xác nhận phê duyệt với vai trò {roleLabel}
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      Tôi xác nhận đã kiểm tra kỹ danh sách vật tư và đồng ý phê duyệt yêu
                      cầu này
                    </p>
                  </div>
                </label>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú (tùy chọn)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                  placeholder="Nhập ghi chú về việc phê duyệt..."
                  disabled={loading}
                />
              </div>
            </>
          )}

          {/* Reject Mode */}
          {!isApprove && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do từ chối <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={4}
                placeholder="Nhập lý do từ chối yêu cầu vật tư..."
                required
                disabled={loading}
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || (isApprove && !confirmed) || (!isApprove && !reason.trim())}
            className={`px-6 py-2 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
              isApprove
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {loading ? 'Đang xử lý...' : isApprove ? 'Phê duyệt' : 'Từ chối'}
          </button>
        </div>
      </div>
    </div>
  );
}
