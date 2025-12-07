"use client";

import React from "react";
import { useParams } from "next/navigation";
import Header from "@/components/layout/Header";
import {
  SupervisorProfile,
  useSupervisorProfile,
} from "@/components/features/supervisors";

export default function SupervisorProfilePage() {
  const { id } = useParams();
  const { supervisor, isLoading, error } = useSupervisorProfile(id as string);

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-[calc(100vh-4rem)] bg-white text-gray-700 pt-20">
          <div className="max-w-6xl mx-auto px-4 py-10">
            <div className="bg-white backdrop-blur-xl rounded-xl border border-gray-200 shadow-lg p-8 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#38c1b6] mx-auto mb-4"></div>
              <p className="text-xl font-semibold text-gray-700">
                Đang tải thông tin...
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !supervisor) {
    return (
      <>
        <Header />
        <div className="min-h-[calc(100vh-4rem)] bg-white text-gray-700 pt-20">
          <div className="max-w-6xl mx-auto px-4 py-10">
            <div className="bg-white backdrop-blur-xl rounded-xl border border-gray-200 shadow-lg p-8 text-center max-w-md mx-auto">
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Không tìm thấy
              </h2>
              <p className="text-gray-600 mb-6">
                Giám sát viên này không tồn tại hoặc đã bị xóa.
              </p>
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-[#38c1b6] to-[#667eea] text-white px-6 py-3 font-semibold hover:opacity-90 transition shadow-lg hover:shadow-xl"
              >
                ← Quay lại
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <SupervisorProfile supervisor={supervisor} />
    </>
  );
}
