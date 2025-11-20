'use client';

import { useState } from 'react';
import {
  MaterialRequestDto,
  MaterialRequestStatus,
  getMaterialRequestStatusLabel,
  getMaterialRequestStatusColor,
} from '@/types/material.types';
import { CheckCircle2, XCircle, Clock, Eye, FileCheck } from 'lucide-react';

interface MaterialRequestListProps {
  requests: MaterialRequestDto[];
  canApproveAsHomeowner: boolean;
  canApproveAsSupervisor: boolean;
  onViewDetail: (request: MaterialRequestDto) => void;
  onApprove: (request: MaterialRequestDto) => void;
  onReject: (request: MaterialRequestDto) => void;
}

type TabType = 'all' | 'pending' | 'approved' | 'rejected';

export function MaterialRequestList({
  requests,
  canApproveAsHomeowner,
  canApproveAsSupervisor,
  onViewDetail,
  onApprove,
  onReject,
}: MaterialRequestListProps) {
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const filteredRequests = requests.filter((req) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending')
      return req.status === MaterialRequestStatus.Pending ||
             req.status === MaterialRequestStatus.PartiallyApproved;
    if (activeTab === 'approved') return req.status === MaterialRequestStatus.Approved;
    if (activeTab === 'rejected') return req.status === MaterialRequestStatus.Rejected;
    return true;
  });

  const pendingCount = requests.filter(
    (r) => r.status === MaterialRequestStatus.Pending ||
           r.status === MaterialRequestStatus.PartiallyApproved
  ).length;
  const approvedCount = requests.filter(
    (r) => r.status === MaterialRequestStatus.Approved
  ).length;
  const rejectedCount = requests.filter(
    (r) => r.status === MaterialRequestStatus.Rejected
  ).length;

  const tabs = [
    { id: 'all' as TabType, label: 'Tất cả', count: requests.length },
    { id: 'pending' as TabType, label: 'Chờ duyệt', count: pendingCount },
    { id: 'approved' as TabType, label: 'Đã duyệt', count: approvedCount },
    { id: 'rejected' as TabType, label: 'Từ chối', count: rejectedCount },
  ];

  const canApprove = (request: MaterialRequestDto): boolean => {
    if (request.status === MaterialRequestStatus.Approved ||
        request.status === MaterialRequestStatus.Rejected) {
      return false;
    }

    // Homeowner can approve if not yet approved by homeowner
    if (canApproveAsHomeowner && !request.homeownerApproved) {
      return true;
    }

    // Supervisor can approve if homeowner already approved
    if (canApproveAsSupervisor && request.homeownerApproved && !request.supervisorApproved) {
      return true;
    }

    return false;
  };

  const canRejectRequest = (request: MaterialRequestDto): boolean => {
    if (request.status === MaterialRequestStatus.Approved ||
        request.status === MaterialRequestStatus.Rejected) {
      return false;
    }
    return canApproveAsHomeowner || canApproveAsSupervisor;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-1 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}{' '}
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id
                    ? 'bg-blue-700 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Request List */}
      <div className="p-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileCheck className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>Không có yêu cầu nào</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        Yêu cầu #{request.id.substring(0, 8)}
                      </h3>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${getMaterialRequestStatusColor(
                          request.status
                        )}`}
                      >
                        {getMaterialRequestStatusLabel(request.status)}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="grid grid-cols-2 gap-3 text-sm mb-3">
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

                    {/* Approval Status */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5">
                        {request.homeownerApproved ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-gray-400" />
                        )}
                        <span
                          className={
                            request.homeownerApproved
                              ? 'text-green-700 font-medium'
                              : 'text-gray-500'
                          }
                        >
                          Chủ đầu tư
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {request.supervisorApproved ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-gray-400" />
                        )}
                        <span
                          className={
                            request.supervisorApproved
                              ? 'text-green-700 font-medium'
                              : 'text-gray-500'
                          }
                        >
                          Giám sát chính
                        </span>
                      </div>
                    </div>

                    {/* Rejection Reason */}
                    {request.status === MaterialRequestStatus.Rejected &&
                      request.rejectionReason && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-xs text-red-600 font-medium mb-1">
                            Lý do từ chối:
                          </p>
                          <p className="text-sm text-red-700">{request.rejectionReason}</p>
                        </div>
                      )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => onViewDetail(request)}
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                    >
                      <Eye className="w-4 h-4" />
                      Xem
                    </button>
                    {canApprove(request) && (
                      <button
                        onClick={() => onApprove(request)}
                        className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Duyệt
                      </button>
                    )}
                    {canRejectRequest(request) && (
                      <button
                        onClick={() => onReject(request)}
                        className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        Từ chối
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
