"use client";

import React, { useState, useRef } from 'react';
import { ProposalDto, proposalsApi } from '@/lib/proposals/proposals.api';

interface EditProposalModalProps {
  proposal: ProposalDto;
  quoteId: string;
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditProposalModal({ 
  proposal, 
  quoteId, 
  visible, 
  onClose, 
  onSuccess 
}: EditProposalModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processFileUpload(file);
  };

  const processFileUpload = async (file: File) => {
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      setError('Chỉ chấp nhận file Excel (.xlsx)');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const result = await proposalsApi.uploadExcel(quoteId, file);
      
      // Show success message immediately
      setSuccess(`Đã cập nhật proposal thành công từ file: ${file.name}`);
      
      // Wait a bit longer for user to see the success message
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2500);

    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Có lỗi xảy ra khi upload file');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.name.toLowerCase().endsWith('.xlsx')) {
        // Process file directly without creating synthetic event
        processFileUpload(file);
      } else {
        setError('Chỉ chấp nhận file Excel (.xlsx)');
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('vi-VN');
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-stone-800 rounded-xl border border-stone-700 p-6 w-full max-w-4xl mx-auto max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-amber-300">Chỉnh sửa Proposal</h3>
          <button 
            className="text-stone-400 hover:text-stone-200 text-2xl" 
            onClick={onClose}
            disabled={loading}
          >
            ×
          </button>
        </div>

        {/* Current Proposal Info */}
        <div className="mb-6 p-4 bg-stone-700/30 rounded-lg border border-stone-600/30">
          <h4 className="text-lg font-semibold text-stone-200 mb-3">Thông tin Proposal hiện tại</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-stone-400">Trạng thái:</span>
              <span className="ml-2 text-stone-100 font-medium">{proposal.status}</span>
            </div>
            <div>
              <span className="text-stone-400">Tổng giá:</span>
              <span className="ml-2 text-amber-300 font-semibold">
                {formatCurrency(proposal.priceTotal)} VNĐ
              </span>
            </div>
            <div>
              <span className="text-stone-400">Thời gian:</span>
              <span className="ml-2 text-blue-300 font-medium">{proposal.durationDays} ngày</span>
            </div>
          </div>
          
          {proposal.isFromExcel && proposal.excelFileName && (
            <div className="mt-3 p-2 bg-green-600/20 rounded border border-green-600/30">
              <span className="text-green-400 text-sm">
                📊 Được tạo từ file Excel: {proposal.excelFileName}
              </span>
            </div>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-3 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 rounded-md bg-green-500/20 border border-green-500/50 text-green-400 animate-pulse">
            <div className="flex items-center space-x-2">
              <span className="text-green-400 text-lg">✅</span>
              <span className="font-medium">{success}</span>
            </div>
            <div className="text-green-300 text-sm mt-1">
              Modal sẽ đóng tự động sau vài giây...
            </div>
          </div>
        )}

        {/* Upload Section */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-stone-200 mb-4">Upload file Excel mới</h4>
          
          {/* File Upload Area */}
          <div
            className="border-2 border-dashed border-stone-600 rounded-lg p-8 text-center hover:border-amber-500/50 transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="space-y-4">
              <div className="text-4xl text-stone-400">📊</div>
              <div>
                <p className="text-stone-200 font-medium mb-2">
                  Kéo thả file Excel vào đây hoặc click để chọn
                </p>
                <p className="text-stone-400 text-sm">
                  Chỉ chấp nhận file .xlsx
                </p>
              </div>
              <button
                type="button"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Chọn file Excel'}
              </button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx"
            onChange={handleFileUpload}
            className="hidden"
            disabled={loading}
          />
        </div>

        {/* Current Proposal Items */}
        {proposal.items && proposal.items.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-stone-200 mb-4">Chi tiết hạng mục hiện tại</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-stone-300 border-b border-stone-700">
                  <tr>
                    <th className="text-left py-2 px-3">Hạng mục</th>
                    <th className="text-right py-2 px-3">Chi phí (VNĐ)</th>
                    <th className="text-center py-2 px-3">Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {proposal.items.map((item, index) => (
                    <tr key={index} className="border-b border-stone-700/30 hover:bg-stone-700/20">
                      <td className="py-3 px-3 text-stone-200">{item.name}</td>
                      <td className="py-3 px-3 text-right text-stone-200 font-medium">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="py-3 px-3 text-center text-stone-300">
                        {item.notes || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-600/10 rounded-lg border border-blue-600/30">
          <h5 className="text-blue-300 font-semibold mb-2">Hướng dẫn:</h5>
          <ul className="text-blue-200 text-sm space-y-1">
            <li>• Upload file Excel mới sẽ thay thế hoàn toàn proposal hiện tại</li>
            <li>• File Excel phải có định dạng đúng với template hệ thống</li>
            <li>• Sau khi upload thành công, proposal sẽ được cập nhật tự động</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-stone-300 hover:text-stone-100 transition-colors"
            disabled={loading}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
