"use client";

import React from "react";
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
    <div className="supervisors-page">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 text-white" style={{ marginTop: '-80px', paddingTop: '80px' }}>
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              DANH SÁCH GIÁM SÁT VIÊN
            </h1>
            <p className="text-xl md:text-2xl text-slate-200 leading-relaxed">
              Tìm kiếm và kết nối với các giám sát viên chuyên nghiệp.
              <br />
              Đảm bảo chất lượng công trình với đội ngũ giám sát uy tín.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Search Component */}
        <SupervisorSearch onSearch={handleSearch} isLoading={isLoading} />

        {/* Results Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              Kết quả tìm kiếm ({supervisors.length})
            </h2>
          </div>

          <SupervisorList supervisors={supervisors} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
