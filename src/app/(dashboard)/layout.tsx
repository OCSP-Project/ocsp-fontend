// src/app/(dashboard)/layout.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import { useAuthContext } from "@/providers";
import { UserRole } from "@/hooks/useAuth";
import { usePendingRegistrationRequests } from "@/hooks/usePendingRegistrationRequests";
import { Tag } from "antd";
import {
  FolderOpen,
  Mail,
  FileText,
  MessageSquare,
  Building,
  Users,
  BarChart3,
  Settings,
  User,
  Shield,
  Home,
  Briefcase,
  Calendar,
  CheckCircle,
  Bell,
  TrendingUp,
  Wrench,
  Eye,
  Plus,
  Search,
  Star,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuthContext();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { pendingCount } = usePendingRegistrationRequests();

  // State để quản lý collapse/expand của các section
  const [collapsedSections, setCollapsedSections] = useState<{
    [key: string]: boolean;
  }>({
    projectManagement: false,
    contact: false,
    admin: false,
    supervisor: false,
    aiConsultant: false,
    personal: false,
  });

  const toggleSection = (sectionKey: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  if (!user) return null;

  const isAdmin = user.role === UserRole.Admin;
  const isSupervisor = user.role === UserRole.Supervisor;
  const isContractor = user.role === UserRole.Contractor;
  const isHomeowner = user.role === UserRole.Homeowner;

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const getPageTitle = () => {
    if (pathname.startsWith("/admin")) {
      if (pathname === "/admin") return "Bảng điều khiển";
      if (pathname === "/admin/users") return "Quản lý người dùng";
      if (pathname === "/admin/projects") return "Quản lý dự án";
      if (pathname === "/admin/news") return "Quản lý tin tức";
      if (pathname.startsWith("/admin/reports")) return "Báo cáo";
      if (pathname.startsWith("/admin/settings")) return "Cài đặt";
      return "Quản lý hệ thống";
    }
    if (pathname.startsWith("/supervisor")) {
      return "Giám sát & Kiểm tra";
    }
    if (pathname.startsWith("/contractor")) {
      return "Thầu xây dựng";
    }
    if (pathname.startsWith("/projects")) {
      return "Dự án";
    }
    return "Bảng điều khiển";
  };

  // Active cho ?tab=
  const getActiveTabClass = (tab: string) => {
    return searchParams.get("tab") === tab
      ? "block px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#38c1b6]/10 to-[#667eea]/10 text-[#38c1b6] font-semibold border-l-4 border-[#38c1b6] transition-all"
      : "block px-4 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-[#38c1b6] transition-all";
  };

  // Active cho path bình thường
  const getActivePathClass = (path: string) => {
    return pathname === path
      ? "block px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#38c1b6]/10 to-[#667eea]/10 text-[#38c1b6] font-semibold border-l-4 border-[#38c1b6] transition-all"
      : "block px-4 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-[#38c1b6] transition-all";
  };

  // Component để render section có thể collapse
  const CollapsibleSection = ({
    sectionKey,
    title,
    children,
  }: {
    sectionKey: string;
    title: string;
    children: React.ReactNode;
  }) => {
    const isCollapsed = collapsedSections[sectionKey];

    return (
      <div>
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 px-4 py-2.5 hover:bg-gray-50 hover:text-[#38c1b6] rounded-lg transition-all group"
        >
          <span className="font-semibold">{title}</span>
          <svg
            className={`w-5 h-5 text-gray-500 transition-all duration-200 ${
              isCollapsed ? "rotate-0" : "rotate-90"
            } group-hover:text-[#38c1b6]`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isCollapsed ? "max-h-0 opacity-0" : "max-h-[1000px] opacity-100"
          }`}
        >
          <div className="space-y-1">{children}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-white relative">
      {/* Teal glow effect */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at top left, rgba(56, 193, 182, 0.5), transparent 70%),
              radial-gradient(circle at bottom right, rgba(102, 126, 234, 0.3), transparent 70%)
            `,
            filter: "blur(80px)",
            backgroundRepeat: "no-repeat",
          }}
        />
      </div>
      <Header />
      <div className="flex-1 flex relative z-10">
        {/* Sidebar */}
        <aside className="w-64 bg-white/95 backdrop-blur-xl border-r border-gray-200 pt-20 px-4 flex flex-col shadow-sm">
          {/* Sidebar Header */}
          <div className="mb-8 pb-4 border-b border-gray-200">
            <h2 className="font-bold text-lg bg-gradient-to-r from-[#38c1b6] to-[#667eea] bg-clip-text text-transparent">
              OCSP Construction
            </h2>
            <p className="text-xs text-gray-600 mt-1 font-medium">
              {user.username}
            </p>
            <p className="text-xs text-[#38c1b6] mt-0.5 font-medium">
              {user.role === UserRole.Admin && "Quản trị viên"}
              {user.role === UserRole.Supervisor && "Giám sát viên"}
              {user.role === UserRole.Contractor && "Thầu xây dựng"}
              {user.role === UserRole.Homeowner && "Chủ nhà"}
            </p>
          </div>

          {/* Navigation */}
          <nav className="space-y-6 flex-1 overflow-y-auto">
            {/* Contractor & Homeowner */}
            {(isContractor || isHomeowner) && (
              <CollapsibleSection
                sectionKey="projectManagement"
                title="Quản lý dự án"
              >
                <Link
                  href="/projects?tab=projects"
                  className={getActiveTabClass("projects")}
                >
                  <div className="flex items-center">
                    <FolderOpen className="w-4 h-4 mr-2" />
                    Dự án
                  </div>
                </Link>

                {isContractor ? (
                  <>
                    <Link
                      href="/projects?tab=invites"
                      className={getActiveTabClass("invites")}
                    >
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        Lời mời & Đề xuất
                      </div>
                    </Link>
                    <Link
                      href="/projects?tab=contracts"
                      className={getActiveTabClass("contracts")}
                    >
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-2" />
                        Hợp đồng
                      </div>
                    </Link>
                    {/* <Link
                      href="/projects?tab=milestones"
                      className={getActiveTabClass("milestones")}
                    >
                      Cột mốc
                    </Link> */}
                    <Link
                      href="/contractor/posts"
                      className={getActivePathClass("/contractor/posts")}
                    >
                      <div className="flex items-center">
                        <Plus className="w-4 h-4 mr-2" />
                        Bài đăng
                      </div>
                    </Link>
                    <Link
                      href="/contractor/company"
                      className={getActivePathClass("/contractor/company")}
                    >
                      <div className="flex items-center">
                        <Building className="w-4 h-4 mr-2" />
                        Thông tin công ty
                      </div>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/projects?tab=quotes"
                      className={getActiveTabClass("quotes")}
                    >
                      <div className="flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Báo giá & Đề xuất
                      </div>
                    </Link>
                    <Link
                      href="/projects?tab=contracts"
                      className={getActiveTabClass("contracts")}
                    >
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-2" />
                        Hợp đồng
                      </div>
                    </Link>
                    {/* <Link
                      href="/projects?tab=milestones"
                      className={getActiveTabClass("milestones")}
                    >
                      Cột mốc
                    </Link> */}
                  </>
                )}
              </CollapsibleSection>
            )}

            {/* Chat - For Contractor */}
            {isContractor && (
              <CollapsibleSection sectionKey="contact" title="Liên hệ">
                <Link
                  href="/contractor/chat"
                  className={getActivePathClass("/contractor/chat")}
                >
                  <div className="flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Chat
                  </div>
                </Link>
              </CollapsibleSection>
            )}

            {/* Admin */}
            {isAdmin && (
              <CollapsibleSection sectionKey="admin" title="Quản trị hệ thống">
                <Link href="/admin" className={getActivePathClass("/admin")}>
                  <div className="flex items-center">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Bảng điều khiển
                  </div>
                </Link>
                <div className="flex items-center gap-2">
                  <Link
                    href="/admin/users"
                    className={`${getActivePathClass("/admin/users")} flex-1`}
                  >
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Người dùng
                    </div>
                  </Link>
                  {isAdmin && pendingCount > 0 && (
                    <Tag
                      color="orange"
                      className="!rounded-full !px-2 !py-0 !text-xs !border-orange-400/30"
                    >
                      {pendingCount}
                    </Tag>
                  )}
                </div>
                <Link
                  href="/admin/projects"
                  className={getActivePathClass("/admin/projects")}
                >
                  <div className="flex items-center">
                    <FolderOpen className="w-4 h-4 mr-2" />
                    Quản lý dự án
                  </div>
                </Link>
                <Link
                  href="/admin/news"
                  className={getActivePathClass("/admin/news")}
                >
                  <div className="flex items-center">
                    <Bell className="w-4 h-4 mr-2" />
                    Quản lý tin tức
                  </div>
                </Link>
                <Link
                  href="/admin/reports"
                  className={getActivePathClass("/admin/reports")}
                >
                  <div className="flex items-center">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Báo cáo
                  </div>
                </Link>
                <Link
                  href="/admin/settings"
                  className={getActivePathClass("/admin/settings")}
                >
                  <div className="flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    Cài đặt hệ thống
                  </div>
                </Link>
              </CollapsibleSection>
            )}

            {/* Supervisor */}
            {isSupervisor && (
              <CollapsibleSection
                sectionKey="supervisor"
                title="Giám sát công trình"
              >
                <Link
                  href="/supervisor/projects"
                  className={getActivePathClass("/supervisor/projects")}
                >
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-2" />
                    Dự án giám sát
                  </div>
                </Link>
                <Link
                  href="/projects?tab=contracts"
                  className={getActiveTabClass("contracts")}
                >
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Hợp đồng
                  </div>
                </Link>
                <Link
                  href="/supervisor/inspections"
                  className={getActivePathClass("/supervisor/inspections")}
                >
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Kiểm tra chất lượng
                  </div>
                </Link>
                <Link
                  href="/supervisor/reports"
                  className={getActivePathClass("/supervisor/reports")}
                >
                  <div className="flex items-center">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Báo cáo giám sát
                  </div>
                </Link>
                <Link
                  href="/supervisor/schedule"
                  className={getActivePathClass("/supervisor/schedule")}
                >
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Lịch làm việc
                  </div>
                </Link>
              </CollapsibleSection>
            )}

            {/* Contact - For Supervisor */}
            {isSupervisor && (
              <CollapsibleSection sectionKey="contactSupervisor" title="Liên hệ">
                <Link
                  href="/chat"
                  className={getActivePathClass("/chat")}
                >
                  <div className="flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Tin nhắn
                  </div>
                </Link>
              </CollapsibleSection>
            )}

            {/* Chat - Only for Homeowner */}
            {isHomeowner && (
              <CollapsibleSection sectionKey="contact" title="Liên hệ">
                <Link href="/chat" className={getActivePathClass("/chat")}>
                  <div className="flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Tin nhắn
                  </div>
                </Link>
              </CollapsibleSection>
            )}

            {/* AI Consultant - For All Users */}
            <CollapsibleSection sectionKey="aiConsultant" title="Trợ lý AI">
              <Link
                href="/ai-consultant"
                className={getActivePathClass("/ai-consultant")}
              >
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-2" />
                  AI Tư vấn Xây dựng
                </div>
              </Link>
            </CollapsibleSection>

            {/* Common Navigation */}
            <CollapsibleSection sectionKey="personal" title="Cá nhân">
              <Link href="/profile" className={getActivePathClass("/profile")}>
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Hồ sơ cá nhân
                </div>
              </Link>
              {/* <Link
                href="/notifications"
                className={getActivePathClass("/notifications")}
              >
                Thông báo
              </Link>
              <Link
                href="/settings"
                className={getActivePathClass("/settings")}
              >
                Cài đặt tài khoản
              </Link> */}
            </CollapsibleSection>
          </nav>

          {/* Logout Button */}
          <div className="mt-auto pt-4 pb-6 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all font-semibold border border-red-200"
            >
              Đăng xuất
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-white/50">
          <div>{children}</div>
        </main>
      </div>
    </div>
  );
}
