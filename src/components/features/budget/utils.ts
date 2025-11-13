// src/components/features/budget/utils.ts
import { WorkItemStatus } from '@/types/work-item.types';

export function getStatusColor(status: WorkItemStatus, progress?: number) {
  const now = new Date();

  // Completed - Green
  if (status === WorkItemStatus.Completed || progress === 100) {
    return {
      bg: 'bg-green-500',
      text: 'text-green-700',
      border: 'border-green-500',
      progressBar: 'bg-green-500',
      label: 'Hoàn thành',
    };
  }

  // In Progress - Blue
  if (status === WorkItemStatus.InProgress) {
    return {
      bg: 'bg-blue-500',
      text: 'text-blue-700',
      border: 'border-blue-500',
      progressBar: 'bg-blue-500',
      label: 'Đang thực hiện',
    };
  }

  // On Hold - Orange
  if (status === WorkItemStatus.OnHold) {
    return {
      bg: 'bg-orange-500',
      text: 'text-orange-700',
      border: 'border-orange-500',
      progressBar: 'bg-orange-500',
      label: 'Tạm dừng',
    };
  }

  // Cancelled - Gray
  if (status === WorkItemStatus.Cancelled) {
    return {
      bg: 'bg-gray-500',
      text: 'text-gray-700',
      border: 'border-gray-500',
      progressBar: 'bg-gray-500',
      label: 'Đã hủy',
    };
  }

  // Not Started - Gray
  return {
    bg: 'bg-gray-400',
    text: 'text-gray-700',
    border: 'border-gray-400',
    progressBar: 'bg-gray-400',
    label: 'Chưa bắt đầu',
  };
}

export function isOverdue(endDate?: string, status?: WorkItemStatus): boolean {
  if (!endDate || status === WorkItemStatus.Completed) return false;
  const end = new Date(endDate);
  const now = new Date();
  return end < now;
}

export function getTimelineBarColor(status: WorkItemStatus, endDate?: string, progress?: number) {
  // Check if overdue first
  if (isOverdue(endDate, status)) {
    return 'bg-red-500'; // Red for overdue
  }

  // Then check status
  if (status === WorkItemStatus.Completed || progress === 100) {
    return 'bg-green-500'; // Green for completed
  }

  if (status === WorkItemStatus.InProgress) {
    return 'bg-blue-500'; // Blue for in progress
  }

  return 'bg-gray-400'; // Gray for not started
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTime(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function calculateDuration(startDate?: string, endDate?: string): number {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

export function downloadFile(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
