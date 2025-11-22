'use client';

import { useState } from 'react';
import {
  MaterialRequestDto,
  MaterialRequestStatus,
  getMaterialRequestStatusLabel,
  getMaterialRequestStatusColor,
  parseStatusFromBackend,
} from '@/types/material.types';
import { CheckCircle2, XCircle, Clock, Eye, FileCheck, Trash2, Calendar, User, Package } from 'lucide-react';

interface MaterialRequestListProps {
  requests: MaterialRequestDto[];
  canApproveAsHomeowner: boolean;
  canApproveAsSupervisor: boolean;
  onViewDetail: (request: MaterialRequestDto) => void;
  onApprove: (request: MaterialRequestDto) => void;
  onReject: (request: MaterialRequestDto) => void;
  onDelete: (request: MaterialRequestDto) => void;
}

type TabType = 'all' | 'pending' | 'approved' | 'rejected';

export function MaterialRequestList({
  requests,
  canApproveAsHomeowner,
  canApproveAsSupervisor,
  onViewDetail,
  onApprove,
  onReject,
  onDelete,
}: MaterialRequestListProps) {
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const filteredRequests = requests.filter((req) => {
    if (activeTab === 'all') return true;
    const status = parseStatusFromBackend(req.status);
    if (activeTab === 'pending')
      return status === MaterialRequestStatus.Pending ||
             status === MaterialRequestStatus.PartiallyApproved;
    if (activeTab === 'approved') return status === MaterialRequestStatus.Approved;
    if (activeTab === 'rejected') return status === MaterialRequestStatus.Rejected;
    return true;
  });

  const pendingCount = requests.filter((r) => {
    const status = parseStatusFromBackend(r.status);
    return status === MaterialRequestStatus.Pending ||
           status === MaterialRequestStatus.PartiallyApproved;
  }).length;
  const approvedCount = requests.filter((r) => {
    const status = parseStatusFromBackend(r.status);
    return status === MaterialRequestStatus.Approved;
  }).length;
  const rejectedCount = requests.filter((r) => {
    const status = parseStatusFromBackend(r.status);
    return status === MaterialRequestStatus.Rejected;
  }).length;

  const tabs = [
    { id: 'all' as TabType, label: 'Tất cả', count: requests.length, color: 'slate' },
    { id: 'pending' as TabType, label: 'Chờ duyệt', count: pendingCount, color: 'amber' },
    { id: 'approved' as TabType, label: 'Đã duyệt', count: approvedCount, color: 'green' },
    { id: 'rejected' as TabType, label: 'Từ chối', count: rejectedCount, color: 'red' },
  ];

  const shouldShowApproveButton = (request: MaterialRequestDto): boolean => {
    const status = parseStatusFromBackend(request.status);
    if (status === MaterialRequestStatus.Approved ||
        status === MaterialRequestStatus.Rejected) {
      return false;
    }

    if (canApproveAsHomeowner && !request.approvedByHomeowner) {
      return true;
    }

    if (canApproveAsSupervisor && !request.approvedBySupervisor) {
      return true;
    }

    return false;
  };

  const isApproveButtonDisabled = (request: MaterialRequestDto): boolean => {
    if (canApproveAsHomeowner && request.projectDelegatesApprovalToSupervisor) {
      return true;
    }

    return false;
  };

  const canRejectRequest = (request: MaterialRequestDto): boolean => {
    const status = parseStatusFromBackend(request.status);
    if (status === MaterialRequestStatus.Approved ||
        status === MaterialRequestStatus.Rejected) {
      return false;
    }
    return canApproveAsHomeowner || canApproveAsSupervisor;
  };

  const canDeleteRequest = (request: MaterialRequestDto): boolean => {
    const status = parseStatusFromBackend(request.status);
    return status !== MaterialRequestStatus.Approved;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Header with Tabs */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-5">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FileCheck className="w-6 h-6" />
          Yêu cầu phê duyệt vật tư
        </h3>
        <div className="flex gap-2 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-white text-slate-800 shadow-md scale-105'
                  : 'bg-slate-700/50 text-slate-200 hover:bg-slate-600/50'
              }`}
            >
              {tab.label}
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === tab.id
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-800/30 text-slate-300'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Request List */}
      <div className="p-6">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-200 mb-4">
              <FileCheck className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-lg font-medium text-slate-600">Không có yêu cầu nào</p>
            <p className="text-sm text-slate-500 mt-1">
              {activeTab === 'all' ? 'Chưa có yêu cầu phê duyệt nào' : `Không có yêu cầu ${tabs.find(t => t.id === activeTab)?.label.toLowerCase()}`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                className="border-2 border-slate-200 rounded-xl p-6 hover:shadow-xl hover:border-slate-300 transition-all duration-200 bg-gradient-to-br from-white to-slate-50"
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    {/* Header */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Calendar className="w-5 h-5" />
                        <h3 className="font-bold text-lg">
                          Yêu cầu ngày {new Date(request.requestDate || request.createdAt).toLocaleDateString('vi-VN')}
                        </h3>
                      </div>
                      <span
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${getMaterialRequestStatusColor(
                          request.status
                        )}`}
                      >
                        {getMaterialRequestStatusLabel(request.status)}
                      </span>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-start gap-3 bg-white rounded-lg p-3 border border-slate-200">
                        <User className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs text-slate-500 font-medium block">Nhà thầu</span>
                          <span className="font-semibold text-slate-900 block truncate">
                            {request.contractorName}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 bg-white rounded-lg p-3 border border-slate-200">
                        <Calendar className="w-5 h-5 text-green-600 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs text-slate-500 font-medium block">Ngày tạo</span>
                          <span className="font-semibold text-slate-900 block">
                            {new Date(request.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 bg-white rounded-lg p-3 border border-slate-200">
                        <Package className="w-5 h-5 text-purple-600 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs text-slate-500 font-medium block">Số vật tư</span>
                          <span className="font-bold text-lg text-blue-600 block">
                            {request.materialCount}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Approval Status */}
                    <div className="flex items-center gap-6 bg-white rounded-lg p-4 border border-slate-200">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                            request.approvedByHomeowner
                              ? 'bg-green-500 border-green-500 shadow-md'
                              : 'bg-white border-slate-300'
                          }`}
                        >
                          {request.approvedByHomeowner && (
                            <CheckCircle2 className="w-5 h-5 text-white" strokeWidth={3} />
                          )}
                        </div>
                        <span
                          className={`font-semibold ${
                            request.approvedByHomeowner
                              ? 'text-green-700'
                              : 'text-slate-500'
                          }`}
                        >
                          Chủ đầu tư
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                            request.approvedBySupervisor
                              ? 'bg-green-500 border-green-500 shadow-md'
                              : 'bg-white border-slate-300'
                          }`}
                        >
                          {request.approvedBySupervisor && (
                            <CheckCircle2 className="w-5 h-5 text-white" strokeWidth={3} />
                          )}
                        </div>
                        <span
                          className={`font-semibold ${
                            request.approvedBySupervisor
                              ? 'text-green-700'
                              : 'text-slate-500'
                          }`}
                        >
                          Giám sát chính
                        </span>
                      </div>
                    </div>

                    {/* Rejection Reason */}
                    {parseStatusFromBackend(request.status) === MaterialRequestStatus.Rejected &&
                      request.rejectionReason && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                          <p className="text-sm text-red-600 font-bold mb-2 flex items-center gap-2">
                            <XCircle className="w-4 h-4" />
                            Lý do từ chối:
                          </p>
                          <p className="text-sm text-red-800 font-medium">{request.rejectionReason}</p>
                        </div>
                      )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 min-w-[120px]">
                    <button
                      onClick={() => onViewDetail(request)}
                      className="px-4 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-150 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                    >
                      <Eye className="w-4 h-4" />
                      Xem
                    </button>
                    {shouldShowApproveButton(request) && (
                      <button
                        onClick={() => onApprove(request)}
                        disabled={isApproveButtonDisabled(request)}
                        className={`px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-150 flex items-center justify-center gap-2 shadow-md ${
                          isApproveButtonDisabled(request)
                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Duyệt
                      </button>
                    )}
                    {canRejectRequest(request) && (
                      <button
                        onClick={() => onReject(request)}
                        className="px-4 py-2.5 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-150 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                      >
                        <XCircle className="w-4 h-4" />
                        Từ chối
                      </button>
                    )}
                    {canDeleteRequest(request) && (
                      <button
                        onClick={() => onDelete(request)}
                        className="px-4 py-2.5 text-sm font-semibold bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-all duration-150 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                        Xóa
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
