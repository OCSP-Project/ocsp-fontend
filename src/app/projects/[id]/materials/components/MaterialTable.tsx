'use client';

import { useState } from 'react';
import { MaterialDto, calculateVariance, getVarianceColor } from '@/types/material.types';
import { Eye, Edit3 } from 'lucide-react';

interface MaterialTableProps {
  materials: MaterialDto[];
  canUpdateActual: boolean;
  onViewDetail: (material: MaterialDto) => void;
  onUpdateActual: (material: MaterialDto) => void;
}

export function MaterialTable({
  materials,
  canUpdateActual,
  onViewDetail,
  onUpdateActual,
}: MaterialTableProps) {
  if (materials.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500">Chưa có vật tư nào được phê duyệt</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                STT
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mã số
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hạng mục
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                KL hợp đồng
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                KL thực tế
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Chênh lệch
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {materials.map((material, index) => {
              const variance = calculateVariance(
                material.contractQuantity,
                material.actualQuantity
              );
              const varianceColor = getVarianceColor(variance);

              return (
                <tr
                  key={material.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {material.code}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div className="max-w-md">
                      <p className="font-medium">{material.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Đơn vị: {material.unit}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900">
                    {material.contractQuantity.toLocaleString('vi-VN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                    {material.actualQuantity !== null &&
                    material.actualQuantity !== undefined ? (
                      <span className="font-medium text-gray-900">
                        {material.actualQuantity.toLocaleString('vi-VN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">Chưa ghi nhận</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                    {variance !== undefined ? (
                      <span className={`font-semibold ${varianceColor}`}>
                        {variance > 0 ? '+' : ''}
                        {variance.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onViewDetail(material)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {canUpdateActual && (
                        <button
                          onClick={() => onUpdateActual(material)}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                          title="Cập nhật khối lượng thực tế"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            Tổng số vật tư: <span className="font-semibold">{materials.length}</span>
          </span>
          <span className="text-gray-600">
            Đã ghi nhận thực tế:{' '}
            <span className="font-semibold">
              {materials.filter((m) => m.actualQuantity !== null && m.actualQuantity !== undefined).length}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
