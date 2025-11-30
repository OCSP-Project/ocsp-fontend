'use client';

import type { WeatherPeriod } from '@/types/construction-diary.types';

interface WeatherSectionProps {
  weather: WeatherPeriod[];
  onChange: (weather: WeatherPeriod[]) => void;
}

const PERIOD_LABELS = {
  morning: 'Sáng',
  afternoon: 'Chiều',
  evening: 'Tối',
  night: 'Đêm',
};

const PERIOD_ICONS = {
  morning: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  afternoon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  evening: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  ),
  night: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  ),
};

const PERIOD_COLORS = {
  morning: 'yellow',
  afternoon: 'orange',
  evening: 'indigo',
  night: 'purple',
};

const WEATHER_CONDITIONS = [
  'Nắng',
  'Nắng ráo',
  'Nhiều mây',
  'Ít mây',
  'Mưa nhỏ',
  'Mưa vừa',
  'Mưa to',
  'Có gió',
  'Âm u',
];

export function WeatherSection({ weather, onChange }: WeatherSectionProps) {
  const handleUpdatePeriod = (period: string, field: 'condition' | 'temperature', value: string) => {
    const updatedWeather = weather.map(w =>
      w.period === period ? { ...w, [field]: value } : w
    );
    onChange(updatedWeather);
  };

  const getPeriodData = (period: string) => {
    return weather.find(w => w.period === period) || { period, condition: '', temperature: '' };
  };

  return (
    <div className="bg-white backdrop-blur-sm rounded-xl border border-gray-200 shadow-xl">
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-gray-200 px-6 py-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
          Thời tiết
        </h3>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(['morning', 'afternoon', 'evening', 'night'] as const).map((period) => {
            const periodData = getPeriodData(period);
            const colorClass = PERIOD_COLORS[period];

            return (
              <div
                key={period}
                className={`bg-gradient-to-br from-${colorClass}-50 to-${colorClass}-100/50 border border-${colorClass}-200 rounded-lg p-4`}
              >
                <div className={`flex items-center gap-2 mb-3 text-${colorClass}-700`}>
                  {PERIOD_ICONS[period]}
                  <h4 className="font-semibold">{PERIOD_LABELS[period]}</h4>
                </div>

                <div className="space-y-3">
                  {/* Weather Condition */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Tình trạng
                    </label>
                    <select
                      value={periodData.condition}
                      onChange={(e) => handleUpdatePeriod(period, 'condition', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    >
                      <option value="">Chọn tình trạng</option>
                      {WEATHER_CONDITIONS.map((condition) => (
                        <option key={condition} value={condition}>
                          {condition}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Temperature */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Nhiệt độ (°C)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={periodData.temperature}
                        onChange={(e) => handleUpdatePeriod(period, 'temperature', e.target.value)}
                        placeholder="VD: 25-30"
                        className="w-full px-3 py-2 pr-10 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs pointer-events-none">
                        °C
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
