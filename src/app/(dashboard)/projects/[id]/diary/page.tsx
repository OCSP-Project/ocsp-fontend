'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { getDiariesByMonth } from '@/lib/api/construction-diary';
import type { ConstructionDiaryDto } from '@/types/construction-diary.types';
import { ImageCategory } from '@/types/construction-diary.types';

export default function ConstructionDiaryPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [diaries, setDiaries] = useState<ConstructionDiaryDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch diaries for the current month
  useEffect(() => {
    const fetchDiaries = async () => {
      try {
        setLoading(true);
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const data = await getDiariesByMonth(projectId, year, month);
        setDiaries(data);
      } catch (error) {
        console.error('Error fetching diaries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiaries();
  }, [projectId, currentDate]);

  // Convert diaries array to date lookup
  const diariesByDate: Record<string, boolean> = {};
  const diariesWithIncidents: Record<string, boolean> = {};

  diaries.forEach(diary => {
    const dateStr = new Date(diary.diaryDate).toISOString().split('T')[0];
    diariesByDate[dateStr] = true;

    // Check if diary has incident images
    const hasIncidentImages = diary.images?.some(img => img.category === ImageCategory.Incident) || false;
    if (hasIncidentImages) {
      diariesWithIncidents[dateStr] = true;
    }
  });

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    return { daysInMonth, startDayOfWeek, year, month };
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (day: number) => {
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateStr = selectedDate.toISOString().split('T')[0];
    router.push(`/projects/${projectId}/diary/${dateStr}`);
  };

  const { daysInMonth, startDayOfWeek, year, month } = getDaysInMonth(currentDate);

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  // Generate calendar grid
  const calendarDays: (number | null)[] = [];

  // Add empty cells for days before the first day of month
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null);
  }

  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const today = new Date();
  const isToday = (day: number | null) => {
    if (!day) return false;
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const hasDiary = (day: number | null) => {
    if (!day) return false;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return diariesByDate[dateStr] || false;
  };

  const hasIncident = (day: number | null) => {
    if (!day) return false;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return diariesWithIncidents[dateStr] || false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Nhật ký công trình</h1>
              <p className="text-slate-400">Quản lý nhật ký thi công theo ngày</p>
            </div>
            <button
              onClick={() => router.push(`/projects/${projectId}`)}
              className="px-6 py-2.5 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-lg border border-slate-600/50 transition-all duration-200"
            >
              ← Quay lại dự án
            </button>
          </div>
        </div>

        {/* Calendar Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
          {/* Calendar Header */}
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-slate-700/50 p-6">
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-white">
                  {monthNames[month]} {year}
                </h2>
                <button
                  onClick={handleToday}
                  className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg border border-blue-500/30 transition-colors text-sm font-medium"
                >
                  Hôm nay
                </button>
              </div>

              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-6">
            {/* Day Names */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {dayNames.map((dayName, index) => (
                <div
                  key={dayName}
                  className={`text-center py-3 font-semibold text-sm ${
                    index === 0 ? 'text-red-400' : 'text-slate-400'
                  }`}
                >
                  {dayName}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => {
                const isCurrentDay = isToday(day);
                const hasEntry = hasDiary(day);
                const hasIncidentReport = hasIncident(day);

                return (
                  <div
                    key={index}
                    onClick={() => day && handleDayClick(day)}
                    className={`
                      relative aspect-square rounded-xl transition-all duration-200
                      ${day ? 'cursor-pointer' : 'cursor-default'}
                      ${day && !hasEntry ? 'bg-slate-700/30 hover:bg-slate-600/50 border border-slate-600/30 hover:border-slate-500/50' : ''}
                      ${hasEntry && !hasIncidentReport ? 'bg-gradient-to-br from-blue-500/30 to-purple-500/30 border-2 border-blue-400/50 hover:border-blue-300 shadow-lg shadow-blue-500/20' : ''}
                      ${hasIncidentReport ? 'bg-gradient-to-br from-red-500/30 to-orange-500/30 border-2 border-red-400/50 hover:border-red-300 shadow-lg shadow-red-500/20' : ''}
                      ${isCurrentDay ? 'ring-2 ring-yellow-400/50 ring-offset-2 ring-offset-slate-800' : ''}
                    `}
                  >
                    {day && (
                      <>
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                          <span className={`
                            text-lg font-semibold
                            ${isCurrentDay ? 'text-yellow-300' : hasEntry ? 'text-white' : 'text-slate-300'}
                          `}>
                            {day}
                          </span>

                          {hasEntry && (
                            <div className="absolute bottom-2 flex gap-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                              <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                              <div className="w-1.5 h-1.5 rounded-full bg-pink-400"></div>
                            </div>
                          )}
                        </div>

                        {isCurrentDay && (
                          <div className="absolute -top-1 -right-1">
                            <span className="flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="border-t border-slate-700/50 bg-slate-900/30 px-6 py-4">
            <div className="flex items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-500/30 to-purple-500/30 border-2 border-blue-400/50"></div>
                <span className="text-slate-300">Đã có nhật ký</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-br from-red-500/30 to-orange-500/30 border-2 border-red-400/50"></div>
                <span className="text-slate-300">Có sự cố</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-slate-700/30 border border-slate-600/30"></div>
                <span className="text-slate-300">Chưa có nhật ký</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded ring-2 ring-yellow-400/50 bg-slate-700/30"></div>
                <span className="text-slate-300">Hôm nay</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm font-medium mb-1">Nhật ký tháng này</p>
                <p className="text-3xl font-bold text-white">
                  {loading ? '...' : diaries.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm font-medium mb-1">Tổng công việc</p>
                <p className="text-3xl font-bold text-white">
                  {loading ? '...' : diaries.reduce((sum, d) => sum + (d.workItems?.length || 0), 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm font-medium mb-1">Tổng ảnh</p>
                <p className="text-3xl font-bold text-white">
                  {loading ? '...' : diaries.reduce((sum, d) => sum + (d.images?.length || 0), 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
