"use client";

import React from "react";
import { useParams } from "next/navigation";
import {
  SupervisorProfile,
  useSupervisorProfile,
} from "@/components/features/supervisors";

export default function SupervisorProfilePage() {
  const { id } = useParams();
  const { supervisor, isLoading, error } = useSupervisorProfile(id as string);

  if (isLoading) {
    return (
      <div className="supervisor-detail-page">
        <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center min-h-[400px]">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-600 mx-auto mb-4"></div>
            <p className="text-xl font-semibold text-gray-700">
              Đang tải thông tin...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !supervisor) {
    return (
      <div className="supervisor-detail-page">
        <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center min-h-[400px]">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md mx-auto">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Không tìm thấy
            </h2>
            <p className="text-gray-600 mb-6">
              Giám sát viên này không tồn tại hoặc đã bị xóa.
            </p>
            <button
              onClick={() => window.history.back()}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              ← Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <SupervisorProfile supervisor={supervisor} />;
}
