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
    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-amber-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Bộ lọc tìm kiếm</h2>
        <button
          onClick={clearFilters}
          className="text-amber-600 hover:text-amber-700 font-medium underline transition-colors"
        >
          Xóa tất cả bộ lọc
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        {/* Chọn Quận */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Quận/Huyện
          </label>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full border-2 border-amber-200 rounded-xl p-3 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
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
          <label className="block text-sm font-semibold text-gray-700">
            Đánh giá tối thiểu
          </label>
          <select
            value={minRating || ""}
            onChange={(e) =>
              setMinRating(e.target.value ? Number(e.target.value) : undefined)
            }
            className="w-full border-2 border-amber-200 rounded-xl p-3 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
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
          <label className="block text-sm font-semibold text-gray-700">
            Giá tối thiểu (VNĐ)
          </label>
          <input
            type="number"
            placeholder="0"
            value={priceMin || ""}
            onChange={(e) => setPriceMin(Number(e.target.value) || undefined)}
            className="w-full border-2 border-amber-200 rounded-xl p-3 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
          />
        </div>

        {/* Giá tối đa */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Giá tối đa (VNĐ)
          </label>
          <input
            type="number"
            placeholder="Không giới hạn"
            value={priceMax || ""}
            onChange={(e) => setPriceMax(Number(e.target.value) || undefined)}
            className="w-full border-2 border-amber-200 rounded-xl p-3 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
          />
        </div>
      </div>

      {/* Available now checkbox */}
      <div className="flex items-center gap-3 mb-6">
        <input
          type="checkbox"
          id="availableNow"
          checked={availableNow}
          onChange={(e) => setAvailableNow(e.target.checked)}
          className="w-5 h-5 text-amber-600 border-2 border-amber-300 rounded focus:ring-amber-500"
        />
        <label
          htmlFor="availableNow"
          className="text-sm font-medium text-gray-700"
        >
          Chỉ hiển thị những người có thể làm việc ngay
        </label>
      </div>

      <button
        onClick={handleSearch}
        disabled={isLoading}
        className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isLoading ? "Đang tìm kiếm..." : "🔍 Tìm kiếm giám sát viên"}
      </button>
    </div>
  );
};

export default SupervisorSearch;
