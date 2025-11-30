"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import {
  projectsApi,
  type ProjectResponseDto,
} from "@/lib/projects/projects.api";
import QuotesSection from "./QuotesSection";
import InvitesSection from "./InvitesSection";
import ContractsSection from "./ContractsSection";
import MilestonesSection from "./MilestonesSection";
import ContractorMilestonesSection from "./ContractorMilestonesSection";

export default function ProjectsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectResponseDto[]>([]);
  const [activeTab, setActiveTab] = useState<
    "projects" | "quotes" | "invites" | "contracts" | "milestones"
  >("projects");

  const params = useSearchParams();
  useEffect(() => {
    const tab = (params.get("tab") || "projects").toLowerCase();
    if (
      tab === "projects" ||
      tab === "quotes" ||
      tab === "invites" ||
      tab === "contracts" ||
      tab === "milestones"
    )
      setActiveTab(tab as any);
  }, [params]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectsApi.getMyProjects();
      setProjects(data);
    } catch (e: any) {
      setError(
        e?.response?.data?.message || e?.message || "Failed to load projects"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "Chưa có";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Ngày không hợp lệ";
      return date.toLocaleDateString("vi-VN");
    } catch (error) {
      return "Ngày không hợp lệ";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "text-green-600 bg-green-50 border-green-200";
      case "completed":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "onhold":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "draft":
        return "text-gray-600 bg-gray-50 border-gray-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  if (loading)
    return (
      <>
        <Header />
        <div className="min-h-[calc(100vh-4rem)] bg-white text-gray-700 pt-20">
          <div className="max-w-6xl mx-auto px-4 py-10">
            <div className="text-gray-500">Loading projects...</div>
          </div>
        </div>
      </>
    );

  if (error)
    return (
      <>
        <Header />
        <div className="min-h-[calc(100vh-4rem)] bg-white text-gray-700 pt-20">
          <div className="max-w-6xl mx-auto px-4 py-10">
            <div className="text-red-600">{error}</div>
          </div>
        </div>
      </>
    );

  const cardCls =
    "bg-white backdrop-blur-xl rounded-xl border border-gray-200 shadow-lg p-5 text-gray-700 hover:shadow-xl transition-shadow";
  const titleCls =
    "text-xl font-semibold bg-gradient-to-r from-[#38c1b6] to-[#667eea] bg-clip-text text-transparent tracking-wide";
  const btnPrimary =
    "inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-[#38c1b6] to-[#667eea] text-white px-4 py-2 font-semibold hover:opacity-90 transition shadow-lg hover:shadow-xl";

  return (
    <>
      <Header />
      <div className="min-h-[100vh] bg-white text-gray-700 pt-20">
        <div className="max-w-6xl mx-auto px-4 py-10">
          {activeTab === "projects" && (
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-[#38c1b6] to-[#667eea] bg-clip-text text-transparent">
                Dự án của tôi
              </h1>
              <Link href="/projects/create" className={btnPrimary}>
                Tạo dự án mới
              </Link>
            </div>
          )}

          {activeTab === "projects" &&
            (projects.length === 0 ? (
              <div className={cardCls}>
                <div className="text-center py-12">
                  <div className="text-2xl text-gray-400 mb-4">
                    Chưa có dự án nào
                  </div>
                  <div className="text-gray-500 mb-6">
                    Bắt đầu tạo dự án đầu tiên của bạn
                  </div>
                  <Link href="/projects/create" className={btnPrimary}>
                    Tạo dự án đầu tiên
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <div key={project.id} className={cardCls}>
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                        {project.name}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          project.status
                        )}`}
                      >
                        {project.status}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {project.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm">
                        <span className="text-gray-500 w-20">Địa chỉ:</span>
                        <span className="text-gray-700">{project.address}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="text-gray-500 w-20">Diện tích:</span>
                        <span className="text-gray-700">
                          {project.floorArea}m²
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="text-gray-500 w-20">Số tầng:</span>
                        <span className="text-gray-700">
                          {project.numberOfFloors}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="text-gray-500 w-20">Ngân sách:</span>
                        <span className="text-gray-700">
                          {formatCurrency(project.budget)}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="text-gray-500 w-20">
                          Ngày bắt đầu:
                        </span>
                        <span className="text-gray-700">
                          {formatDate(project.startDate)}
                        </span>
                      </div>
                      {project.estimatedCompletionDate && (
                        <div className="flex items-center text-sm">
                          <span className="text-gray-500 w-20">Dự kiến:</span>
                          <span className="text-gray-700">
                            {formatDate(project.estimatedCompletionDate)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <div className="text-xs text-gray-500">
                        Tạo: {formatDate(project.createdAt)}
                      </div>
                      <Link
                        href={`/projects/${project.id}`}
                        className="text-[#38c1b6] hover:text-[#667eea] text-sm font-medium transition"
                      >
                        Xem chi tiết →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ))}

          {activeTab === "quotes" && (
            <QuotesSection
              projects={projects}
              onSwitchTab={(tab: string) => setActiveTab(tab as any)}
            />
          )}

          {activeTab === "invites" && <InvitesSection />}
          {activeTab === "contracts" && <ContractsSection />}
          {activeTab === "milestones" &&
            // Render homeowner vs contractor view by role stored in local user
            typeof window !== "undefined" &&
            (() => {
              try {
                const u = localStorage.getItem("user");
                const role = u ? JSON.parse(u).role : null;
                return role === 2 ? (
                  <ContractorMilestonesSection />
                ) : (
                  <MilestonesSection />
                );
              } catch {
                return <MilestonesSection />;
              }
            })()}
        </div>
      </div>
    </>
  );
}
