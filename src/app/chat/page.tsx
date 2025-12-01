// src/app/chat/page.tsx
"use client";

import dynamic from "next/dynamic";
import { useAuthContext } from "@/providers";
import { UserRole } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spin } from "antd";

const ChatMessengerList = dynamic(
  () => import("@/components/features/chat/components/ChatMessengerList"),
  { ssr: false }
);

export default function ChatPage() {
  const { user, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (
      !isLoading &&
      (!user ||
        (user.role !== UserRole.Homeowner && user.role !== UserRole.Supervisor))
    ) {
      // Redirect users who are not Homeowner or Supervisor
      router.push("/");
    }
  }, [user, isLoading, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-stone-900 via-stone-900/95 to-stone-900">
        <Spin size="large" tip="Đang kiểm tra quyền truy cập..." />
      </div>
    );
  }

  // If not authenticated or not homeowner/supervisor, show access denied
  if (
    !user ||
    (user.role !== UserRole.Homeowner && user.role !== UserRole.Supervisor)
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-stone-900 via-stone-900/95 to-stone-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-rose-400 mb-4">
            Không có quyền truy cập
          </h1>
          <p className="text-stone-400 mb-6">
            Chỉ chủ nhà và giám sát viên mới có thể sử dụng tính năng chat này.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-amber-600 text-stone-900 rounded-md hover:bg-amber-500 transition"
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  return <ChatMessengerList />;
}
