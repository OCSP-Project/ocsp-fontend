'use client';

import { useState } from 'react';
import type { DiaryWorkItemEntry, WorkItemSummary } from '@/types/construction-diary.types';
import { LaborEntry } from './LaborEntry';
import { EquipmentEntry } from './EquipmentEntry';
import { MaterialSection } from './MaterialSection';

interface WorkItemsSectionProps {
  projectId: string;
  workItems: DiaryWorkItemEntry[];
  onWorkItemsChange: (workItems: DiaryWorkItemEntry[]) => void;
}

// Mock data - sẽ thay bằng API call
const MOCK_WORK_ITEMS: WorkItemSummary[] = [
  { id: '1', name: 'Đào móng', code: 'WI-001', unit: 'm3', plannedQuantity: 100 },
  { id: '2', name: 'Đổ bê tông móng', code: 'WI-002', unit: 'm3', plannedQuantity: 50 },
  { id: '3', name: 'Xây tường gạch', code: 'WI-003', unit: 'm2', plannedQuantity: 200 },
  { id: '4', name: 'Trát tường', code: 'WI-004', unit: 'm2', plannedQuantity: 400 },
  { id: '5', name: 'Lắp cốt thép', code: 'WI-005', unit: 'tấn', plannedQuantity: 5 },
];

