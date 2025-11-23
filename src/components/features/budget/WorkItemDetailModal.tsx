'use client';

import { useState, useEffect } from 'react';
import { WorkItemDetailDto, WorkItemStatus, parseWorkItemStatus } from '@/types/work-item.types';
import { formatDate, formatDateTime, getStatusColor, formatCurrency } from './utils';
import { StatusDropdown } from './StatusDropdown';
import { ProgressInput } from './ProgressInput';
import { workItemService } from '@/services';

interface WorkItemDetailModalProps {
  workItem: WorkItemDetailDto;
  onClose: () => void;
  onUpdate?: () => void;
}

type TabType = 'overview' | 'budget' | 'statistics' | 'payments' | 'activity';

export function WorkItemDetailModal({ workItem, onClose, onUpdate }: WorkItemDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [currentWorkItem, setCurrentWorkItem] = useState<WorkItemDetailDto>(() => ({
    ...workItem,
    status: parseWorkItemStatus(workItem.status)
  }));
  const [isUpdating, setIsUpdating] = useState(false);

  // Sync state when workItem prop changes
  useEffect(() => {
    setCurrentWorkItem({
      ...workItem,
      status: parseWorkItemStatus(workItem.status)
    });
  }, [workItem]);

  const handleStatusChange = async (newStatus: WorkItemStatus) => {
    try {
      setIsUpdating(true);
      console.log('Updating status to:', newStatus);
      console.log('Work item ID:', currentWorkItem.id);

      // Convert frontend enum to backend enum string
      const statusMap: Record<WorkItemStatus, string> = {
        [WorkItemStatus.NotStarted]: 'NotStarted',
        [WorkItemStatus.InProgress]: 'InProgress',
        [WorkItemStatus.Completed]: 'Completed',
        [WorkItemStatus.OnHold]: 'Paused',     // Frontend OnHold -> Backend Paused
        [WorkItemStatus.Cancelled]: 'Cancelled',
      };

      const updateData = { status: statusMap[newStatus] };
      console.log('Update data:', updateData);

      console.log('Step 1: Calling update API...');
      const updateResult = await workItemService.update(currentWorkItem.id, updateData);
      console.log('Step 1 complete. Update result:', updateResult);

      console.log('Step 2: Reloading work item details...');
      const updated = await workItemService.getById(currentWorkItem.id);
      console.log('Step 2 complete. Updated work item:', updated);
      console.log('Updated status:', updated.status);
      console.log('Updated status type:', typeof updated.status);

      // Convert status string to enum number
      const normalizedStatus = parseWorkItemStatus(updated.status);
      console.log('Normalized status:', normalizedStatus);
      const normalizedWorkItem = { ...updated, status: normalizedStatus };

      console.log('Step 3: Setting current work item state...');
      setCurrentWorkItem(normalizedWorkItem);
      console.log('Step 3 complete');

      console.log('Step 4: Calling onUpdate callback...');
      onUpdate?.();
      console.log('Step 4 complete');
    } catch (error: any) {
      console.error('Error updating status:', error);
      console.error('Error response:', error?.response?.data);
      const errorMessage = error?.response?.data?.message || error?.response?.data?.title || 'Không thể cập nhật trạng thái';
      alert(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleProgressChange = async (newProgress: number) => {
    try {
      setIsUpdating(true);
      await workItemService.updateProgress(currentWorkItem.id, { progress: newProgress });
      // Reload work item details
      const updated = await workItemService.getById(currentWorkItem.id);
      setCurrentWorkItem(updated);
      onUpdate?.();
    } catch (error) {
      console.error('Error updating progress:', error);
      alert('Không thể cập nhật tiến độ');
    } finally {
      setIsUpdating(false);
    }
  };

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const statusColors = getStatusColor(currentWorkItem.status, currentWorkItem.progress);

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'overview', label: 'Tổng quan', icon: '📊' },
    { id: 'budget', label: 'Dự trù', icon: '💰' },
    { id: 'statistics', label: 'Thống kê', icon: '📈' },
    { id: 'payments', label: 'Thu chi', icon: '💳' },
    { id: 'activity', label: 'Nhật ký thi công', icon: '📝' },
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-full h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900">{currentWorkItem.name}</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors.bg} text-white`}>
              {statusColors.label}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-white px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {activeTab === 'overview' && (
            <OverviewTab
              workItem={currentWorkItem}
              onStatusChange={handleStatusChange}
              onProgressChange={handleProgressChange}
              isUpdating={isUpdating}
            />
          )}
          {activeTab === 'budget' && <BudgetTab workItem={currentWorkItem} />}
          {activeTab === 'statistics' && <StatisticsTab workItem={currentWorkItem} />}
          {activeTab === 'payments' && <PaymentsTab workItem={currentWorkItem} />}
          {activeTab === 'activity' && <ActivityTab workItem={currentWorkItem} />}
        </div>
      </div>
    </div>
  );
}

interface OverviewTabProps {
  workItem: WorkItemDetailDto;
  onStatusChange?: (newStatus: WorkItemStatus) => void;
  onProgressChange?: (newProgress: number) => void;
  isUpdating?: boolean;
}

function OverviewTab({ workItem, onStatusChange, onProgressChange, isUpdating = false }: OverviewTabProps) {
  const calculateDuration = () => {
    if (!workItem.startDate || !workItem.endDate) return 0;
    const start = new Date(workItem.startDate);
    const end = new Date(workItem.endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="max-w-6xl space-y-6">
      {/* Header Info Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-4 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-600">Mã số</label>
            <p className="mt-1 text-blue-600 font-medium">{workItem.code || 'Chưa có mã số'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Dự án</label>
            <p className="mt-1 font-medium">{workItem.projectName || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Giai đoạn</label>
            <p className="mt-1 font-medium">{workItem.phase || workItem.type || 'San nền'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Công việc</label>
            <p className="mt-1 font-medium">{workItem.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Chế độ</label>
            <p className="mt-1 font-medium text-green-600">{workItem.mode || 'Nội bộ'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Thời gian</label>
            <p className="mt-1 px-3 py-1 bg-gray-100 rounded inline-block">{calculateDuration()} ngày</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Ngày bắt đầu</label>
            <p className="mt-1 px-3 py-1 bg-blue-100 text-blue-700 rounded inline-block">{formatDate(workItem.startDate)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Ngày kết thúc</label>
            <p className="mt-1 px-3 py-1 bg-pink-100 text-pink-700 rounded inline-block">{formatDate(workItem.endDate)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-2">Trạng thái</label>
            {onStatusChange ? (
              <StatusDropdown
                currentStatus={workItem.status}
                onStatusChange={onStatusChange}
                disabled={isUpdating}
              />
            ) : (
              <p className={`px-3 py-1 rounded inline-block text-white ${getStatusColor(workItem.status, workItem.progress).bg}`}>
                {getStatusColor(workItem.status, workItem.progress).label}
              </p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-2">Tiến độ</label>
            {onProgressChange ? (
              <div className="max-w-[200px]">
                <ProgressInput
                  currentProgress={workItem.progress || 0}
                  status={workItem.status}
                  onProgressChange={onProgressChange}
                  disabled={isUpdating}
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full bg-green-500`}
                    style={{ width: `${workItem.progress || 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{workItem.progress || 0}%</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overdue Warning */}
      {workItem.endDate && new Date(workItem.endDate) < new Date() && workItem.progress < 100 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-center gap-2">
            <span className="text-red-600 font-semibold">Quá hạn {Math.ceil((new Date().getTime() - new Date(workItem.endDate).getTime()) / (1000 * 60 * 60 * 24))} ngày</span>
          </div>
        </div>
      )}

      {/* Quantity Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Khối lượng công việc</h3>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-600">Đơn vị</label>
            <p className="mt-1 font-medium text-lg">{workItem.unit || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Khối lượng kế hoạch</label>
            <p className="mt-1 font-medium text-lg text-blue-600">
              {workItem.plannedQuantity ? workItem.plannedQuantity.toLocaleString() : '0'}
              {workItem.unit && ` ${workItem.unit}`}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Khối lượng thực tế</label>
            <p className="mt-1 font-medium text-lg text-green-600">
              {workItem.actualQuantity ? workItem.actualQuantity.toLocaleString() : '0'}
              {workItem.unit && ` ${workItem.unit}`}
            </p>
          </div>
        </div>
        {workItem.description && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <label className="text-sm font-medium text-gray-600">Mô tả công việc</label>
            <p className="mt-1 text-gray-700">{workItem.description}</p>
          </div>
        )}
      </div>

      {/* Three-column layout for lists */}
      <div className="grid grid-cols-3 gap-6">
        {/* Assigned Users */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Danh sách người thực hiện</h3>
          {workItem.assignedUsers && workItem.assignedUsers.length > 0 ? (
            <div className="space-y-3">
              {workItem.assignedUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                    {user.fullName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-medium">{user.fullName}</p>
                    <p className="text-sm text-gray-600">{user.email || user.username}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Chưa có người thực hiện</p>
          )}
        </div>

        {/* Followers */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Danh sách người theo dõi</h3>
          {workItem.followers && workItem.followers.length > 0 ? (
            <div className="space-y-3">
              {workItem.followers.map((user: any) => (
                <div key={user.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-medium">
                    {user.fullName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-medium">{user.fullName}</p>
                    <p className="text-sm text-gray-600">{user.email || user.username}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Không có người theo dõi</p>
          )}
        </div>

        {/* Coordinator (CDT) */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Người phối hợp (CDT)</h3>
          {workItem.coordinator ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-medium">
                {workItem.coordinator.fullName?.charAt(0).toUpperCase() || 'C'}
              </div>
              <div>
                <p className="font-medium">{workItem.coordinator.fullName}</p>
                <p className="text-sm text-gray-600">{workItem.coordinator.email || workItem.coordinator.username}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Không nhắc</p>
          )}
        </div>
      </div>

      {/* Assigner Info and Reminder Schedule */}
      <div className="grid grid-cols-2 gap-6">
        {/* Assigner Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Thông tin người giao việc</h3>
          {workItem.createdBy ? (
            <div>
              <div className="mb-3">
                <label className="text-sm text-gray-600">Người giao:</label>
                <p className="font-medium">{workItem.createdBy.fullName || workItem.createdBy.username || 'Ngô Doãn Tuấn'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Ngày giao:</label>
                <p className="font-medium">{formatDateTime(workItem.createdAt)}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Không có thông tin</p>
          )}
        </div>

        {/* Reminder Schedule */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Lịch nhắc việc</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-600">Thực hiện:</label>
              <p className="font-medium">{workItem.reminderSchedule?.execution || 'Không nhắc'}</p>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-600">Hạn hoàn thành:</label>
              <p className="font-medium">{workItem.reminderSchedule?.deadline || 'Nhắc tự động'}</p>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-600">Người nhắc:</label>
              <p className="font-medium">{workItem.reminderSchedule?.reminders || 'Người thực hiện'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Viewers List */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Danh sách người đã xem</h3>
        {workItem.viewers && workItem.viewers.length > 0 ? (
          <div className="flex gap-2 flex-wrap">
            {workItem.viewers.map((user: any) => (
              <div key={user.id} className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
                <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white text-xs font-medium">
                  {user.fullName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="text-sm">{user.fullName}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Chưa có người xem</p>
        )}
      </div>

      {/* Documents */}
      {workItem.documents && workItem.documents.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Tài liệu</h3>
          <div className="space-y-2">
            {workItem.documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <p className="font-medium">{doc.fileName}</p>
                    <p className="text-xs text-gray-500">{(doc.fileSize / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                >
                  Xem
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comments */}
      {workItem.comments && workItem.comments.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Trao đổi</h3>
          <div className="space-y-4">
            {workItem.comments.map((comment) => (
              <div key={comment.id} className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{comment.createdByName}</span>
                  <span className="text-xs text-gray-500">{formatDateTime(comment.createdAt)}</span>
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BudgetTab({ workItem }: { workItem: WorkItemDetailDto }) {
  const totalBudget = workItem.budgets?.reduce((sum, b) => sum + b.totalAmount, 0) || 0;
  const totalActual = workItem.budgets?.reduce((sum, b) => sum + (b.actualAmount || 0), 0) || 0;

  return (
    <div className="max-w-6xl space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-sm text-gray-600 mb-2">Dự toán</h4>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalBudget)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-sm text-gray-600 mb-2">Thực tế</h4>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalActual)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-sm text-gray-600 mb-2">Chênh lệch</h4>
          <p className={`text-2xl font-bold ${totalBudget - totalActual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(totalBudget - totalActual)}
          </p>
        </div>
      </div>

      {/* Budget Details */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hạng mục</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Số lượng</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Đơn giá</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thành tiền</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thực tế</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {workItem.budgets?.map((budget) => (
              <tr key={budget.id}>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{budget.category}</div>
                  {budget.description && <div className="text-sm text-gray-500">{budget.description}</div>}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{budget.budgetType}</td>
                <td className="px-6 py-4 text-sm text-gray-900 text-right">
                  {budget.quantity} {budget.unit}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 text-right">{formatCurrency(budget.unitPrice)}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                  {formatCurrency(budget.totalAmount)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 text-right">
                  {budget.actualAmount ? formatCurrency(budget.actualAmount) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatisticsTab({ workItem }: { workItem: WorkItemDetailDto }) {
  return (
    <div className="max-w-4xl">
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">Chức năng thống kê đang được phát triển</p>
      </div>
    </div>
  );
}

function PaymentsTab({ workItem }: { workItem: WorkItemDetailDto }) {
  return (
    <div className="max-w-4xl">
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">Chức năng thu chi đang được phát triển</p>
      </div>
    </div>
  );
}

function ActivityTab({ workItem }: { workItem: WorkItemDetailDto }) {
  return (
    <div className="max-w-4xl">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Lịch sử hoạt động</h3>
        {workItem.activities && workItem.activities.length > 0 ? (
          <div className="space-y-4">
            {workItem.activities.map((activity) => (
              <div key={activity.id} className="flex gap-4">
                <div className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-500 rounded-full" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{activity.performedByName}</span>
                    <span className="text-xs text-gray-500">{formatDateTime(activity.performedAt)}</span>
                  </div>
                  <p className="text-sm text-gray-700">{activity.description}</p>
                  <span className="inline-block mt-1 px-2 py-1 text-xs bg-gray-100 rounded">{activity.activityType}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Chưa có hoạt động nào</p>
        )}
      </div>
    </div>
  );
}
