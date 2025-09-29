// src/app/(dashboard)/layout.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthContext } from "@/providers";
import { UserRole } from "@/hooks/useAuth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuthContext();
  const pathname = usePathname();

  if (!user) return null;

  const isAdmin = user.role === UserRole.Admin;
  const isSupervisor = user.role === UserRole.Supervisor;
  const isContractor = user.role === UserRole.Contractor;
  const isHomeowner = user.role === UserRole.Homeowner;

  const handleLogout = () => {
    logout();
  };

  const getActiveClass = (path: string) => {
    return pathname === path
      ? "block px-3 py-2 rounded-md bg-blue-50 text-blue-700 border-r-2 border-blue-700"
      : "block px-3 py-2 rounded-md hover:bg-stone-100 text-stone-700";
  };

  const getRoleDisplayName = () => {
    switch (user.role) {
      case UserRole.Admin:
        return "Quản trị viên";
      case UserRole.Supervisor:
        return "Giám sát viên";
      case UserRole.Contractor:
        return "Thầu xây dựng";
      case UserRole.Homeowner:
        return "Chủ nhà";
      default:
        return "Người dùng";
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-[280px_1fr] bg-gray-50">
      <aside className="bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">O</span>
            </div>
            <div>
              <h2 className="font-bold text-gray-900">OCSP Construction</h2>
              <p className="text-xs text-gray-500">{getRoleDisplayName()}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-6">
          {/* Dashboard Overview */}
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Tổng quan
            </div>
            <div className="space-y-1">
              {isAdmin && (
                <Link href="/admin" className={getActiveClass("/admin")}>
                  📊 Dashboard Admin
                </Link>
              )}
              {isSupervisor && (
                <Link
                  href="/supervisor"
                  className={getActiveClass("/supervisor")}
                >
                  🔍 Dashboard Giám sát
                </Link>
              )}
              {isContractor && (
                <Link
                  href="/contractor"
                  className={getActiveClass("/contractor")}
                >
                  🏗️ Dashboard Thầu
                </Link>
              )}
              {isHomeowner && (
                <Link href="/" className={getActiveClass("/")}>
                  🏠 Dashboard Chủ nhà
                </Link>
              )}
            </div>
          </div>

          {/* Role-specific Navigation */}
          {isAdmin && (
            <>
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Quản lý hệ thống
                </div>
                <div className="space-y-1">
                  <Link
                    href="/admin/users"
                    className={getActiveClass("/admin/users")}
                  >
                    👥 Người dùng
                  </Link>
                  <Link
                    href="/admin/projects"
                    className={getActiveClass("/admin/projects")}
                  >
                    🏗️ Dự án
                  </Link>
                  <Link
                    href="/admin/reports"
                    className={getActiveClass("/admin/reports")}
                  >
                    📈 Báo cáo
                  </Link>
                  <Link
                    href="/admin/settings"
                    className={getActiveClass("/admin/settings")}
                  >
                    ⚙️ Cài đặt
                  </Link>
                </div>
              </div>
            </>
          )}

          {isSupervisor && (
            <>
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Giám sát & Kiểm tra
                </div>
                <div className="space-y-1">
                  <Link
                    href="/supervisor/projects"
                    className={getActiveClass("/supervisor/projects")}
                  >
                    🏗️ Dự án giám sát
                  </Link>
                  <Link
                    href="/supervisor/inspections"
                    className={getActiveClass("/supervisor/inspections")}
                  >
                    ✅ Kiểm tra
                  </Link>
                  <Link
                    href="/supervisor/reports"
                    className={getActiveClass("/supervisor/reports")}
                  >
                    📋 Báo cáo
                  </Link>
                  <Link
                    href="/supervisor/schedule"
                    className={getActiveClass("/supervisor/schedule")}
                  >
                    📅 Lịch làm việc
                  </Link>
                </div>
              </div>
            </>
          )}

          {isContractor && (
            <>
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Quản lý dự án
                </div>
                <div className="space-y-1">
                  <Link
                    href="/contractor/projects"
                    className={getActiveClass("/contractor/projects")}
                  >
                    🏗️ Dự án của tôi
                  </Link>
                  <Link
                    href="/contractor/leads"
                    className={getActiveClass("/contractor/leads")}
                  >
                    💼 Cơ hội mới
                  </Link>
                  <Link
                    href="/contractor/proposals"
                    className={getActiveClass("/contractor/proposals")}
                  >
                    📝 Báo giá
                  </Link>
                  <Link
                    href="/contractor/contracts"
                    className={getActiveClass("/contractor/contracts")}
                  >
                    📋 Hợp đồng
                  </Link>
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Kinh doanh
                </div>
                <div className="space-y-1">
                  <Link
                    href="/contractor/team"
                    className={getActiveClass("/contractor/team")}
                  >
                    👥 Đội ngũ
                  </Link>
                  <Link
                    href="/contractor/finance"
                    className={getActiveClass("/contractor/finance")}
                  >
                    💰 Tài chính
                  </Link>
                  <Link
                    href="/contractor/materials"
                    className={getActiveClass("/contractor/materials")}
                  >
                    🧱 Vật liệu
                  </Link>
                </div>
              </div>
            </>
          )}

          {isHomeowner && (
            <>
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Dự án của tôi
                </div>
                <div className="space-y-1">
                  <Link
                    href="/homeowner/projects"
                    className={getActiveClass("/homeowner/projects")}
                  >
                    🏠 Dự án xây dựng
                  </Link>
                  <Link
                    href="/homeowner/search"
                    className={getActiveClass("/homeowner/search")}
                  >
                    🔍 Tìm thầu
                  </Link>
                  <Link
                    href="/homeowner/quotes"
                    className={getActiveClass("/homeowner/quotes")}
                  >
                    💰 Báo giá
                  </Link>
                  <Link
                    href="/homeowner/contracts"
                    className={getActiveClass("/homeowner/contracts")}
                  >
                    📋 Hợp đồng
                  </Link>
                </div>
              </div>
            </>
          )}

          {/* Common Navigation */}
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Cá nhân
            </div>
            <div className="space-y-1">
              <Link href="/profile" className={getActiveClass("/profile")}>
                👤 Hồ sơ
              </Link>
              <Link
                href="/notifications"
                className={getActiveClass("/notifications")}
              >
                🔔 Thông báo
              </Link>
              <Link href="/settings" className={getActiveClass("/settings")}>
                ⚙️ Cài đặt
              </Link>
            </div>
          </div>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user.username.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
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
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
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
