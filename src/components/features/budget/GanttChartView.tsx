'use client';

import { useState, useEffect } from 'react';
import { workItemService } from '@/services';
import { WorkItemDto, WorkItemDetailDto, GanttChartDataDto } from '@/types/work-item.types';
import { WorkItemTree } from './WorkItemTree';
import { GanttTimeline } from './GanttTimeline';

interface GanttChartViewProps {
  projectId: string;
  onWorkItemSelect: (workItem: WorkItemDetailDto) => void;
  refreshTrigger?: number;
}

export function GanttChartView({ projectId, onWorkItemSelect, refreshTrigger }: GanttChartViewProps) {
  const [ganttData, setGanttData] = useState<GanttChartDataDto | null>(null);
  const [workItems, setWorkItems] = useState<WorkItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [projectId, refreshTrigger]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load both tree structure and gantt data in parallel
      const [treeData, ganttChartData] = await Promise.all([
        workItemService.getTreeByProject(projectId),
        workItemService.getGanttChartData(projectId),
      ]);

      console.log('Tree data from API:', treeData);
      console.log('Tree data count:', treeData.length);

      // Debug: Check for duplicates by ID
      const allIds = new Set();
      const duplicateIds = new Set();
      const countIds = (items: WorkItemDto[]) => {
        items.forEach(item => {
          if (allIds.has(item.id)) {
            duplicateIds.add(item.id);
            console.log('DUPLICATE FOUND:', item.id, item.name);
          }
          allIds.add(item.id);
          if (item.children && item.children.length > 0) {
            countIds(item.children);
          }
        });
      };
      countIds(treeData);
      console.log('Total unique IDs:', allIds.size);
      console.log('Duplicate IDs:', Array.from(duplicateIds));

      setWorkItems(treeData);
      setGanttData(ganttChartData);
    } catch (err: any) {
      console.error('Error loading Gantt data:', err);
      setError(err.response?.data?.message || 'Không thể tải dữ liệu dự toán');
    } finally {
      setLoading(false);
    }
  };

  const handleWorkItemDoubleClick = async (workItemId: string) => {
    try {
      const detail = await workItemService.getById(workItemId);
      onWorkItemSelect(detail);
    } catch (err: any) {
      console.error('Error loading work item detail:', err);
    }
  };

  const handleTimelineItemClick = (workItemId: string) => {
    setHighlightedItemId(workItemId);
    setSelectedItemId(workItemId);

    // Scroll to the item in the tree
    const element = document.getElementById(`work-item-${workItemId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleTreeItemClick = (workItemId: string) => {
    setSelectedItemId(workItemId);
    setHighlightedItemId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-red-600 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-900 font-medium">{error}</p>
          <button
            onClick={loadData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!ganttData || workItems.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-600">Chưa có dữ liệu dự toán</p>
          <p className="text-sm text-gray-500 mt-1">Vui lòng import file Excel để bắt đầu</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Left Panel - Work Item Tree */}
      <div className="w-2/5 border-r border-gray-200 bg-white overflow-auto">
        <WorkItemTree
          items={workItems}
          selectedItemId={selectedItemId}
          highlightedItemId={highlightedItemId}
          onItemClick={handleTreeItemClick}
          onItemDoubleClick={handleWorkItemDoubleClick}
        />
      </div>

      {/* Right Panel - Timeline */}
      <div className="flex-1 bg-gray-50 overflow-auto">
        <GanttTimeline
          data={ganttData}
          selectedItemId={selectedItemId}
          onItemClick={handleTimelineItemClick}
        />
      </div>
    </div>
  );
}
