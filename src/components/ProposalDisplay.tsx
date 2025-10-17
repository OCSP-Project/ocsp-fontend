"use client";

import React from 'react';
import { ProposalDto } from '@/lib/proposals/proposals.api';

interface ProposalDisplayProps {
  proposal: ProposalDto;
}

export default function ProposalDisplay({ proposal }: ProposalDisplayProps) {
  // Format currency with Vietnamese formatting (dots as thousand separators)
  const formatCurrency = (value: string | number): string => {
    if (typeof value === 'string') {
      // Remove any existing formatting and extract number
      const cleanValue = value.replace(/[^\d]/g, '');
      const numValue = parseInt(cleanValue);
      if (isNaN(numValue)) return value;
      return numValue.toLocaleString('vi-VN');
    }
    return value.toLocaleString('vi-VN');
  };

  return (
    <div className="bg-stone-900/50 rounded-xl border border-stone-700/50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-stone-100">Proposal Chi Tiết</h3>
          {proposal.isFromExcel && (
            <span className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-sm">
              📊 Từ Excel: {proposal.excelFileName}
            </span>
          )}
        </div>
        
        <div className="flex justify-between text-sm text-stone-400">
          <span>Tổng giá: <span className="text-amber-400 font-semibold">{formatCurrency(proposal.priceTotal)} VNĐ</span></span>
          <span>Thời gian: <span className="text-blue-400 font-semibold">{proposal.durationDays} ngày</span></span>
        </div>
      </div>

      {/* Tổng hợp Tab Content */}
      <div className="min-h-[400px]">
        <div className="space-y-6">
          {/* Project Information */}
          {(proposal.projectTitle || proposal.constructionArea || proposal.constructionTime || proposal.numberOfWorkers || proposal.averageSalary) && (
            <div className="bg-stone-800/30 rounded-lg p-4 border border-stone-700/30">
              <h4 className="text-lg font-semibold text-stone-200 mb-3">Thông tin dự án</h4>
              <div className="space-y-2">
                {proposal.projectTitle && (
                  <p className="text-stone-300 text-sm">
                    <span className="font-medium text-stone-200">Dự án:</span> {proposal.projectTitle}
                  </p>
                )}
                {proposal.constructionArea && (
                  <p className="text-stone-300 text-sm">
                    <span className="font-medium text-stone-200">Diện tích xây dựng:</span> {proposal.constructionArea}
                  </p>
                )}
                {proposal.constructionTime && (
                  <p className="text-stone-300 text-sm">
                    <span className="font-medium text-stone-200">Thời gian thi công:</span> {proposal.constructionTime}
                  </p>
                )}
                {proposal.numberOfWorkers && (
                  <p className="text-stone-300 text-sm">
                    <span className="font-medium text-stone-200">Số công nhân:</span> {proposal.numberOfWorkers}
                  </p>
                )}
                {proposal.averageSalary && (
                  <p className="text-stone-300 text-sm">
                    <span className="font-medium text-stone-200">Lương trung bình:</span> {proposal.averageSalary}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Cost Items Table */}
          {proposal.items && proposal.items.length > 0 && (
            <div className="bg-stone-800/30 rounded-lg p-4 border border-stone-700/30">
              <h4 className="text-lg font-semibold text-stone-200 mb-4">Chi tiết chi phí</h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-stone-700/50">
                      <th className="text-left py-2 px-3 text-stone-300 font-medium">Hạng mục</th>
                      <th className="text-right py-2 px-3 text-stone-300 font-medium">Chi phí (VNĐ)</th>
                      <th className="text-center py-2 px-3 text-stone-300 font-medium">Tỷ lệ (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proposal.items.map((item, index) => (
                      <tr key={index} className="border-b border-stone-700/30 hover:bg-stone-700/20">
                        <td className="py-3 px-3 text-stone-200">{item.name}</td>
                        <td className="py-3 px-3 text-right text-stone-200 font-medium">
                          {formatCurrency(item.price)} VNĐ
                        </td>
                        <td className="py-3 px-3 text-center text-stone-300">{item.notes || ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Total Cost Summary */}
          <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-amber-200">TỔNG CỘNG</span>
              <span className="text-2xl font-bold text-amber-400">
                {formatCurrency(proposal.priceTotal)} VNĐ
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}