'use client';

import { useState, useRef, useEffect } from 'react';
import { WorkItemStatus, WorkItemStatusLabels } from '@/types/work-item.types';

interface StatusDropdownProps {
  currentStatus: WorkItemStatus;
  onStatusChange: (newStatus: WorkItemStatus) => void;
  disabled?: boolean;
}

const statusOptions = [
  { value: WorkItemStatus.NotStarted, label: 'Chưa thực hiện', color: 'bg-gray-100 text-gray-800' },
  { value: WorkItemStatus.InProgress, label: 'Đang thực hiện', color: 'bg-blue-100 text-blue-800' },
  { value: WorkItemStatus.Completed, label: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
  { value: WorkItemStatus.OnHold, label: 'Tạm dừng', color: 'bg-orange-100 text-orange-800' },
  { value: WorkItemStatus.Cancelled, label: 'Hủy', color: 'bg-red-100 text-red-800' },
];

export function StatusDropdown({ currentStatus, onStatusChange, disabled = false }: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentOption = statusOptions.find(opt => opt.value === currentStatus) || statusOptions[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleStatusSelect = (status: WorkItemStatus) => {
    onStatusChange(status);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) {
            setIsOpen(!isOpen);
          }
        }}
        disabled={disabled}
        className={`px-2 py-1 rounded-md text-xs font-medium ${currentOption.color} ${
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:opacity-80'
        } transition-opacity`}
      >
        {currentOption.label}
      </button>

      {isOpen && (
        <div className="absolute z-[100] mt-1 w-40 bg-white rounded-md shadow-lg border border-gray-200">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={(e) => {
                e.stopPropagation();
                handleStatusSelect(option.value);
              }}
              className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors ${
                option.value === currentStatus ? 'bg-gray-100' : ''
              }`}
            >
              <span className={`px-2 py-1 rounded-md ${option.color}`}>
                {option.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
