"use client";

import { useEffect, useState } from "react";
import {
  filterSupervisors,
  SupervisorListItemDto,
} from "@/lib/api/supervisors";
import Link from "next/link";

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

export default function SupervisorsPage() {
  const [supervisors, setSupervisors] = useState<SupervisorListItemDto[]>([]);
  const [district, setDistrict] = useState("");
  const [minRating, setMinRating] = useState<number | undefined>();
  const [availableNow, setAvailableNow] = useState(false);
  const [priceMin, setPriceMin] = useState<number | undefined>();
  const [priceMax, setPriceMax] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  async function load() {
    setIsLoading(true);
    try {
      const res = await filterSupervisors({
        district: district || undefined,
        minRating: minRating || undefined,
        availableNow,
        priceMin: priceMin || undefined,
        priceMax: priceMax || undefined,
        page: 1,
        pageSize: 10,
      });
      setSupervisors(res.items);
    } catch (error) {
      console.error("Failed to load supervisors", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const clearFilters = () => {
    setDistrict("");
    setMinRating(undefined);
    setPriceMin(undefined);
    setPriceMax(undefined);
    setAvailableNow(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              DANH SÁCH GIÁM SÁT VIÊN
            </h1>
            <p className="text-xl md:text-2xl text-amber-100 leading-relaxed">
              Tìm kiếm và kết nối với các giám sát viên chuyên nghiệp.
              <br />
              Đảm bảo chất lượng công trình với đội ngũ giám sát uy tín.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Bộ lọc */}
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
            <label htmlFor="availableNow" className="text-sm font-medium text-gray-700">
              Chỉ hiển thị những người có thể làm việc ngay
            </label>
          </div>

          <button
            onClick={load}
            disabled={isLoading}
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? "Đang tìm kiếm..." : "🔍 Tìm kiếm giám sát viên"}
          </button>
        </div>

        {/* Kết quả */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              Kết quả tìm kiếm ({supervisors.length})
            </h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
          ) : supervisors.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-amber-200">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Không tìm thấy giám sát viên nào
              </h3>
              <p className="text-gray-600">
                Hãy thử điều chỉnh bộ lọc để tìm kiếm với điều kiện khác
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {supervisors.map((s) => (
                <div
                  key={s.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl p-6 border border-amber-200 transform hover:scale-105 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">
                        {s.username}
                      </h3>
                      <p className="text-gray-600 text-sm break-all">{s.email}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {s.username.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">📍</span>
                      <span className="text-gray-700 font-medium">
                        {s.district || "Chưa cập nhật"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-2xl">⭐</span>
                      <span className="text-gray-700 font-medium">
                        {s.rating ? `${s.rating}/5` : "Chưa có đánh giá"} 
                        <span className="text-gray-500 ml-1">
                          ({s.reviewsCount || 0} đánh giá)
                        </span>
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/supervisors/${s.id}`}
                    className="block w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-center py-3 px-4 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    👁️ Xem hồ sơ chi tiết
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}