export function WorkItemsSection({ projectId, workItems, onWorkItemsChange }: WorkItemsSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedWorkItemId, setSelectedWorkItemId] = useState<string | null>(null);

  const filteredWorkItems = MOCK_WORK_ITEMS.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectWorkItem = (item: WorkItemSummary) => {
    // Check if already added
    if (workItems.find(w => w.workItemId === item.id)) {
      alert('Công việc này đã được thêm!');
      return;
    }

    const newWorkItem: DiaryWorkItemEntry = {
      id: crypto.randomUUID(),
      workItemId: item.id,
      workItemName: item.name,
      constructionArea: '',
      plannedQuantity: item.plannedQuantity || 0,
      constructedQuantity: 0,
      remainingQuantity: item.plannedQuantity || 0,
      unit: item.unit || '',
      laborEntries: [],
      equipmentEntries: [],
    };

    onWorkItemsChange([...workItems, newWorkItem]);
    setSearchQuery('');
    setShowSearchResults(false);
    setSelectedWorkItemId(newWorkItem.id);
  };

  const handleRemoveWorkItem = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa công việc này?')) {
      onWorkItemsChange(workItems.filter(w => w.id !== id));
      if (selectedWorkItemId === id) {
        setSelectedWorkItemId(null);
      }
    }
  };

  const handleUpdateWorkItem = (id: string, updates: Partial<DiaryWorkItemEntry>) => {
    onWorkItemsChange(
      workItems.map(w => (w.id === id ? { ...w, ...updates } : w))
    );
  };

  const selectedWorkItem = workItems.find(w => w.id === selectedWorkItemId);

  return (
    <div className="space-y-6">
      {/* Work Items Section */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-xl">
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-slate-700/50 px-6 py-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Công việc thi công
          </h2>
        </div>

        <div className="p-6 space-y-4">
          {/* Search Work Item */}
          <div className="relative">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Tìm kiếm công việc
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => setShowSearchResults(true)}
                placeholder="Nhập tên hoặc mã công việc..."
                className="w-full px-4 py-3 pl-11 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Search Results Dropdown */}
            {showSearchResults && searchQuery && (
              <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700/50 rounded-lg shadow-2xl max-h-64 overflow-y-auto">
                {filteredWorkItems.length > 0 ? (
                  <div className="py-2">
                    {filteredWorkItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelectWorkItem(item)}
                        className="w-full px-4 py-3 hover:bg-slate-700/50 transition-colors text-left flex items-center justify-between group"
                      >
                        <div>
                          <div className="font-medium text-white group-hover:text-blue-300 transition-colors">
                            {item.name}
                          </div>
                          <div className="text-sm text-slate-400">
                            {item.code} • {item.plannedQuantity} {item.unit}
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center text-slate-400">
                    Không tìm thấy công việc
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Selected Work Items List */}
          {workItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-700/30 rounded-full mb-4">
                <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-slate-400">Chưa có công việc nào</p>
              <p className="text-slate-500 text-sm mt-1">Tìm kiếm và chọn công việc để thêm vào nhật ký</p>
            </div>
          ) : (
            <div className="space-y-3">
              {workItems.map((item) => (
                <div
                  key={item.id}
                  className={`
                    p-4 rounded-lg border transition-all cursor-pointer
                    ${selectedWorkItemId === item.id
                      ? 'bg-blue-500/10 border-blue-500/50 shadow-lg shadow-blue-500/20'
                      : 'bg-slate-900/30 border-slate-700/50 hover:border-slate-600/50'
                    }
                  `}
                  onClick={() => setSelectedWorkItemId(item.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-white mb-1">{item.workItemName}</div>
                      <div className="text-sm text-slate-400">
                        KH: {item.plannedQuantity} {item.unit} •
                        TC: {item.constructedQuantity} {item.unit} •
                        CL: {item.remainingQuantity} {item.unit}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveWorkItem(item.id);
                      }}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors group"
                    >
                      <svg className="w-5 h-5 text-slate-400 group-hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Work Item Details */}
      {selectedWorkItem && (
        <div className="space-y-6">
          {/* Construction Area & Quantities */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Chi tiết: {selectedWorkItem.workItemName}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Khu vực thi công
                </label>
                <input
                  type="text"
                  value={selectedWorkItem.constructionArea}
                  onChange={(e) => handleUpdateWorkItem(selectedWorkItem.id, { constructionArea: e.target.value })}
                  placeholder="VD: Khu A - Tầng 1"
                  className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  KL kế hoạch
                </label>
                <input
                  type="text"
                  value={`${selectedWorkItem.plannedQuantity} ${selectedWorkItem.unit}`}
                  readOnly
                  className="w-full px-4 py-2.5 bg-slate-900/30 border border-slate-600/30 rounded-lg text-slate-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  KL thi công
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={selectedWorkItem.constructedQuantity}
                    onChange={(e) => {
                      const constructed = Number(e.target.value);
                      const remaining = selectedWorkItem.plannedQuantity - constructed;
                      handleUpdateWorkItem(selectedWorkItem.id, {
                        constructedQuantity: constructed,
                        remainingQuantity: remaining,
                      });
                    }}
                    placeholder="0"
                    className="flex-1 px-4 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                  />
                  <div className="px-4 py-2.5 bg-slate-900/30 border border-slate-600/30 rounded-lg text-slate-400 min-w-[60px] flex items-center justify-center">
                    {selectedWorkItem.unit}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Còn lại
                </label>
                <input
                  type="text"
                  value={`${selectedWorkItem.remainingQuantity} ${selectedWorkItem.unit}`}
                  readOnly
                  className="w-full px-4 py-2.5 bg-slate-900/30 border border-slate-600/30 rounded-lg text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Labor Entries */}
          <LaborEntry
            workItemId={selectedWorkItem.id}
            laborEntries={selectedWorkItem.laborEntries}
            onLaborEntriesChange={(entries) =>
              handleUpdateWorkItem(selectedWorkItem.id, { laborEntries: entries })
            }
          />

          {/* Equipment Entries */}
          <EquipmentEntry
            workItemId={selectedWorkItem.id}
            equipmentEntries={selectedWorkItem.equipmentEntries}
            onEquipmentEntriesChange={(entries) =>
              handleUpdateWorkItem(selectedWorkItem.id, { equipmentEntries: entries })
            }
          />
        </div>
      )}

      {/* Materials Section */}
      {selectedWorkItem && (
        <MaterialSection workItemId={selectedWorkItem.id} />
      )}
    </div>
  );
}
