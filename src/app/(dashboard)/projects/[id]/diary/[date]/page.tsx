'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { WorkItemsSection } from './components/WorkItemsSection';
import { DiaryInfoSection } from './components/DiaryInfoSection';
import type { CreateConstructionDiaryDto, DiaryWorkItemEntry } from '@/types/construction-diary.types';

export default function DiaryEntryPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const date = params.date as string;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [workItems, setWorkItems] = useState<DiaryWorkItemEntry[]>([]);
  const [diaryData, setDiaryData] = useState<Partial<CreateConstructionDiaryDto>>({
    projectId,
    diaryDate: date,
    team: '',
    weather: [
      { period: 'morning', condition: '', temperature: '' },
      { period: 'afternoon', condition: '', temperature: '' },
      { period: 'evening', condition: '', temperature: '' },
      { period: 'night', condition: '', temperature: '' },
    ],
    assessment: {
      safety: 'good' as any,
      quality: 'good' as any,
      progress: 'good' as any,
      cleanliness: 'good' as any,
    },
    images: [],
    incidentReport: '',
    recommendations: '',
    notes: '',
  });

  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return `${days[d.getDay()]}, ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const dataToSave: CreateConstructionDiaryDto = {
        ...diaryData as CreateConstructionDiaryDto,
        workItems,
      };

      // TODO: Call API to save
      console.log('Saving diary:', dataToSave);

      alert('Lưu nhật ký thành công!');
      router.push(`/projects/${projectId}/diary`);
    } catch (error) {
      console.error('Error saving diary:', error);
      alert('Không thể lưu nhật ký. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (confirm('Bạn có chắc muốn đóng? Các thay đổi chưa lưu sẽ bị mất.')) {
      router.push(`/projects/${projectId}/diary`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />

      <div className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Nhật ký thi công</h1>
              <p className="text-slate-400">{formatDisplayDate(date)}</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleClose}
                disabled={saving}
                className="px-6 py-2.5 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-lg border border-slate-600/50 transition-all duration-200 disabled:opacity-50"
              >
                Đóng
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg shadow-lg shadow-blue-500/30 transition-all duration-200 font-medium disabled:opacity-50"
              >
                {saving ? 'Đang lưu...' : 'Lưu nhật ký'}
              </button>
            </div>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT COLUMN - Work Items & Materials */}
          <div className="space-y-6">
            <WorkItemsSection
              projectId={projectId}
              workItems={workItems}
              onWorkItemsChange={setWorkItems}
            />
          </div>

          {/* RIGHT COLUMN - Diary Information */}
          <div className="space-y-6">
            <DiaryInfoSection
              data={diaryData}
              onChange={setDiaryData}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
