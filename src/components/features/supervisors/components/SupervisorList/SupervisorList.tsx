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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (supervisors.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-amber-200">
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
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {supervisors.map((supervisor) => (
        <div
          key={supervisor.id}
          className="bg-white rounded-2xl shadow-lg hover:shadow-2xl p-6 border border-amber-200 transform hover:scale-105 transition-all duration-300"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800 mb-1">
                {supervisor.username}
              </h3>
              <p className="text-gray-600 text-sm break-all">
                {supervisor.email}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
              {supervisor.username.charAt(0).toUpperCase()}
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📍</span>
              <span className="text-gray-700 font-medium">
                {supervisor.district || "Chưa cập nhật"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <span className="text-gray-700 font-medium">
                {supervisor.rating
                  ? `${supervisor.rating}/5`
                  : "Chưa có đánh giá"}
                <span className="text-gray-500 ml-1">
                  ({supervisor.reviewsCount || 0} đánh giá)
                </span>
              </span>
            </div>
          </div>

          <Link
            href={`/supervisors/${supervisor.id}`}
            className="block w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-center py-3 px-4 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            👁️ Xem hồ sơ chi tiết
          </Link>
        </div>
      ))}
    </div>
  );
};

export default SupervisorList;
