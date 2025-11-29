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
    // Redirect to login page after logout
    router.push("/login");
  };

  const getPageTitle = () => {
    if (pathname.startsWith("/admin")) {
      if (pathname === "/admin") return "Dashboard";
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
    return "Dashboard";
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex-1 grid grid-cols-[240px_1fr]">
        <aside className="bg-white border-r pt-12 pl-4 flex flex-col">
          {/* Sidebar Header */}
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

            {/* Chat - For Contractor */}
            {isContractor && (
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Liên hệ
                </div>
                <div className="space-y-1">
                  <Link
                    href="/contractor/chat"
                    className={getActivePathClass("/contractor/chat")}
                  >
                    💬 Tin nhắn
                  </Link>
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
                  <Link href="/admin" className={getActivePathClass("/admin")}>
                    📊 Dashboard
                  </Link>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Link
                      href="/admin/users"
                      className={getActivePathClass("/admin/users")}
                      style={{ flex: 1 }}
                    >
                      👥 Người dùng
                    </Link>
                    {isAdmin && pendingCount > 0 && (
                      <Tag
                        color="orange"
                        style={{
                          marginLeft: 8,
                          borderRadius: "10px",
                          marginRight: 0,
                        }}
                      >
                        {pendingCount}
                      </Tag>
                    )}
                  </div>
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

            {/* Chat - Only for Homeowner */}
            {isHomeowner && (
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Liên hệ
                </div>
                <div className="space-y-1">
                  <Link href="/chat" className={getActivePathClass("/chat")}>
                    💬 Tin nhắn
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
                <Link
                  href="/profile"
                  className={getActivePathClass("/profile")}
                >
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
        </aside>

        <main className="overflow-auto">
          <div>{children}</div>
        </main>
      </div>
    </div>
  );
}
