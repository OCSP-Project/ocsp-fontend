'use client';

import { useState } from 'react';
import { MaterialDto, calculateVariance, getVarianceColor } from '@/types/material.types';
import { Eye, Edit3, Trash2 } from 'lucide-react';

interface MaterialTableProps {
  materials: MaterialDto[];
  canUpdateActual: boolean;
  canDelete?: boolean;
  onViewDetail: (material: MaterialDto) => void;
  onUpdateActual: (material: MaterialDto) => void;
  onDeleteAll?: () => void;
}

export function MaterialTable({
  materials,
  canUpdateActual,
  canDelete = false,
  onViewDetail,
  onUpdateActual,
  onDeleteAll,
}: MaterialTableProps) {
  if (materials.length === 0) {
    return (
      <div className="text-center py-16 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-200 mb-4">
          <Eye className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-slate-600 font-medium">Chưa có vật tư nào được phê duyệt</p>
        <p className="text-sm text-slate-500 mt-1">Vật tư sẽ hiển thị sau khi được phê duyệt</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Header with Delete All Button */}
      {canDelete && onDeleteAll && (
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Danh sách vật tư đã phê duyệt</h3>
            <p className="text-sm text-slate-300 mt-0.5">{materials.length} vật tư</p>
          </div>
          <button
            onClick={onDeleteAll}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <Trash2 className="w-4 h-4" />
            Xóa tất cả
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-gradient-to-r from-slate-700 to-slate-600">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider w-20">
                STT
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider min-w-[120px]">
                Mã số
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider min-w-[300px]">
                Hạng mục
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-white uppercase tracking-wider min-w-[130px]">
                KL hợp đồng
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-white uppercase tracking-wider min-w-[130px]">
                KL thực tế
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-white uppercase tracking-wider min-w-[120px]">
                Chênh lệch
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider w-36">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {materials.map((material, index) => {
              const variance = calculateVariance(
                material.contractQuantity,
                material.actualQuantity
              );
              const varianceColor = getVarianceColor(variance);

              return (
                <tr
                  key={material.id}
                  className="hover:bg-slate-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-md bg-blue-50 text-sm font-mono font-semibold text-blue-700 border border-blue-200">
                      {material.code}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-md">
                      <p className="font-semibold text-slate-900 leading-tight">{material.name}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                          {material.unit}
                        </span>
                        <span className="text-xs text-slate-500">
                          Đơn giá: {material.unitPrice.toLocaleString('vi-VN')} VNĐ
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-sm font-semibold text-slate-900">
                      {material.contractQuantity != null
                        ? material.contractQuantity.toLocaleString('vi-VN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {material.actualQuantity !== null &&
                    material.actualQuantity !== undefined ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-md bg-green-50 text-sm font-bold text-green-700 border border-green-200">
                        {material.actualQuantity.toLocaleString('vi-VN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic text-sm">Chưa ghi nhận</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {variance !== undefined ? (
                      <span className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-bold ${varianceColor}`}>
                        {variance > 0 ? '+' : ''}
                        {variance.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onViewDetail(material)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-150 hover:shadow-md"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      {canUpdateActual && (
                        <button
                          onClick={() => onUpdateActual(material)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-150 hover:shadow-md"
                          title="Cập nhật khối lượng thực tế"
                        >
                          <Edit3 className="w-5 h-5" />
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

      {/* Enhanced Summary Footer */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-t border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-bold text-lg">{materials.length}</span>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Tổng số vật tư</p>
              <p className="text-sm font-semibold text-slate-900">{materials.length} hạng mục</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <span className="text-green-600 font-bold text-lg">
                {materials.filter((m) => m.actualQuantity !== null && m.actualQuantity !== undefined).length}
              </span>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Đã ghi nhận</p>
              <p className="text-sm font-semibold text-slate-900">
                {materials.filter((m) => m.actualQuantity !== null && m.actualQuantity !== undefined).length} vật tư
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <span className="text-amber-600 font-bold text-lg">
                {materials.filter((m) => m.actualQuantity === null || m.actualQuantity === undefined).length}
              </span>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Chưa ghi nhận</p>
              <p className="text-sm font-semibold text-slate-900">
                {materials.filter((m) => m.actualQuantity === null || m.actualQuantity === undefined).length} vật tư
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
