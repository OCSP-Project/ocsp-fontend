"use client";

import React, { useState } from "react";

const DISTRICTS = [
  "Hải Châu",
  "Thanh Khê",
  "Sơn Trà",
  "Ngũ Hành Sơn",
  "Liên Chiểu",
  "Cẩm Lệ",
  "Hoà Vang",
  "Hoàng Sa",
];

interface SupervisorSearchProps {
  onSearch: (filters: SupervisorFilters) => void;
  isLoading?: boolean;
}

export interface SupervisorFilters {
  district: string;
  minRating: number | undefined;
  availableNow: boolean;
  priceMin: number | undefined;
  priceMax: number | undefined;
}

const SupervisorSearch: React.FC<SupervisorSearchProps> = ({
  onSearch,
  isLoading = false,
}) => {
  const [district, setDistrict] = useState("");
  const [minRating, setMinRating] = useState<number | undefined>();
  const [availableNow, setAvailableNow] = useState(false);
  const [priceMin, setPriceMin] = useState<number | undefined>();
  const [priceMax, setPriceMax] = useState<number | undefined>();

  const clearFilters = () => {
    setDistrict("");
    setMinRating(undefined);
    setPriceMin(undefined);
    setPriceMax(undefined);
    setAvailableNow(false);
  };

  const handleSearch = () => {
    onSearch({
      district,
      minRating,
      availableNow,
      priceMin,
      priceMax,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 md:p-8 mb-8 relative overflow-hidden">
      {/* Decorative gradient background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#38c1b6]/5 to-[#667eea]/5 rounded-full -mr-32 -mt-32"></div>
      
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-[#38c1b6] to-[#667eea] bg-clip-text text-transparent tracking-tight mb-1">
              🔍 Bộ lọc tìm kiếm
            </h2>
            <p className="text-sm text-gray-500">Tìm kiếm giám sát viên phù hợp với yêu cầu của bạn</p>
          </div>
          <button
            onClick={clearFilters}
            className="text-[#38c1b6] hover:text-[#667eea] font-medium text-sm underline transition-colors whitespace-nowrap"
          >
            Xóa tất cả bộ lọc
          </button>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        {/* Chọn Quận */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            📍 Quận/Huyện
          </label>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-lg p-3 focus:border-[#38c1b6] focus:ring-2 focus:ring-[#38c1b6]/20 transition-all bg-white hover:border-gray-300"
          >
            <option value="">-- Chọn Quận --</option>
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Min rating */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            ⭐ Đánh giá tối thiểu
          </label>
          <select
            value={minRating || ""}
            onChange={(e) =>
              setMinRating(e.target.value ? Number(e.target.value) : undefined)
            }
            className="w-full border-2 border-gray-200 rounded-lg p-3 focus:border-[#38c1b6] focus:ring-2 focus:ring-[#38c1b6]/20 transition-all bg-white hover:border-gray-300"
          >
            <option value="">-- Chọn rating --</option>
            {[1, 2, 3, 4, 5].map((r) => (
              <option key={r} value={r}>
                {r} sao trở lên
              </option>
            ))}
          </select>
        </div>

        {/* Giá tối thiểu */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            💰 Giá tối thiểu (VNĐ)
          </label>
          <input
            type="number"
            placeholder="0"
            value={priceMin || ""}
            onChange={(e) => setPriceMin(Number(e.target.value) || undefined)}
            className="w-full border-2 border-gray-200 rounded-lg p-3 focus:border-[#38c1b6] focus:ring-2 focus:ring-[#38c1b6]/20 transition-all bg-white hover:border-gray-300"
          />
        </div>

        {/* Giá tối đa */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            💰 Giá tối đa (VNĐ)
          </label>
          <input
            type="number"
            placeholder="Không giới hạn"
            value={priceMax || ""}
            onChange={(e) => setPriceMax(Number(e.target.value) || undefined)}
            className="w-full border-2 border-gray-200 rounded-lg p-3 focus:border-[#38c1b6] focus:ring-2 focus:ring-[#38c1b6]/20 transition-all bg-white hover:border-gray-300"
          />
        </div>
      </div>

      {/* Available now checkbox */}
      <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <input
          type="checkbox"
          id="availableNow"
          checked={availableNow}
          onChange={(e) => setAvailableNow(e.target.checked)}
          className="w-5 h-5 text-[#38c1b6] border-2 border-gray-300 rounded focus:ring-2 focus:ring-[#38c1b6] cursor-pointer"
        />
        <label
          htmlFor="availableNow"
          className="text-sm font-medium text-gray-700 cursor-pointer flex-1"
        >
          ✅ Chỉ hiển thị những người có thể làm việc ngay
        </label>
      </div>

      <button
        onClick={handleSearch}
        disabled={isLoading}
        className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#38c1b6] to-[#667eea] text-white px-8 py-3.5 font-semibold hover:from-[#2fb3a8] hover:to-[#5568d3] transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Đang tìm kiếm...
          </>
        ) : (
          <>
            <span className="mr-2">🔍</span>
            Tìm kiếm giám sát viên
          </>
        )}
      </button>
      </div>
    </div>
  );
};

export default SupervisorSearch;
