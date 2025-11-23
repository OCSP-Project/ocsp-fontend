'use client';

import { useState, useEffect } from 'react';
import { getStatusColor } from './utils';
import { WorkItemStatus } from '@/types/work-item.types';

interface ProgressInputProps {
  currentProgress: number;
  status: WorkItemStatus;
  onProgressChange: (newProgress: number) => void;
  disabled?: boolean;
}

export function ProgressInput({
  currentProgress,
  status,
  onProgressChange,
  disabled = false
}: ProgressInputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(currentProgress.toString());

  useEffect(() => {
    setInputValue(currentProgress.toString());
  }, [currentProgress]);

  const handleBlur = () => {
    setIsEditing(false);
    const newProgress = parseInt(inputValue, 10);

    if (!isNaN(newProgress) && newProgress >= 0 && newProgress <= 100 && newProgress !== currentProgress) {
      onProgressChange(newProgress);
    } else {
      setInputValue(currentProgress.toString());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setInputValue(currentProgress.toString());
      setIsEditing(false);
    }
  };

  return (
    <div className="w-full" onClick={(e) => e.stopPropagation()}>
      {isEditing ? (
        <div className="flex items-center gap-1">
          <input
            type="number"
            min="0"
            max="100"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-12 px-1 py-0.5 text-xs border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
          <span className="text-xs">%</span>
        </div>
      ) : (
        <div
          onClick={() => !disabled && setIsEditing(true)}
          className={`${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-gray-100'} rounded p-1`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium">{currentProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getStatusColor(status, currentProgress).progressBar}`}
              style={{ width: `${currentProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
