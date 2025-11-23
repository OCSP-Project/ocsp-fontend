'use client';

import { useMemo, useRef, useEffect } from 'react';
import { GanttChartDataDto, GanttItemDto } from '@/types/work-item.types';
import { getTimelineBarColor, formatDate } from './utils';

interface GanttTimelineProps {
  data: GanttChartDataDto;
  selectedItemId: string | null;
  onItemClick: (itemId: string) => void;
}

export function GanttTimeline({ data, selectedItemId, onItemClick }: GanttTimelineProps) {
  const { timeline } = data;
  const headerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Calculate grid columns based on weeks
  const totalDays = useMemo(() => {
    const start = new Date(timeline.startDate);
    const end = new Date(timeline.endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }, [timeline]);

  const flatItems = useMemo(() => {
    const flatten = (items: GanttItemDto[]): GanttItemDto[] => {
      return items.reduce((acc: GanttItemDto[], item) => {
        acc.push(item);
        if (item.children && item.children.length > 0) {
          acc.push(...flatten(item.children));
        }
        return acc;
      }, []);
    };
    const result = flatten(data.items || []);
    console.log('Gantt data.items:', data.items);
    console.log('Flattened items:', result);
    console.log('Items with dates:', result.filter(i => i.startDate && i.endDate));
    console.log('Sample item:', result[0]);
    console.log('Item #3 (should have children):', result[2]);
    return result;
  }, [data.items]);

  // Fixed width for each week (in pixels)
  const WEEK_WIDTH = 120; // Increased from percentage to fixed 120px per week
  const totalWidth = (timeline.weeks || []).length * WEEK_WIDTH;
  const pixelsPerDay = totalWidth / totalDays;

  const getBarPosition = (item: GanttItemDto) => {
    if (!item.startDate || !item.endDate) return null;

    const projectStart = new Date(timeline.startDate);
    projectStart.setHours(0, 0, 0, 0); // Reset to start of day

    const itemStart = new Date(item.startDate);
    itemStart.setHours(0, 0, 0, 0);

    const itemEnd = new Date(item.endDate);
    itemEnd.setHours(23, 59, 59, 999); // End of day

    // Calculate offset in days from project start
    const startDayOffset = Math.floor((itemStart.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate duration in days (inclusive)
    const duration = Math.ceil((itemEnd.getTime() - itemStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Calculate pixel positions
    const leftPx = startDayOffset * pixelsPerDay;
    const widthPx = duration * pixelsPerDay;

    return {
      left: `${Math.max(0, leftPx)}px`,
      width: `${Math.max(20, widthPx)}px`, // Minimum 20px width
    };
  };

  // Group weeks by month
  const monthHeaders = useMemo(() => {
    const months: { month: string; weeks: number }[] = [];
    let currentMonth = '';
    let weekCount = 0;

    (timeline.weeks || []).forEach((week) => {
      const weekDate = new Date(week.startDate);
      const monthYear = weekDate.toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' });

      if (monthYear !== currentMonth) {
        if (currentMonth) {
          months.push({ month: currentMonth, weeks: weekCount });
        }
        currentMonth = monthYear;
        weekCount = 1;
      } else {
        weekCount++;
      }
    });

    if (currentMonth) {
      months.push({ month: currentMonth, weeks: weekCount });
    }

    return months;
  }, [timeline.weeks]);

  // Sync scroll between header and body
  useEffect(() => {
    const handleBodyScroll = () => {
      if (bodyRef.current && headerRef.current) {
        headerRef.current.scrollLeft = bodyRef.current.scrollLeft;
      }
    };

    const bodyElement = bodyRef.current;
    if (bodyElement) {
      bodyElement.addEventListener('scroll', handleBodyScroll);
      return () => bodyElement.removeEventListener('scroll', handleBodyScroll);
    }
  }, []);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Timeline Header - No horizontal scroll, synced with body */}
      <div
        ref={headerRef}
        className="sticky top-0 bg-white border-b-2 border-gray-300 z-20 overflow-x-hidden"
      >
        <div style={{ minWidth: `${totalWidth}px` }}>
          {/* Month Headers */}
          <div className="flex border-b border-gray-200">
            {monthHeaders.map((header, index) => (
              <div
                key={index}
                className="flex-shrink-0 border-r border-gray-200 px-2 py-2 text-center font-semibold text-sm text-gray-700 bg-gray-50"
                style={{ width: `${header.weeks * WEEK_WIDTH}px` }}
              >
                Tháng {header.month}
              </div>
            ))}
          </div>

          {/* Week Headers */}
          <div className="flex">
            {(timeline.weeks || []).map((week, index) => (
              <div
                key={index}
                className="flex-shrink-0 border-r border-gray-200 px-2 py-2 text-center text-xs text-gray-600"
                style={{ width: `${WEEK_WIDTH}px` }}
              >
                <div className="font-medium">Tuần {week.weekNumber}</div>
                <div className="text-gray-400 mt-1 text-xs">
                  {new Date(week.startDate).getDate()}/{new Date(week.startDate).getMonth() + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Body - Only this scrolls */}
      <div
        ref={bodyRef}
        className="flex-1 overflow-auto"
      >
        <div className="relative" style={{ minWidth: `${totalWidth}px` }}>
          {/* Week Grid Lines */}
          <div className="absolute inset-0 flex pointer-events-none">
            {(timeline.weeks || []).map((_, index) => (
              <div
                key={index}
                className="flex-shrink-0 border-r border-gray-100"
                style={{ width: `${WEEK_WIDTH}px` }}
              />
            ))}
          </div>

          {/* Gantt Bars */}
          <div className="relative">
            {flatItems.map((item, index) => {
              const barPosition = getBarPosition(item);
              if (!barPosition) return null;

              const isSelected = selectedItemId === item.id;
              const barColor = getTimelineBarColor(item.status, item.endDate, item.progress);

              return (
                <div
                  key={item.id}
                  className="relative h-12 border-b border-gray-100"
                  style={{ minHeight: '48px' }}
                >
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 h-8 rounded cursor-pointer transition-all hover:opacity-90 ${barColor} ${
                      isSelected ? 'ring-2 ring-yellow-400 ring-offset-2' : ''
                    }`}
                    style={{
                      left: barPosition.left,
                      width: barPosition.width,
                      minWidth: '20px',
                    }}
                    onClick={() => onItemClick(item.id)}
                    title={`${item.name}\n${formatDate(item.startDate)} - ${formatDate(item.endDate)}\nTiến độ: ${item.progress || 0}%`}
                  >
                    <div className="relative h-full">
                      {/* Progress Overlay */}
                      {item.progress !== undefined && item.progress > 0 && (
                        <div
                          className="absolute top-0 left-0 h-full bg-black bg-opacity-20 rounded-l"
                          style={{ width: `${item.progress}%` }}
                        />
                      )}

                      {/* Item Label */}
                      <div className="absolute inset-0 flex items-center px-2">
                        <span className="text-white text-xs font-medium truncate">
                          {item.name}
                        </span>
                      </div>

                      {/* Progress Badge */}
                      {item.progress !== undefined && (
                        <div className="absolute -right-2 -top-2 bg-white border border-gray-300 rounded-full px-1.5 py-0.5 text-xs font-semibold shadow-sm">
                          {item.progress}%
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
