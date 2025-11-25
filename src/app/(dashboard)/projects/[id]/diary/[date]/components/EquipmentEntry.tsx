'use client';

import { useState } from 'react';
import type { DiaryEquipmentEntry, EquipmentDto } from '@/types/construction-diary.types';

interface EquipmentEntryProps {
  workItemId: string;
  equipmentEntries: DiaryEquipmentEntry[];
  onEquipmentEntriesChange: (entries: DiaryEquipmentEntry[]) => void;
}

// Mock data - sẽ thay bằng API call
const MOCK_EQUIPMENT: EquipmentDto[] = [
  { id: '1', name: 'Máy trộn vữa', specifications: 'Dung tích: 150 lít', category: 'Máy trộn' },
  { id: '2', name: 'Cần trục tháp', specifications: 'Tải trọng: 5 tấn', category: 'Cần trục' },
  { id: '3', name: 'Máy đầm dùi', specifications: 'Công suất: 1.5kW', category: 'Máy đầm' },
  { id: '4', name: 'Vận thăng tải', specifications: 'Tải trọng: 1 tấn', category: 'Vận thăng' },
  { id: '5', name: 'Máy cắt bê tông', specifications: 'Đường kính: 350mm', category: 'Máy cắt' },
  { id: '6', name: 'Máy hàn điện', specifications: 'Công suất: 200A', category: 'Máy hàn' },
  { id: '7', name: 'Máy bơm bê tông', specifications: 'Tầm cao: 20m', category: 'Máy bơm' },
];

export function EquipmentEntry({ workItemId, equipmentEntries, onEquipmentEntriesChange }: EquipmentEntryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const filteredEquipment = MOCK_EQUIPMENT.filter(equipment =>
    equipment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    equipment.specifications.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddEquipment = (equipment: EquipmentDto) => {
    // Check if already added
    if (equipmentEntries.find(e => e.equipmentId === equipment.id)) {
      alert('Thiết bị này đã được thêm!');
      return;
    }

    const newEntry: DiaryEquipmentEntry = {
      id: crypto.randomUUID(),
      equipmentId: equipment.id,
      equipmentName: equipment.name,
      specifications: equipment.specifications,
      hoursUsed: 0,
      quantity: 0,
      unit: 'ca',
    };

    onEquipmentEntriesChange([...equipmentEntries, newEntry]);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const handleRemoveEquipment = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa thiết bị này?')) {
      onEquipmentEntriesChange(equipmentEntries.filter(e => e.id !== id));
    }
  };

  const handleUpdateEquipment = (id: string, updates: Partial<DiaryEquipmentEntry>) => {
    onEquipmentEntriesChange(
      equipmentEntries.map(e => (e.id === id ? { ...e, ...updates } : e))
    );
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-xl">
      <div className="bg-gradient-to-r from-orange-600/20 to-amber-600/20 border-b border-slate-700/50 px-6 py-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          Máy móc thiết bị
        </h3>
      </div>

      <div className="p-6 space-y-4">
        {/* Search Equipment */}
        <div className="relative">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Tìm kiếm thiết bị
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
              placeholder="Nhập tên hoặc thông số thiết bị..."
              className="w-full px-4 py-2.5 pl-11 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Search Results Dropdown */}
          {showSearchResults && searchQuery && (
            <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700/50 rounded-lg shadow-2xl max-h-48 overflow-y-auto">
              {filteredEquipment.length > 0 ? (
                <div className="py-2">
                  {filteredEquipment.map((equipment) => (
                    <button
                      key={equipment.id}
                      onClick={() => handleAddEquipment(equipment)}
                      className="w-full px-4 py-2.5 hover:bg-slate-700/50 transition-colors text-left flex items-center justify-between group"
                    >
                      <div>
                        <div className="font-medium text-white group-hover:text-orange-300">
                          {equipment.name}
                        </div>
                        <div className="text-sm text-slate-400">{equipment.specifications}</div>
                      </div>
                      <svg className="w-5 h-5 text-slate-500 group-hover:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-6 text-center text-slate-400 text-sm">
                  Không tìm thấy thiết bị
                </div>
              )}
            </div>
          )}
        </div>

        {/* Equipment Entries Table */}
        {equipmentEntries.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-700/30 rounded-full mb-3">
              <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <p className="text-slate-400 text-sm">Chưa có thiết bị</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Table Header - Desktop only */}
            <div className="hidden lg:grid grid-cols-12 gap-3 px-4 py-2 bg-slate-900/30 rounded-lg text-sm font-medium text-slate-400">
              <div className="col-span-1">STT</div>
              <div className="col-span-4">Thiết bị</div>
              <div className="col-span-2">Giờ sử dụng</div>
              <div className="col-span-2">Số lượng</div>
              <div className="col-span-2">Đơn vị</div>
              <div className="col-span-1"></div>
            </div>

            {/* Table Rows */}
            {equipmentEntries.map((entry, index) => (
              <div
                key={entry.id}
                className="grid grid-cols-1 lg:grid-cols-12 gap-3 p-4 bg-slate-900/30 border border-slate-700/30 rounded-lg hover:border-slate-600/50 transition-colors"
              >
                {/* Mobile: Equipment Name Header */}
                <div className="lg:hidden col-span-1 mb-2">
                  <div className="font-medium text-white">
                    {index + 1}. {entry.equipmentName}
                  </div>
                  <div className="text-sm text-slate-400">{entry.specifications}</div>
                </div>

                {/* STT - Desktop */}
                <div className="hidden lg:flex col-span-1 items-center text-slate-300">
                  {index + 1}
                </div>

                {/* Equipment Name + Specification - Desktop */}
                <div className="hidden lg:flex col-span-4 items-center">
                  <div>
                    <div className="font-medium text-white">{entry.equipmentName}</div>
                    <div className="text-sm text-slate-400">{entry.specifications}</div>
                  </div>
                </div>

                {/* Hours Used */}
                <div className="col-span-1 lg:col-span-2">
                  <label className="block lg:hidden text-xs text-slate-400 mb-1">Giờ sử dụng</label>
                  <input
                    type="number"
                    step="0.1"
                    value={entry.hoursUsed}
                    onChange={(e) => handleUpdateEquipment(entry.id, { hoursUsed: Number(e.target.value) })}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>

                {/* Quantity */}
                <div className="col-span-1 lg:col-span-2">
                  <label className="block lg:hidden text-xs text-slate-400 mb-1">Số lượng</label>
                  <input
                    type="number"
                    step="0.01"
                    value={entry.quantity}
                    onChange={(e) => handleUpdateEquipment(entry.id, { quantity: Number(e.target.value) })}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>

                {/* Unit */}
                <div className="col-span-1 lg:col-span-2">
                  <label className="block lg:hidden text-xs text-slate-400 mb-1">Đơn vị</label>
                  <select
                    value={entry.unit}
                    onChange={(e) => handleUpdateEquipment(entry.id, { unit: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  >
                    <option value="ca">Ca</option>
                    <option value="giờ">Giờ</option>
                    <option value="ngày">Ngày</option>
                    <option value="tháng">Tháng</option>
                  </select>
                </div>

                {/* Delete Button */}
                <div className="col-span-1 lg:col-span-1 flex items-center justify-end">
                  <button
                    onClick={() => handleRemoveEquipment(entry.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors group"
                    title="Xóa"
                  >
                    <svg className="w-5 h-5 text-slate-400 group-hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
