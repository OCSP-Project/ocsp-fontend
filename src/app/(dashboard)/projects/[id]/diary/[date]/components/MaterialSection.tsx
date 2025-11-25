'use client';

import { useState } from 'react';

interface MaterialSectionProps {
  workItemId: string;
}

type MaterialCategory = 'used' | 'delivered' | 'remaining';

const CATEGORY_LABELS: Record<MaterialCategory, string> = {
  used: 'Vật tư sử dụng',
  delivered: 'Vật tư nhập kho',
  remaining: 'Vật tư tồn kho',
};

const CATEGORY_COLORS: Record<MaterialCategory, string> = {
  used: 'blue',
  delivered: 'green',
  remaining: 'orange',
};

export function MaterialSection({ workItemId }: MaterialSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<MaterialCategory>('used');

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-xl">
      <div className="bg-gradient-to-r from-orange-600/20 to-amber-600/20 border-b border-slate-700/50 px-6 py-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          Vật tư
        </h3>
      </div>

      <div className="p-6 space-y-4">
        {/* Category Tabs */}
        <div className="flex gap-2 p-1 bg-slate-900/50 rounded-lg">
          {(['used', 'delivered', 'remaining'] as MaterialCategory[]).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`
                flex-1 px-4 py-2.5 rounded-lg font-medium transition-all
                ${selectedCategory === category
                  ? `bg-${CATEGORY_COLORS[category]}-500/20 text-${CATEGORY_COLORS[category]}-300 border border-${CATEGORY_COLORS[category]}-500/50`
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
                }
              `}
            >
              {CATEGORY_LABELS[category]}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[200px]">
          {selectedCategory === 'used' && (
            <div className="text-center py-12 text-slate-400">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-700/30 rounded-full mb-4">
                <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p className="text-sm font-medium mb-1">Vật tư sử dụng trong ngày</p>
              <p className="text-xs text-slate-500">Chức năng đang được phát triển...</p>
            </div>
          )}

          {selectedCategory === 'delivered' && (
            <div className="text-center py-12 text-slate-400">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-700/30 rounded-full mb-4">
                <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-sm font-medium mb-1">Vật tư nhập kho trong ngày</p>
              <p className="text-xs text-slate-500">Chức năng đang được phát triển...</p>
            </div>
          )}

          {selectedCategory === 'remaining' && (
            <div className="text-center py-12 text-slate-400">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-700/30 rounded-full mb-4">
                <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <p className="text-sm font-medium mb-1">Vật tư tồn kho</p>
              <p className="text-xs text-slate-500">Chức năng đang được phát triển...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
