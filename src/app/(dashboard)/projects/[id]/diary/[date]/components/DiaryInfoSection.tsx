'use client';

import { useState } from 'react';
import type { CreateConstructionDiaryDto } from '@/types/construction-diary.types';
import { ConstructionRating } from '@/types/construction-diary.types';
import { ImageUploadSection } from './ImageUploadSection';
import { WeatherSection } from './WeatherSection';
import { AssessmentSection } from './AssessmentSection';

interface DiaryInfoSectionProps {
  data: Partial<CreateConstructionDiaryDto>;
  onChange: (data: Partial<CreateConstructionDiaryDto>) => void;
}

export function DiaryInfoSection({ data, onChange }: DiaryInfoSectionProps) {
  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return `${days[d.getDay()]}, ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  return (
    <div className="space-y-6">
      {/* Images Section */}
      <ImageUploadSection
        images={data.images || []}
        onChange={(images) => onChange({ ...data, images })}
      />

      {/* Basic Info */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Thông tin cơ bản
        </h3>

        <div className="space-y-4">
          {/* Diary Date - Read only */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Nhật ký ngày
            </label>
            <input
              type="text"
              value={data.diaryDate ? formatDisplayDate(data.diaryDate) : ''}
              readOnly
              className="w-full px-4 py-2.5 bg-slate-900/30 border border-slate-600/30 rounded-lg text-slate-400 cursor-not-allowed"
            />
          </div>

          {/* Construction Team */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Tổ đội thi công
            </label>
            <input
              type="text"
              value={data.team || ''}
              onChange={(e) => onChange({ ...data, team: e.target.value })}
              placeholder="Nhập tên tổ đội thi công..."
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
            />
          </div>
        </div>
      </div>

      {/* Weather Section */}
      <WeatherSection
        weather={data.weather || []}
        onChange={(weather) => onChange({ ...data, weather })}
      />

      {/* Assessment Section */}
      <AssessmentSection
        assessment={data.assessment || {
          safety: ConstructionRating.Good,
          quality: ConstructionRating.Good,
          progress: ConstructionRating.Good,
          cleanliness: ConstructionRating.Good,
        }}
        onChange={(assessment) => onChange({ ...data, assessment })}
      />

      {/* Reports & Notes */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Báo cáo & Ghi chú
        </h3>

        <div className="space-y-4">
          {/* Incident Report */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Báo cáo sự cố
            </label>
            <textarea
              value={data.incidentReport || ''}
              onChange={(e) => onChange({ ...data, incidentReport: e.target.value })}
              placeholder="Mô tả các sự cố xảy ra trong ngày (nếu có)..."
              rows={4}
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 resize-none"
            />
          </div>

          {/* Recommendations */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Đề xuất - Kiến nghị
            </label>
            <textarea
              value={data.recommendations || ''}
              onChange={(e) => onChange({ ...data, recommendations: e.target.value })}
              placeholder="Nhập các đề xuất, kiến nghị về công trình..."
              rows={4}
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 resize-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Ghi chú
            </label>
            <textarea
              value={data.notes || ''}
              onChange={(e) => onChange({ ...data, notes: e.target.value })}
              placeholder="Ghi chú thêm về tình hình thi công..."
              rows={4}
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
