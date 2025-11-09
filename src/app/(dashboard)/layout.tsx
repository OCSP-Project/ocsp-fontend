// src/app/(dashboard)/layout.tsx
"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuthContext } from "@/providers";
import { UserRole } from "@/hooks/useAuth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuthContext();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (!user) return null;

  const isAdmin = user.role === UserRole.Admin;
  const isSupervisor = user.role === UserRole.Supervisor;
  const isContractor = user.role === UserRole.Contractor;
  const isHomeowner = user.role === UserRole.Homeowner;

  const handleLogout = () => {
    logout();
  };

  // Active cho ?tab=
  const getActiveTabClass = (tab: string) => {
    return searchParams.get("tab") === tab
      ? "block px-3 py-2 rounded-md bg-blue-50 text-blue-700 border-r-2 border-blue-700"
      : "block px-3 py-2 rounded-md hover:bg-stone-100 text-stone-700";
  };

  // Active cho path bình thường
  const getActivePathClass = (path: string) => {
    return pathname === path
      ? "block px-3 py-2 rounded-md bg-blue-50 text-blue-700 border-r-2 border-blue-700"
      : "block px-3 py-2 rounded-md hover:bg-stone-100 text-stone-700";
  };

  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr] bg-gray-50">
      <aside className="bg-white border-r p-4 flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <h2 className="font-bold text-gray-900">OCSP Construction</h2>
          <p className="text-xs text-gray-500">{user.username}</p>
        </div>

        {/* Navigation */}
        <nav className="space-y-6 flex-1">
          {/* Contractor & Homeowner dùng ?tab= */}
          {(isContractor || isHomeowner) && (
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Dự án
              </div>
              <div className="space-y-1">
                <Link
                  href="/projects?tab=projects"
                  className={getActiveTabClass("projects")}
                >
                  📊 Projects
                </Link>

                {isContractor ? (
                  <>
                    <Link
                      href="/projects?tab=invites"
                      className={getActiveTabClass("invites")}
                    >
                      💼 Invites & Proposals
                    </Link>
                    <Link
                      href="/projects?tab=contracts"
                      className={getActiveTabClass("contracts")}
                    >
                      📋 Contracts
                    </Link>
                    <Link
                      href="/projects?tab=milestones"
                      className={getActiveTabClass("milestones")}
                    >
                      📆 Milestones
                    </Link>
                    <Link
                      href="/contractor/posts"
                      className={getActivePathClass("/contractor/posts")}
                    >
                      📝 Bài đăng
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/projects?tab=quotes"
                      className={getActiveTabClass("quotes")}
                    >
                      💰 Quotes & Proposals
                    </Link>
                    <Link
                      href="/projects?tab=contracts"
                      className={getActiveTabClass("contracts")}
                    >
                      📋 Contracts
                    </Link>
                    <Link
                      href="/projects?tab=milestones"
                      className={getActiveTabClass("milestones")}
                    >
                      📆 Milestones
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Admin giữ nguyên route */}
          {isAdmin && (
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Quản lý hệ thống
              </div>
              <div className="space-y-1">
                <Link
                  href="/admin/users"
                  className={getActivePathClass("/admin/users")}
                >
                  👥 Người dùng
                </Link>
                <Link
                  href="/admin/projects"
                  className={getActivePathClass("/admin/projects")}
                >
                  🏗️ Dự án
                </Link>
                <Link
                  href="/admin/reports"
                  className={getActivePathClass("/admin/reports")}
                >
                  📈 Báo cáo
                </Link>
                <Link
                  href="/admin/settings"
                  className={getActivePathClass("/admin/settings")}
                >
                  ⚙️ Cài đặt
                </Link>
              </div>
            </div>
          )}

          {/* Supervisor giữ nguyên route */}
          {isSupervisor && (
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Giám sát & Kiểm tra
              </div>
              <div className="space-y-1">
                <Link
                  href="/supervisor/projects"
                  className={getActivePathClass("/supervisor/projects")}
                >
                  🏗️ Dự án giám sát
                </Link>
                <Link
                  href="/projects?tab=contracts"
                  className={getActiveTabClass("contracts")}
                >
                  📋 Contracts
                </Link>
                <Link
                  href="/supervisor/inspections"
                  className={getActivePathClass("/supervisor/inspections")}
                >
                  ✅ Kiểm tra
                </Link>
                <Link
                  href="/supervisor/reports"
                  className={getActivePathClass("/supervisor/reports")}
                >
                  📊 Báo cáo
                </Link>
                <Link
                  href="/supervisor/schedule"
                  className={getActivePathClass("/supervisor/schedule")}
                >
                  📅 Lịch làm việc
                </Link>
              </div>
            </div>
          )}

          {/* Common Navigation */}
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Cá nhân
            </div>
            <div className="space-y-1">
              <Link href="/profile" className={getActivePathClass("/profile")}>
                👤 Hồ sơ
              </Link>
              <Link
                href="/notifications"
                className={getActivePathClass("/notifications")}
              >
                🔔 Thông báo
              </Link>
              <Link
                href="/settings"
                className={getActivePathClass("/settings")}
              >
                ⚙️ Cài đặt
              </Link>
            </div>
          </div>
        </nav>

        {/* User Section */}
        <div className="border-t pt-4 mt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user.username.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.username}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-500 transition-colors p-1"
              title="Đăng xuất"
            >
              ⎋
            </button>
          </div>
        </div>
      </aside>

      <main className="overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
