'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { Bell } from 'lucide-react';
import { MaterialRequestDto, MaterialRequestStatus } from '@/types/material.types';
import { materialNotificationHelper, MaterialNotification } from '@/utils/materialNotifications';
import { useAuth } from '@/hooks/useAuth';

type Notification = MaterialNotification;

export function MaterialNotificationDropdown() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load notifications
  useEffect(() => {
    if (user) {
      loadNotifications();

      // Listen for notification events
      const handleNotificationAdded = () => loadNotifications();
      const handleNotificationUpdated = () => loadNotifications();

      window.addEventListener('materialNotificationAdded', handleNotificationAdded);
      window.addEventListener('materialNotificationUpdated', handleNotificationUpdated);

      return () => {
        window.removeEventListener('materialNotificationAdded', handleNotificationAdded);
        window.removeEventListener('materialNotificationUpdated', handleNotificationUpdated);
      };
    }
  }, [user]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = () => {
    try {
      setLoading(true);
      const all = materialNotificationHelper.getAll();
      setNotifications(all);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (notificationId: string) => {
    materialNotificationHelper.markAsRead(notificationId);
    loadNotifications();
  };

  const markAllAsRead = () => {
    materialNotificationHelper.markAllAsRead();
    loadNotifications();
  };

  const filteredNotifications = useMemo(() => {
    const filtered = activeTab === 'unread'
      ? notifications.filter(n => !n.read)
      : notifications;
    return filtered.slice(0, 20); // Show max 20
  }, [notifications, activeTab]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'upload':
        return '📤';
      case 'approved':
        return '✅';
      case 'rejected':
        return '❌';
    }
  };

  const getNotificationTitle = (notification: Notification) => {
    const { type, request } = notification;
    switch (type) {
      case 'upload':
        return `${request.contractorName} đã thêm mới phiếu xuất hàng hóa`;
      case 'approved':
        return `Phiếu xuất hàng hóa đã được phê duyệt`;
      case 'rejected':
        return `Phiếu xuất hàng hóa đã bị từ chối`;
    }
  };

  const getNotificationSubtitle = (notification: Notification) => {
    const { request } = notification;
    // Display project name and request date
    const requestDate = new Date(request.requestDate || request.createdAt);
    const dateStr = requestDate.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    return `cho dự án ${request.projectName} - ${dateStr}`;
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Thông báo</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Đánh dấu tất cả đã đọc
                </button>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'all'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setActiveTab('unread')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'unread'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Chưa đọc
                {unreadCount > 0 && (
                  <span className="ml-1 text-xs">({unreadCount})</span>
                )}
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-sm">Đang tải...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">
                  {activeTab === 'unread'
                    ? 'Không có thông báo chưa đọc'
                    : 'Chưa có thông báo nào'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => {
                    markAsRead(notification.id);
                    // Navigate to materials page
                    window.location.href = `/projects/${notification.request.projectId}/materials`;
                  }}
                  className={`px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors relative ${
                    notification.read ? 'bg-white hover:bg-gray-50' : 'bg-blue-50 hover:bg-blue-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 text-2xl mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">
                        {getNotificationTitle(notification)}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {getNotificationSubtitle(notification)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <span>🕐</span>
                        {getTimeAgo(notification.timestamp)}
                      </p>
                    </div>

                    {/* Unread indicator */}
                    {!notification.read && (
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {filteredNotifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 text-center">
              <button
                onClick={() => {
                  setIsOpen(false);
                  // Navigate to notifications page
                  window.location.href = '/notifications';
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Xem tất cả
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
