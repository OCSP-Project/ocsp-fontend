'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { WorkItemsSection } from './components/WorkItemsSection';
import { MaterialDiarySection } from './components/MaterialDiarySection';
import { DiaryInfoSection } from './components/DiaryInfoSection';
import type { CreateConstructionDiaryDto, DiaryWorkItemEntry, DiaryMaterialEntry } from '@/types/construction-diary.types';
import { getDiaryByDate, createDiary, updateDiary } from '@/lib/api/construction-diary';

export default function DiaryEntryPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const date = params.date as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingDiaryId, setExistingDiaryId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'workItems' | 'materials'>('workItems');

  // Form state
  const [workItems, setWorkItems] = useState<DiaryWorkItemEntry[]>([]);
  const [materialEntries, setMaterialEntries] = useState<DiaryMaterialEntry[]>([]);
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
      safety: 0, // ConstructionRating.Good
      quality: 0,
      progress: 0,
      cleanliness: 0,
    },
    images: [],
    incidentReport: '',
    recommendations: '',
    notes: '',
  });

  // Load existing diary if available
  const loadDiary = async () => {
    try {
      setLoading(true);
      const existing = await getDiaryByDate(projectId, date);

      if (existing) {
        // Load existing diary data into form
        setExistingDiaryId(existing.id);
        setDiaryData({
          projectId: existing.projectId,
          diaryDate: existing.diaryDate,
          team: existing.constructionTeam || '',
          weather: existing.weatherPeriods || [],
          assessment: {
            safety: existing.safetyRating,
            quality: existing.qualityRating,
            progress: existing.progressRating,
            cleanliness: existing.cleanlinessRating,
          },
          images: existing.images || [],
          incidentReport: existing.incidentReport || '',
          recommendations: existing.recommendations || '',
          notes: existing.notes || '',
        });
        setWorkItems(existing.workItems || []);
        setMaterialEntries(existing.materialEntries || []);
      }
    } catch (error) {
      console.error('Error loading diary:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiary();
  }, [projectId, date]);

  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return `${days[d.getDay()]}, ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const dataToSave: any = {
        projectId,
        diaryDate: date,
        constructionTeam: diaryData.team || '',
        safetyRating: diaryData.assessment?.safety ?? 0,
        qualityRating: diaryData.assessment?.quality ?? 0,
        progressRating: diaryData.assessment?.progress ?? 0,
        cleanlinessRating: diaryData.assessment?.cleanliness ?? 0,
        incidentReport: diaryData.incidentReport || '',
        recommendations: diaryData.recommendations || '',
        notes: diaryData.notes || '',
        supervisorName: '',
        supervisorPosition: '',
        contractorName: '',
        supervisorUnitName: '',
        workItems: workItems.map(wi => ({
          workItemId: wi.workItemId,
          constructionArea: wi.constructionArea || '',
          constructedQuantity: wi.constructedQuantity || 0,
          laborEntries: wi.laborEntries?.map(l => ({
            laborId: l.laborId,
            laborName: l.laborName,
            position: l.position || '',
            workHours: l.workHours,
            team: l.team,
            shift: l.shift,
            quantity: l.quantity,
            unit: l.unit,
          })) || [],
          equipmentEntries: wi.equipmentEntries?.map(e => ({
            equipmentId: e.equipmentId,
            equipmentName: e.equipmentName,
            specifications: e.specifications,
            hoursUsed: e.hoursUsed,
            quantity: e.quantity,
            unit: e.unit,
          })) || [],
        })),
        materialEntries: materialEntries.map(m => ({
          materialId: m.materialId,
          materialName: m.materialName,
          code: m.code,
          unit: m.unit,
          contractQuantity: m.contractQuantity,
          actualQuantity: m.actualQuantity,
          variance: m.variance,
        })),
        weatherPeriods: diaryData.weather?.map(w => ({
          period: w.period,
          condition: w.condition || '',
          temperature: w.temperature || '',
        })) || [],
        images: diaryData.images?.map(img => ({
          url: img.url,
          category: img.category,
          description: img.description || '',
          // Don't send uploadedAt, backend will set it
        })) || [],
      };

      console.log('Saving diary:', dataToSave);

      if (existingDiaryId) {
        // Update existing diary
        await updateDiary(existingDiaryId, { ...dataToSave, id: existingDiaryId });
      } else {
        // Create new diary
        await createDiary(dataToSave);
      }

      alert('Lưu nhật ký thành công!');

      // Redirect back to diary calendar
      router.push(`/projects/${projectId}/diary`);
    } catch (error: any) {
      console.error('Error saving diary:', error);
      const errorMsg = error.response?.data?.message || 'Không thể lưu nhật ký. Vui lòng thử lại.';
      alert(errorMsg);
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
          {/* LEFT COLUMN - Work Items & Materials with Tabs */}
          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-2 flex gap-2">
              <button
                onClick={() => setActiveTab('workItems')}
                className={`
                  flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200
                  ${activeTab === 'workItems'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }
                `}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Nhật ký thi công
                </div>
              </button>
              <button
                onClick={() => setActiveTab('materials')}
                className={`
                  flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200
                  ${activeTab === 'materials'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }
                `}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Nhật ký vật tư
                </div>
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'workItems' ? (
              <WorkItemsSection
                projectId={projectId}
                workItems={workItems}
                onWorkItemsChange={setWorkItems}
              />
            ) : (
              <MaterialDiarySection
                projectId={projectId}
                materialEntries={materialEntries}
                onMaterialEntriesChange={setMaterialEntries}
              />
            )}
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
