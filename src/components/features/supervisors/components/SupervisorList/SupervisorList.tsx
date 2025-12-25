"use client";

import React from "react";
import Link from "next/link";
import { SupervisorListItemDto } from "../../types/supervisor.types";

interface SupervisorListProps {
  supervisors: SupervisorListItemDto[];
  isLoading?: boolean;
}

const SupervisorList: React.FC<SupervisorListProps> = ({
  supervisors,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#38c1b6]"></div>
      </div>
    );
  }

  if (supervisors.length === 0) {
    return (
      <div className="bg-white backdrop-blur-xl rounded-xl border border-gray-200 shadow-lg p-12 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Không tìm thấy giám sát viên nào
        </h3>
        <p className="text-gray-600">
          Hãy thử điều chỉnh bộ lọc để tìm kiếm với điều kiện khác
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {supervisors.map((supervisor) => (
        <div
          key={supervisor.id}
          className="group bg-white rounded-2xl border border-gray-200 shadow-md hover:shadow-2xl p-6 text-gray-700 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
        >
          {/* Gradient accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#38c1b6] via-[#4ecdc4] to-[#667eea]"></div>
          
          <div className="flex items-start justify-between mb-5">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-xl text-gray-900 mb-1 truncate">
                {supervisor.username}
              </h3>
              <p className="text-gray-500 text-sm truncate" title={supervisor.email}>
                {supervisor.email}
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-[#38c1b6] to-[#667eea] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ml-3 flex-shrink-0 ring-2 ring-white">
              {supervisor.username.charAt(0).toUpperCase()}
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg px-3 py-2">
              <span className="text-lg">📍</span>
              <span className="text-gray-700 font-medium truncate">
                {supervisor.district || "Chưa cập nhật"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg px-3 py-2">
              <span className="text-lg">⭐</span>
              <div className="flex items-center gap-2 flex-1">
                <span className="text-gray-700 font-semibold">
                  {supervisor.rating
                    ? `${supervisor.rating.toFixed(1)}/5`
                    : "Chưa có đánh giá"}
                </span>
                {supervisor.reviewsCount && supervisor.reviewsCount > 0 && (
                  <span className="text-gray-500 text-xs">
                    ({supervisor.reviewsCount} đánh giá)
                  </span>
                )}
              </div>
            </div>
          </div>

          <Link
            href={`/supervisors/${supervisor.id}`}
            className="block w-full inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#38c1b6] to-[#667eea] text-white px-4 py-3 font-semibold hover:from-[#2fb3a8] hover:to-[#5568d3] transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02] text-center"
          >
            <span className="mr-2">👁️</span>
            Xem hồ sơ chi tiết
          </Link>
        </div>
      ))}
    </div>
  );
};

export default SupervisorList;