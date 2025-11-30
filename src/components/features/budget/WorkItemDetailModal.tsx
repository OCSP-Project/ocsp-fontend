"use client";

import { useState, useEffect, useRef } from "react";
import { notification } from "antd";
import gsap from "gsap";
import {
  WorkItemDetailDto,
  WorkItemStatus,
  parseWorkItemStatus,
} from "@/types/work-item.types";
import {
  formatDate,
  formatDateTime,
  getStatusColor,
  formatCurrency,
} from "./utils";
import { StatusDropdown } from "./StatusDropdown";
import { ProgressInput } from "./ProgressInput";
import { workItemService } from "@/services";
import { CommentList } from "./comments/CommentList";
import { AssignedUsersDropdown } from "./AssignedUsersDropdown";

interface WorkItemDetailModalProps {
  workItem: WorkItemDetailDto;
  onClose: () => void;
  onUpdate?: () => void;
}

type TabType = "overview" | "budget" | "statistics" | "payments" | "activity";

export function WorkItemDetailModal({
  workItem,
  onClose,
  onUpdate,
}: WorkItemDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [currentWorkItem, setCurrentWorkItem] = useState<WorkItemDetailDto>(
    () => ({
      ...workItem,
      status: parseWorkItemStatus(workItem.status),
    })
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Sync state when workItem prop changes
  useEffect(() => {
    setCurrentWorkItem({
      ...workItem,
      status: parseWorkItemStatus(workItem.status),
    });
  }, [workItem]);

  // GSAP Animations on mount
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Overlay fade in
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
      );

      // Modal slide up and fade in
      gsap.fromTo(
        contentRef.current,
        { y: 50, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.4,
          ease: "power3.out",
          delay: 0.1,
        }
      );
    }, modalRef);

    return () => ctx.revert();
  }, []);

  const handleClose = () => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: onClose,
      });

      tl.to(contentRef.current, {
        y: 30,
        opacity: 0,
        scale: 0.95,
        duration: 0.3,
        ease: "power2.in",
      }).to(
        overlayRef.current,
        {
          opacity: 0,
          duration: 0.2,
          ease: "power2.in",
        },
        "<0.1"
      );
    }, modalRef);
  };

  const handleStatusChange = async (newStatus: WorkItemStatus) => {
    try {
      setIsUpdating(true);
      const statusMap: Record<WorkItemStatus, string> = {
        [WorkItemStatus.NotStarted]: "NotStarted",
        [WorkItemStatus.InProgress]: "InProgress",
        [WorkItemStatus.Completed]: "Completed",
        [WorkItemStatus.OnHold]: "Paused",
        [WorkItemStatus.Cancelled]: "Cancelled",
      };

      await workItemService.update(currentWorkItem.id, {
        status: statusMap[newStatus],
      });
      const updated = await workItemService.getById(currentWorkItem.id);
      setCurrentWorkItem({
        ...updated,
        status: parseWorkItemStatus(updated.status),
      });
      onUpdate?.();
    } catch (error: any) {
      console.error("Error updating status:", error);
      notification.error({
        message: "Lỗi",
        description:
          error?.response?.data?.message || "Không thể cập nhật trạng thái",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleProgressChange = async (newProgress: number) => {
    try {
      setIsUpdating(true);
      await workItemService.updateProgress(currentWorkItem.id, {
        progress: newProgress,
      });
      const updated = await workItemService.getById(currentWorkItem.id);
      setCurrentWorkItem(updated);
      onUpdate?.();
    } catch (error) {
      console.error("Error updating progress:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể cập nhật tiến độ",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssignedUsersChange = async (userIds: string[]) => {
    try {
      setIsUpdating(true);
      await workItemService.assignUsers(currentWorkItem.id, userIds);
      const updated = await workItemService.getById(currentWorkItem.id);
      setCurrentWorkItem(updated);
      onUpdate?.();
    } catch (error: any) {
      console.error("Error updating assigned users:", error);
      throw error; // Throw to let the dropdown handle the error
    } finally {
      setIsUpdating(false);
    }
  };

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const statusColors = getStatusColor(
    typeof currentWorkItem.status === "string"
      ? parseWorkItemStatus(currentWorkItem.status)
      : currentWorkItem.status,
    currentWorkItem.progress
  );

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: "overview", label: "Tổng quan", icon: "📊" },
    { id: "budget", label: "Dự trù", icon: "💰" },
    { id: "statistics", label: "Thống kê", icon: "📈" },
    { id: "payments", label: "Thu chi", icon: "💳" },
    { id: "activity", label: "Nhật ký", icon: "📝" },
  ];

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div
        ref={contentRef}
        className="relative w-full max-w-7xl h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200"
      >
        {/* Header */}
        <div className="flex-shrink-0 px-6 sm:px-8 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-start sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 line-clamp-2">
                {currentWorkItem.name}
              </h2>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${statusColors.bg} text-white shadow-lg`}
                >
                  {statusColors.label}
                </span>
                {currentWorkItem.code && (
                  <span className="px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-700 border border-blue-200">
                    {currentWorkItem.code}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={handleClose}
              className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
            >
              <svg
                className="w-6 h-6 text-gray-600 group-hover:text-gray-900 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex-shrink-0 flex overflow-x-auto border-b border-gray-200 bg-gray-50 px-4 sm:px-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 font-medium text-sm transition-all duration-200 border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600 bg-blue-50"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {activeTab === "overview" && (
            <OverviewTab
              workItem={currentWorkItem}
              onStatusChange={handleStatusChange}
              onProgressChange={handleProgressChange}
              onAssignedUsersChange={handleAssignedUsersChange}
              isUpdating={isUpdating}
            />
          )}
          {activeTab === "budget" && <BudgetTab workItem={currentWorkItem} />}
          {activeTab === "statistics" && (
            <StatisticsTab workItem={currentWorkItem} />
          )}
          {activeTab === "payments" && (
            <PaymentsTab workItem={currentWorkItem} />
          )}
          {activeTab === "activity" && (
            <ActivityTab workItem={currentWorkItem} />
          )}
        </div>
      </div>
    </div>
  );
}

interface OverviewTabProps {
  workItem: WorkItemDetailDto;
  onStatusChange?: (newStatus: WorkItemStatus) => void;
  onProgressChange?: (newProgress: number) => void;
  onAssignedUsersChange?: (userIds: string[]) => Promise<void>;
  isUpdating?: boolean;
}

function getCurrentUser(): {
  id: string;
  fullName: string;
  avatar?: string;
} | null {
  if (typeof window === "undefined") return null;
  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
    return null;
  }
}

function OverviewTab({
  workItem,
  onStatusChange,
  onProgressChange,
  onAssignedUsersChange,
  isUpdating = false,
}: OverviewTabProps) {
  const calculateDuration = () => {
    if (!workItem.startDate || !workItem.endDate) return 0;
    const start = new Date(workItem.startDate);
    const end = new Date(workItem.endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <InfoCard label="Dự án" value={workItem.projectName || "N/A"} />
          <InfoCard
            label="Giai đoạn"
            value={workItem.phase || workItem.type || "San nền"}
          />
          <InfoCard
            label="Chế độ"
            value={workItem.mode || "Nội bộ"}
            valueClass="text-green-600"
          />
          <InfoCard
            label="Thời gian"
            value={`${calculateDuration()} ngày`}
            badge
          />
          <InfoCard
            label="Ngày bắt đầu"
            value={formatDate(workItem.startDate)}
            badge
            badgeColor="blue"
          />
          <InfoCard
            label="Ngày kết thúc"
            value={formatDate(workItem.endDate)}
            badge
            badgeColor="pink"
          />

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Trạng thái
            </label>
            {onStatusChange ? (
              <StatusDropdown
                currentStatus={
                  typeof workItem.status === "string"
                    ? parseWorkItemStatus(workItem.status)
                    : workItem.status
                }
                onStatusChange={onStatusChange}
                disabled={isUpdating}
              />
            ) : (
              <span
                className={`inline-block px-3 py-1.5 rounded-lg text-sm font-medium text-white ${
                  getStatusColor(
                    typeof workItem.status === "string"
                      ? parseWorkItemStatus(workItem.status)
                      : workItem.status,
                    workItem.progress
                  ).bg
                }`}
              >
                {
                  getStatusColor(
                    typeof workItem.status === "string"
                      ? parseWorkItemStatus(workItem.status)
                      : workItem.status,
                    workItem.progress
                  ).label
                }
              </span>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Tiến độ
            </label>
            {onProgressChange ? (
              <div className="max-w-[200px]">
                <ProgressInput
                  currentProgress={workItem.progress || 0}
                  status={
                    typeof workItem.status === "string"
                      ? parseWorkItemStatus(workItem.status)
                      : workItem.status
                  }
                  onProgressChange={onProgressChange}
                  disabled={isUpdating}
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${workItem.progress ?? 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {workItem.progress ?? 0}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overdue Warning */}
      {workItem.endDate &&
        new Date(workItem.endDate) < new Date() &&
        (workItem.progress ?? 0) < 100 && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-red-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-red-600 font-semibold">
                Quá hạn{" "}
                {Math.ceil(
                  (new Date().getTime() -
                    new Date(workItem.endDate).getTime()) /
                    (1000 * 60 * 60 * 24)
                )}{" "}
                ngày
              </span>
            </div>
          </div>
        )}

      {/* Quantity Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
          <span className="text-xl">📊</span>
          Khối lượng công việc
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <InfoCard label="Đơn vị" value={workItem.unit || "N/A"} />
          <InfoCard
            label="Khối lượng kế hoạch"
            value={`${workItem.plannedQuantity?.toLocaleString() || "0"}${
              workItem.unit ? ` ${workItem.unit}` : ""
            }`}
            valueClass="text-blue-600"
          />
          <InfoCard
            label="Khối lượng thực tế"
            value={`${workItem.actualQuantity?.toLocaleString() || "0"}${
              workItem.unit ? ` ${workItem.unit}` : ""
            }`}
            valueClass="text-green-600"
          />
        </div>
        {workItem.description && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Mô tả công việc
            </label>
            <p className="text-gray-700 leading-relaxed">
              {workItem.description}
            </p>
          </div>
        )}
      </div>

      {/* Assigned Users */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
          <span className="text-xl">👥</span>
          Người thực hiện
        </h3>
        {onAssignedUsersChange ? (
          <AssignedUsersDropdown
            workItemId={workItem.id}
            projectId={workItem.projectId}
            currentUsers={workItem.assignedUsers || []}
            onUsersChange={onAssignedUsersChange}
            disabled={isUpdating}
          />
        ) : workItem.assignedUsers && workItem.assignedUsers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {workItem.assignedUsers.map((user) => (
              <UserCard key={user.id} user={user} color="blue" />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Chưa có người thực hiện</p>
        )}
      </div>

      {/* Người giao việc */}
      {workItem.createdBy && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
            <span className="text-xl">📋</span>
            Thông tin giao việc
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoCard
              label="Người giao"
              value={
                workItem.createdBy.fullName ||
                workItem.createdBy.username ||
                "N/A"
              }
            />
            <InfoCard
              label="Ngày giao"
              value={formatDateTime(workItem.createdAt)}
            />
          </div>
        </div>
      )}

      {/* Documents */}
      {workItem.documents && workItem.documents.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
            <span className="text-xl">📎</span>
            Tài liệu
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {workItem.documents.map((doc) => (
              <a
                key={doc.id}
                href={doc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 hover:border-blue-400 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <svg
                    className="w-5 h-5 text-gray-600 group-hover:text-blue-600 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate group-hover:text-gray-900">
                      {doc.fileName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(doc.fileSize / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <svg
                  className="w-5 h-5 text-gray-500 group-hover:text-blue-600 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Comments */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <CommentList
          workItemId={workItem.id}
          currentUserId={getCurrentUser()?.id}
          currentUserName={getCurrentUser()?.fullName}
          currentUserAvatar={getCurrentUser()?.avatar}
          projectId={workItem.projectId}
        />
      </div>
    </div>
  );
}

// Helper Components
interface InfoCardProps {
  label: string;
  value: string;
  valueClass?: string;
  badge?: boolean;
  badgeColor?: "gray" | "blue" | "pink";
}

function InfoCard({
  label,
  value,
  valueClass = "text-gray-900",
  badge = false,
  badgeColor = "gray",
}: InfoCardProps) {
  const badgeColors: Record<"gray" | "blue" | "pink", string> = {
    gray: "bg-gray-100 text-gray-700",
    blue: "bg-blue-50 text-blue-700 border border-blue-200",
    pink: "bg-pink-50 text-pink-700 border border-pink-200",
  };

  return (
    <div>
      <label className="text-sm font-medium text-gray-700 block mb-2">
        {label}
      </label>
      {badge ? (
        <span
          className={`inline-block px-3 py-1.5 rounded-lg text-sm font-medium ${badgeColors[badgeColor]}`}
        >
          {value}
        </span>
      ) : (
        <p className={`text-base font-semibold ${valueClass}`}>{value}</p>
      )}
    </div>
  );
}

interface UserCardProps {
  user: {
    id: string;
    fullName: string;
    email?: string;
    username?: string;
  };
  color?: "blue" | "green" | "purple";
}

function UserCard({ user, color = "blue" }: UserCardProps) {
  const colors: Record<"blue" | "green" | "purple", string> = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200">
      <div
        className={`w-10 h-10 rounded-full bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white font-medium flex-shrink-0`}
      >
        {user.fullName?.charAt(0).toUpperCase() || "U"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-800 truncate">{user.fullName}</p>
        <p className="text-sm text-gray-600 truncate">
          {user.email || user.username}
        </p>
      </div>
    </div>
  );
}

function BudgetTab({ workItem }: { workItem: WorkItemDetailDto }) {
  const totalBudget =
    workItem.budgets?.reduce((sum, b) => sum + b.totalAmount, 0) || 0;
  const totalActual =
    workItem.budgets?.reduce((sum, b) => sum + (b.actualAmount || 0), 0) || 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h4 className="text-sm text-blue-700 mb-2">Dự toán</h4>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(totalBudget)}
          </p>
        </div>
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <h4 className="text-sm text-green-700 mb-2">Thực tế</h4>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(totalActual)}
          </p>
        </div>
        <div
          className={`rounded-xl p-6 border ${
            totalBudget - totalActual >= 0
              ? "bg-emerald-50 border-emerald-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <h4
            className={`text-sm mb-2 ${
              totalBudget - totalActual >= 0
                ? "text-emerald-700"
                : "text-red-700"
            }`}
          >
            Chênh lệch
          </h4>
          <p
            className={`text-2xl font-bold ${
              totalBudget - totalActual >= 0
                ? "text-emerald-600"
                : "text-red-600"
            }`}
          >
            {formatCurrency(totalBudget - totalActual)}
          </p>
        </div>
      </div>

      {/* Budget Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Hạng mục
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Loại
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Số lượng
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Đơn giá
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Thành tiền
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Thực tế
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {workItem.budgets?.map((budget) => (
                <tr
                  key={budget.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-800">
                      {budget.category}
                    </div>
                    {budget.description && (
                      <div className="text-sm text-gray-600">
                        {budget.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {budget.budgetType}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 text-right whitespace-nowrap">
                    {budget.quantity} {budget.unit}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 text-right whitespace-nowrap">
                    {formatCurrency(budget.unitPrice)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right whitespace-nowrap">
                    {formatCurrency(budget.totalAmount)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 text-right whitespace-nowrap">
                    {budget.actualAmount
                      ? formatCurrency(budget.actualAmount)
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatisticsTab({ workItem }: { workItem: WorkItemDetailDto }) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 text-center">
        <div className="text-6xl mb-4">📊</div>
        <p className="text-gray-600 text-lg">
          Chức năng thống kê đang được phát triển
        </p>
      </div>
    </div>
  );
}

function PaymentsTab({ workItem }: { workItem: WorkItemDetailDto }) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 text-center">
        <div className="text-6xl mb-4">💳</div>
        <p className="text-gray-600 text-lg">
          Chức năng thu chi đang được phát triển
        </p>
      </div>
    </div>
  );
}

function ActivityTab({ workItem }: { workItem: WorkItemDetailDto }) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-6 text-gray-900 flex items-center gap-2">
          <span className="text-xl">📝</span>
          Lịch sử hoạt động
        </h3>
        {workItem.activities && workItem.activities.length > 0 ? (
          <div className="space-y-4">
            {workItem.activities.map((activity) => (
              <div
                key={activity.id}
                className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-500 rounded-full" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-800">
                      {activity.performedByName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDateTime(activity.performedAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">
                    {activity.description}
                  </p>
                  <span className="inline-block mt-2 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                    {activity.activityType}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            Chưa có hoạt động nào
          </p>
        )}
      </div>
    </div>
  );
}
