// src/app/(dashboard)/layout.tsx
"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import { useAuthContext } from "@/providers";
import { UserRole } from "@/hooks/useAuth";
import { usePendingRegistrationRequests } from "@/hooks/usePendingRegistrationRequests";
import { Tag } from "antd";

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
      ? "block px-4 py-2.5 rounded-lg bg-gradient-to-r from-teal-100 to-purple-100 text-teal-700 font-semibold border-l-4 border-teal-500 transition-all shadow-sm"
      : "block px-4 py-2.5 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-teal-600 transition-all";
  };

  // Active cho path bình thường
  const getActivePathClass = (path: string) => {
    return pathname === path
      ? "block px-4 py-2.5 rounded-lg bg-gradient-to-r from-teal-100 to-purple-100 text-teal-700 font-semibold border-l-4 border-teal-500 transition-all shadow-sm"
      : "block px-4 py-2.5 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-teal-600 transition-all";
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-teal-50 via-white to-purple-50">
      <Header />
      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white/80 backdrop-blur-xl border-r border-teal-100 pt-20 px-4 flex flex-col shadow-sm">
          {/* Sidebar Header */}
          <div className="mb-8 pb-4 border-b border-teal-100">
            <h2 className="font-bold text-lg bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">
              OCSP Construction
            </h2>
            <p className="text-xs text-gray-600 mt-1 font-medium">{user.username}</p>
            <p className="text-xs text-teal-600 mt-0.5 font-medium">
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
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-4">
                  Quản lý dự án
                </div>
                <div className="space-y-1">
                  <Link
                    href="/projects?tab=projects"
                    className={getActiveTabClass("projects")}
                  >
                    Dự án
                  </Link>

                  {isContractor ? (
                    <>
                      <Link
                        href="/projects?tab=invites"
                        className={getActiveTabClass("invites")}
                      >
                        Lời mời & Đề xuất
                      </Link>
                      <Link
                        href="/projects?tab=contracts"
                        className={getActiveTabClass("contracts")}
                      >
                        Hợp đồng
                      </Link>
                      <Link
                        href="/projects?tab=milestones"
                        className={getActiveTabClass("milestones")}
                      >
                        Cột mốc
                      </Link>
                      <Link
                        href="/contractor/posts"
                        className={getActivePathClass("/contractor/posts")}
                      >
                        Bài đăng
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/projects?tab=quotes"
                        className={getActiveTabClass("quotes")}
                      >
                        Báo giá & Đề xuất
                      </Link>
                      <Link
                        href="/projects?tab=contracts"
                        className={getActiveTabClass("contracts")}
                      >
                        Hợp đồng
                      </Link>
                      <Link
                        href="/projects?tab=milestones"
                        className={getActiveTabClass("milestones")}
                      >
                        Cột mốc
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Chat - For Contractor */}
            {isContractor && (
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-4">
                  Liên hệ
                </div>
                <div className="space-y-1">
                  <Link
                    href="/contractor/chat"
                    className={getActivePathClass("/contractor/chat")}
                  >
                    Tin nhắn
                  </Link>
                </div>
              </div>
            )}

            {/* Admin */}
            {isAdmin && (
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-4">
                  Quản trị hệ thống
                </div>
                <div className="space-y-1">
                  <Link href="/admin" className={getActivePathClass("/admin")}>
                    Bảng điều khiển
                  </Link>
                  <div className="flex items-center gap-2">
                    <Link
                      href="/admin/users"
                      className={`${getActivePathClass("/admin/users")} flex-1`}
                    >
                      Người dùng
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
                    Quản lý dự án
                  </Link>
                  <Link
                    href="/admin/reports"
                    className={getActivePathClass("/admin/reports")}
                  >
                    Báo cáo
                  </Link>
                  <Link
                    href="/admin/settings"
                    className={getActivePathClass("/admin/settings")}
                  >
                    Cài đặt hệ thống
                  </Link>
                </div>
              </div>
            )}

            {/* Supervisor */}
            {isSupervisor && (
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-4">
                  Giám sát công trình
                </div>
                <div className="space-y-1">
                  <Link
                    href="/supervisor/projects"
                    className={getActivePathClass("/supervisor/projects")}
                  >
                    Dự án giám sát
                  </Link>
                  <Link
                    href="/projects?tab=contracts"
                    className={getActiveTabClass("contracts")}
                  >
                    Hợp đồng
                  </Link>
                  <Link
                    href="/supervisor/inspections"
                    className={getActivePathClass("/supervisor/inspections")}
                  >
                    Kiểm tra chất lượng
                  </Link>
                  <Link
                    href="/supervisor/reports"
                    className={getActivePathClass("/supervisor/reports")}
                  >
                    Báo cáo giám sát
                  </Link>
                  <Link
                    href="/supervisor/schedule"
                    className={getActivePathClass("/supervisor/schedule")}
                  >
                    Lịch làm việc
                  </Link>
                </div>
              </div>
            )}

            {/* Chat - Only for Homeowner */}
            {isHomeowner && (
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-4">
                  Liên hệ
                </div>
                <div className="space-y-1">
                  <Link href="/chat" className={getActivePathClass("/chat")}>
                    Tin nhắn
                  </Link>
                </div>
              </div>
            )}

            {/* Common Navigation */}
            <div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-4">
                Cá nhân
              </div>
              <div className="space-y-1">
                <Link
                  href="/profile"
                  className={getActivePathClass("/profile")}
                >
                  Hồ sơ cá nhân
                </Link>
                <Link
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
                </Link>
              </div>
            </div>
          </nav>

          {/* Logout Button */}
          <div className="mt-auto pt-4 pb-6 border-t border-teal-100">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all font-semibold shadow-sm"
            >
              Đăng xuất
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div>{children}</div>
        </main>
      </div>
    </div>
  );
}
