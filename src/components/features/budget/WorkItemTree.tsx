'use client';

import { useState } from 'react';
import { WorkItemDto, WorkItemStatus, WorkItemStatusLabels } from '@/types/work-item.types';
import { getStatusColor } from './utils';

interface WorkItemTreeProps {
  items: WorkItemDto[];
  selectedItemId: string | null;
  highlightedItemId: string | null;
  onItemClick: (itemId: string) => void;
  onItemDoubleClick: (itemId: string) => void;
}

export function WorkItemTree({
  items,
  selectedItemId,
  highlightedItemId,
  onItemClick,
  onItemDoubleClick,
}: WorkItemTreeProps) {
  return (
    <div className="p-4">
      <div className="sticky top-0 bg-white z-10 pb-2 border-b border-gray-200 mb-2">
        <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-700">
          <div className="col-span-1">STT</div>
          <div className="col-span-4">Công việc</div>
          <div className="col-span-2">Người thực hiện</div>
          <div className="col-span-2">Trạng thái</div>
          <div className="col-span-1">Thời gian</div>
          <div className="col-span-2">Tiến độ</div>
        </div>
      </div>
      {items.map((item, index) => (
        <WorkItemTreeNode
          key={item.id}
          item={item}
          index={index + 1}
          selectedItemId={selectedItemId}
          highlightedItemId={highlightedItemId}
          onItemClick={onItemClick}
          onItemDoubleClick={onItemDoubleClick}
        />
      ))}
    </div>
  );
}

interface WorkItemTreeNodeProps {
  item: WorkItemDto;
  index: number;
  selectedItemId: string | null;
  highlightedItemId: string | null;
  onItemClick: (itemId: string) => void;
  onItemDoubleClick: (itemId: string) => void;
  level?: number;
}

const getStatusBadgeColor = (status: WorkItemStatus) => {
  switch (status) {
    case WorkItemStatus.NotStarted:
      return 'bg-gray-100 text-gray-800';
    case WorkItemStatus.InProgress:
      return 'bg-blue-100 text-blue-800';
    case WorkItemStatus.Completed:
      return 'bg-green-100 text-green-800';
    case WorkItemStatus.OnHold:
      return 'bg-orange-100 text-orange-800';
    case WorkItemStatus.Cancelled:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

function WorkItemTreeNode({
  item,
  index,
  selectedItemId,
  highlightedItemId,
  onItemClick,
  onItemDoubleClick,
  level = 0,
}: WorkItemTreeNodeProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  const isHighlighted = highlightedItemId === item.id;
  const isSelected = selectedItemId === item.id;

  const bgColor = isHighlighted
    ? 'bg-yellow-100 border-l-4 border-yellow-500'
    : isSelected
    ? 'bg-blue-50 border-l-4 border-blue-500'
    : item.status === WorkItemStatus.Completed
    ? 'bg-green-50'
    : item.status === WorkItemStatus.InProgress
    ? 'bg-blue-50'
    : item.status === WorkItemStatus.OnHold
    ? 'bg-orange-50'
    : 'bg-white hover:bg-gray-50';

  const formatDuration = (duration?: number) => {
    if (!duration) return '';
    return `${duration} ngày`;
  };

  return (
    <div id={`work-item-${item.id}`}>
      <div
        className={`grid grid-cols-12 gap-2 py-2 px-2 text-sm border-b border-gray-100 cursor-pointer transition-colors ${bgColor}`}
        onClick={() => onItemClick(item.id)}
        onDoubleClick={() => onItemDoubleClick(item.id)}
        style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
      >
        {/* STT Column */}
        <div className="col-span-1 flex items-center gap-1">
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsCollapsed(!isCollapsed);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              {isCollapsed ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>
          )}
          <span className="text-gray-600 font-mono text-xs">{item.workCode || index}</span>
        </div>

        {/* Work Name Column */}
        <div className="col-span-4 flex items-center">
          <span className={`${level > 0 ? 'text-gray-700' : 'font-semibold text-gray-900'}`}>
            {item.name}
          </span>
        </div>

        {/* Assigned Users Column */}
        <div className="col-span-2 flex items-center">
          {item.assignedUserIds && item.assignedUserIds.length > 0 ? (
            <div className="flex -space-x-2">
              {item.assignedUserIds.slice(0, 3).map((userId, i) => (
                <div
                  key={userId}
                  className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-700"
                  title={`User ${userId}`}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
              {item.assignedUserIds.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-gray-600">
                  +{item.assignedUserIds.length - 3}
                </div>
              )}
            </div>
          ) : (
            <span className="text-gray-400 text-xs">Chưa phân công</span>
          )}
        </div>

        {/* Status Column - Read only */}
        <div className="col-span-2 flex items-center">
          <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusBadgeColor(item.status)}`}>
            {WorkItemStatusLabels[item.status]}
          </span>
        </div>

        {/* Duration Column */}
        <div className="col-span-1 flex items-center text-gray-600 text-xs">
          {formatDuration(item.duration)}
        </div>

        {/* Progress Column - Read only */}
        <div className="col-span-2 flex items-center">
          {item.progress !== undefined && (
            <div className="w-full">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium">{item.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getStatusColor(item.status, item.progress).progressBar}`}
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Children */}
      {hasChildren && !isCollapsed && (
        <div>
          {item.children!.map((child, childIndex) => (
            <WorkItemTreeNode
              key={child.id}
              item={child}
              index={childIndex + 1}
              selectedItemId={selectedItemId}
              highlightedItemId={highlightedItemId}
              onItemClick={onItemClick}
              onItemDoubleClick={onItemDoubleClick}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
