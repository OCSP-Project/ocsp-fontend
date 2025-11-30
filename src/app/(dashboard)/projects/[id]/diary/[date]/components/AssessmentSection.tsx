'use client';

import { ConstructionRating } from '@/types/construction-diary.types';
import type { ConstructionAssessment } from '@/types/construction-diary.types';

interface AssessmentSectionProps {
  assessment: ConstructionAssessment;
  onChange: (assessment: ConstructionAssessment) => void;
}

const ASSESSMENT_CATEGORIES = [
  {
    key: 'safety' as keyof ConstructionAssessment,
    label: 'Công tác an toàn',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    key: 'quality' as keyof ConstructionAssessment,
    label: 'Chất lượng thi công',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: 'progress' as keyof ConstructionAssessment,
    label: 'Tiến độ thi công',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    key: 'cleanliness' as keyof ConstructionAssessment,
    label: 'Công tác vệ sinh',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
];

const RATING_OPTIONS: { value: ConstructionRating; label: string; color: string }[] = [
  { value: ConstructionRating.Good, label: 'Tốt', color: 'green' },
  { value: ConstructionRating.Average, label: 'Trung bình', color: 'yellow' },
  { value: ConstructionRating.Poor, label: 'Kém', color: 'red' },
];

export function AssessmentSection({ assessment, onChange }: AssessmentSectionProps) {
  const handleRatingChange = (category: keyof ConstructionAssessment, rating: ConstructionRating) => {
    onChange({
      ...assessment,
      [category]: rating,
    });
  };

  return (
    <div className="bg-white backdrop-blur-sm rounded-xl border border-gray-200 shadow-xl">
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-200 px-6 py-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Tình hình thi công trong ngày
        </h3>
      </div>

      <div className="p-6 space-y-5">
        {ASSESSMENT_CATEGORIES.map((category) => (
          <div
            key={category.key}
            className="bg-gray-50 border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 text-gray-900 font-medium mb-3">
              {category.icon}
              <span>{category.label}</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {RATING_OPTIONS.map((option) => {
                const isSelected = assessment[category.key] === option.value;

                return (
                  <label
                    key={option.value}
                    className={`
                      relative flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 cursor-pointer transition-all
                      ${isSelected
                        ? `border-${option.color}-500 bg-${option.color}-50`
                        : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name={`assessment-${category.key}`}
                      value={option.value}
                      checked={isSelected}
                      onChange={() => handleRatingChange(category.key, option.value)}
                      className="sr-only"
                    />

                    {/* Custom Radio Circle */}
                    <div
                      className={`
                        w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                        ${isSelected
                          ? `border-${option.color}-500 bg-${option.color}-500`
                          : 'border-gray-400 bg-white'
                        }
                      `}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>

                    <span
                      className={`
                        text-sm font-medium transition-colors
                        ${isSelected
                          ? `text-${option.color}-700`
                          : 'text-gray-600'
                        }
                      `}
                    >
                      {option.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
