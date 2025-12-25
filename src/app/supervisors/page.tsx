"use client";

import React from "react";
import Header from "@/components/layout/Header";
import {
  SupervisorSearch,
  SupervisorList,
  useSupervisors,
} from "@/components/features/supervisors";
import type { SupervisorFilters } from "@/components/features/supervisors";

export default function SupervisorsPage() {
  const { supervisors, isLoading, searchSupervisors } = useSupervisors();

  const handleSearch = (filters: SupervisorFilters) => {
    searchSupervisors(filters);
  };

  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 text-gray-800 pt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-8 text-center">
            <div className="inline-block mb-4">
              <span className="text-5xl">👷</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-[#38c1b6] via-[#4ecdc4] to-[#667eea] bg-clip-text text-transparent mb-4">
              Danh sách giám sát viên
            </h1>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
              Tìm kiếm và kết nối với các giám sát viên chuyên nghiệp.
              <br className="hidden md:block" />
              <span className="md:inline hidden"> </span>
              Đảm bảo chất lượng công trình với đội ngũ giám sát uy tín.
            </p>
          </div>

          {/* Search Component */}
          <SupervisorSearch onSearch={handleSearch} isLoading={isLoading} />

          {/* Results Section */}
          <div className="space-y-6 mt-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">
                  Kết quả tìm kiếm
                </h2>
                <p className="text-gray-500 text-sm">
                  Tìm thấy <span className="font-semibold text-[#38c1b6]">{supervisors.length}</span> giám sát viên
                </p>
              </div>
            </div>

            <SupervisorList supervisors={supervisors} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </>
  );
}
