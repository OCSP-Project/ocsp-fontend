'use client';

import { MaterialRequestDto, MaterialRequestStatus } from '@/types/material.types';
import { CheckCircle, XCircle, Upload, Clock, Bell } from 'lucide-react';
import { useMemo } from 'react';

interface MaterialActivityPanelProps {
  requests: MaterialRequestDto[];
}

interface Activity {
  id: string;
  type: 'upload' | 'approved' | 'rejected';
  request: MaterialRequestDto;
  timestamp: Date;
}

export function MaterialActivityPanel({ requests }: MaterialActivityPanelProps) {
  // Get recent activities (last 24 hours or last 10 activities)
  const recentActivities = useMemo(() => {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const activities: Activity[] = requests
      .map((request) => {
        const createdDate = new Date(request.createdAt);

        // Determine activity type based on status and timestamps
        let type: 'upload' | 'approved' | 'rejected' = 'upload';
        let timestamp = createdDate;

        if (request.status === MaterialRequestStatus.Approved) {
          // Use the later of approvedByHomeownerAt or approvedBySupervisorAt
          const homeownerDate = request.approvedByHomeownerAt
            ? new Date(request.approvedByHomeownerAt)
            : null;
          const supervisorDate = request.approvedBySupervisorAt
            ? new Date(request.approvedBySupervisorAt)
            : null;

          if (homeownerDate && supervisorDate) {
            timestamp = homeownerDate > supervisorDate ? homeownerDate : supervisorDate;
          } else if (homeownerDate) {
            timestamp = homeownerDate;
          } else if (supervisorDate) {
            timestamp = supervisorDate;
          } else {
            // Fallback to createdDate if no approval timestamps
            timestamp = createdDate;
          }
          type = 'approved';
        } else if (request.status === MaterialRequestStatus.Rejected) {
          // Use rejectedAt if available, otherwise fall back to createdDate
          timestamp = request.rejectedAt ? new Date(request.rejectedAt) : createdDate;
          type = 'rejected';
        }

        return {
          id: request.id,
          type,
          request,
          timestamp,
        };
      })
      .filter((activity) => activity.timestamp >= oneDayAgo) // Only last 24 hours
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()) // Sort by newest first
      .slice(0, 10); // Limit to 10 most recent

    return activities;
  }, [requests]);

  if (recentActivities.length === 0) {
    return null;
  }

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'upload':
        return <Upload className="w-5 h-5 text-blue-600" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'upload':
        return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
      case 'approved':
        return 'bg-green-50 border-green-200 hover:bg-green-100';
      case 'rejected':
        return 'bg-red-50 border-red-200 hover:bg-red-100';
    }
  };

  const getActivityTitle = (type: Activity['type']) => {
    switch (type) {
      case 'upload':
        return 'Yêu cầu mới';
      case 'approved':
        return 'Đã phê duyệt';
      case 'rejected':
        return 'Đã từ chối';
    }
  };

  const getActivityMessage = (activity: Activity) => {
    const { type, request } = activity;

    switch (type) {
      case 'upload':
        return `${request.contractorName} đã tạo yêu cầu vật tư mới với ${request.materialCount} vật tư`;
      case 'approved':
        return `Yêu cầu từ ${request.contractorName} đã được phê duyệt (${request.materialCount} vật tư)`;
      case 'rejected':
        return `Yêu cầu từ ${request.contractorName} đã bị từ chối${
          request.rejectionReason ? `: ${request.rejectionReason}` : ''
        }`;
    }
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return timestamp.toLocaleDateString('vi-VN');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900">Hoạt động gần đây</h3>
        <span className="ml-auto text-xs text-gray-500">24 giờ qua</span>
      </div>

      <div className="space-y-2">
        {recentActivities.map((activity) => (
          <div
            key={`${activity.id}-${activity.type}`}
            className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${getActivityColor(
              activity.type
            )}`}
          >
            <div className="flex-shrink-0 mt-0.5">{getActivityIcon(activity.type)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm text-gray-900">
                  {getActivityTitle(activity.type)}
                </span>
                <span className="text-xs text-gray-500">
                  #{activity.request.id.substring(0, 8)}
                </span>
              </div>
              <p className="text-sm text-gray-700 line-clamp-2">
                {getActivityMessage(activity)}
              </p>
            </div>
            <div className="flex-shrink-0 text-xs text-gray-500 mt-0.5">
              {getTimeAgo(activity.timestamp)}
            </div>
          </div>
        ))}
      </div>

      {recentActivities.length === 10 && (
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500">
            Chỉ hiển thị 10 hoạt động gần nhất
          </p>
        </div>
      )}
    </div>
  );
}
