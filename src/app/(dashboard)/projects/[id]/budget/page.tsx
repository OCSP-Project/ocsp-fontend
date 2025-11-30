"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { notification, Modal } from "antd";
import { GanttChartView } from "@/components/features/budget/GanttChartView";
import { WorkItemDetailModal } from "@/components/features/budget/WorkItemDetailModal";
import { ImportExcelDialog } from "@/components/features/budget/ImportExcelDialog";
import { WorkItemDetailDto } from "@/types/work-item.types";
import { workItemService } from "@/services";

export default function BudgetPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [selectedWorkItem, setSelectedWorkItem] =
    useState<WorkItemDetailDto | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleWorkItemSelect = (workItem: WorkItemDetailDto) => {
    setSelectedWorkItem(workItem);
  };

  const handleCloseDetail = () => {
    setSelectedWorkItem(null);
  };

  const handleWorkItemUpdate = async () => {
    // Refresh the list
    setRefreshTrigger((prev) => prev + 1);

    // Also reload the selected work item to update modal
    if (selectedWorkItem) {
      try {
        const updated = await workItemService.getById(selectedWorkItem.id);
        setSelectedWorkItem(updated);
      } catch (error) {
        console.error("Error reloading work item:", error);
      }
    }
  };

  const handleImportSuccess = () => {
    setShowImportDialog(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleExport = async () => {
    try {
      const blob = await workItemService.exportToExcel(projectId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `WorkItems_${projectId}_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting Excel:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể xuất file Excel",
      });
    }
  };

  const handleDeleteAll = async () => {
    Modal.confirm({
      title: "Xác nhận xóa vĩnh viễn",
      content:
        "Bạn có chắc chắn muốn xóa VĨNH VIỄN tất cả dữ liệu đã import? Hành động này không thể hoàn tác!\n\nToàn bộ work items, trạng thái, lịch sử cập nhật sẽ bị xóa khỏi database.",
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          // Hard delete all work items for this project
          await workItemService.hardDeleteAllByProject(projectId);

          notification.success({
            message: "Thành công",
            description: "Đã xóa vĩnh viễn tất cả dữ liệu thành công",
          });
          setRefreshTrigger((prev) => prev + 1);
        } catch (error) {
          console.error("Error deleting work items:", error);
          notification.error({
            message: "Lỗi",
            description: "Không thể xóa dữ liệu",
          });
        }
      },
    });
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Dự toán & Tiến độ
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Quản lý dự toán và sơ đồ Gantt
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowImportDialog(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              Tải lên Excel
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Xuất Excel
            </button>
            <button
              onClick={handleDeleteAll}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Xóa tất cả
            </button>
          </div>
        </div>
      </div>

      {/* Gantt Chart View */}
      <div className="flex-1 overflow-hidden">
        <GanttChartView
          projectId={projectId}
          onWorkItemSelect={handleWorkItemSelect}
          refreshTrigger={refreshTrigger}
        />
      </div>

      {/* Work Item Detail Modal */}
      {selectedWorkItem && (
        <WorkItemDetailModal
          workItem={selectedWorkItem}
          onClose={handleCloseDetail}
          onUpdate={handleWorkItemUpdate}
        />
      )}

      {/* Import Excel Dialog */}
      {showImportDialog && (
        <ImportExcelDialog
          projectId={projectId}
          onClose={() => setShowImportDialog(false)}
          onSuccess={handleImportSuccess}
        />
      )}
    </div>
  );
}
