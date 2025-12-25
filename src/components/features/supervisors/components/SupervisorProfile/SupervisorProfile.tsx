"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SupervisorDetailsDto } from "../../types/supervisor.types";
import { supervisorContractsApi } from "@/lib/contracts/contracts.api";
import { message } from "antd";

interface SupervisorProfileProps {
  supervisor: SupervisorDetailsDto;
}

const SupervisorProfile: React.FC<SupervisorProfileProps> = ({
  supervisor,
}) => {
  const router = useRouter();
  const [creatingContract, setCreatingContract] = useState(false);
  const [pendingRegistration, setPendingRegistration] = useState<{
    projectId: string;
    monthlyPrice: number;
  } | null>(null);

  // Kiểm tra sessionStorage khi component mount
  useEffect(() => {
    const stored = sessionStorage.getItem('pendingSupervisorRegistration');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setPendingRegistration(data);
      } catch (e) {
        console.error('Failed to parse pending registration:', e);
      }
    }
  }, []);

  const handleCollaborate = async () => {
    if (!pendingRegistration) {
      message.error("Thiếu thông tin dự án");
      return;
    }

    if (!supervisor.availableNow) {
      message.warning("Giám sát viên này hiện không sẵn sàng nhận việc");
      return;
    }

    const confirmed = window.confirm(
      `Xác nhận hợp tác với ${supervisor.username}?\nPhí đăng ký: ${pendingRegistration.monthlyPrice.toLocaleString("vi-VN")}₫`
    );
    if (!confirmed) return;

    try {
      setCreatingContract(true);
      
      // Tạo contract với supervisor đã chọn
      const newContract = await supervisorContractsApi.createWithSupervisor({
        projectId: pendingRegistration.projectId,
        supervisorId: supervisor.id,
        monthlyPrice: pendingRegistration.monthlyPrice,
      });

      // Xóa sessionStorage
      sessionStorage.removeItem('pendingSupervisorRegistration');
      setPendingRegistration(null);

      // Redirect đến trang hợp đồng
      router.push(
        `/projects?tab=contracts&supervisorContractId=${newContract.id}`
      );
      
      message.success("Tạo hợp đồng thành công! Vui lòng ký hợp đồng.");
    } catch (e: any) {
      message.error(
        e?.response?.data?.message ||
        e?.message ||
        "Tạo hợp đồng thất bại"
      );
    } finally {
      setCreatingContract(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-2xl ${
          i < rating ? "text-yellow-500" : "text-gray-300"
        }`}
      >
        ⭐
      </span>
    ));
  };

  const formatPrice = (price: number | null | undefined) => {
    if (!price) return "Chưa cập nhật";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 text-gray-800 pt-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-6">
        {/* Header Section */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/supervisors")}
            className="inline-flex items-center gap-2 text-[#38c1b6] hover:text-[#667eea] font-medium transition-colors mb-4 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            Quay lại danh sách
          </button>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-[#38c1b6] via-[#4ecdc4] to-[#667eea] bg-clip-text text-transparent mb-2">
            Hồ sơ giám sát viên
          </h1>
          <p className="text-gray-500 text-sm">Thông tin chi tiết và đánh giá</p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Profile Header Card */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6 relative overflow-hidden">
            {/* Decorative gradient */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#38c1b6]/10 to-[#667eea]/10 rounded-full -mr-32 -mt-32"></div>
            <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold text-3xl ring-2 ring-white">
                  {supervisor.username.charAt(0).toUpperCase()}
                </div>
                {supervisor.availableNow && (
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div className="flex-1">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {supervisor.username}
                </h2>
                <p className="text-lg text-gray-600 mb-5">{supervisor.email}</p>

                {/* Rating */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex items-center gap-1">
                    {renderStars(supervisor.rating || 0)}
                  </div>
                  <span className="text-xl font-bold text-gray-800">
                    {supervisor.rating ? supervisor.rating.toFixed(1) : "0"}/5
                  </span>
                  {supervisor.reviewsCount && supervisor.reviewsCount > 0 && (
                    <span className="text-gray-500 text-sm">
                      ({supervisor.reviewsCount} đánh giá)
                    </span>
                  )}
                </div>

                {/* Availability Status */}
                <div
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-md font-medium text-xs border ${
                    supervisor.availableNow
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}
                >
                  {supervisor.availableNow
                    ? "✅ Sẵn sàng nhận việc"
                    : "❌ Hiện tại không rảnh"}
                </div>
              </div>
            </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Contact & Basic Info */}
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#38c1b6] to-[#4ecdc4]"></div>
              <h3 className="text-md font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <span className="text-2xl">📞</span>
                Thông tin liên hệ
              </h3>
              <div className="space-y-5">
                <div className="border-l-4 border-[#38c1b6] pl-4 py-2 bg-gray-50 rounded-r-lg">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Điện thoại
                  </p>
                  <p className="text-lg font-medium text-gray-800">
                    {supervisor.phone || "Chưa cập nhật"}
                  </p>
                </div>
                <div className="border-l-4 border-[#4ecdc4] pl-4 py-2 bg-gray-50 rounded-r-lg">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Khu vực
                  </p>
                  <p className="text-lg font-medium text-gray-800">
                    {supervisor.district || "Chưa cập nhật"}
                  </p>
                </div>
                <div className="border-l-4 border-[#38c1b6] pl-4 py-2 bg-gray-50 rounded-r-lg">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Kinh nghiệm
                  </p>
                  <p className="text-lg font-medium text-gray-800">
                    <span className="font-bold text-[#38c1b6] text-xl">
                      {supervisor.yearsExperience || 0}
                    </span>{" "}
                    năm
                  </p>
                </div>
              </div>
            </div>

            {/* Professional Info */}
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#667eea] to-[#764ba2]"></div>
              <h3 className="text-md font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <span className="text-2xl">💼</span>
                Thông tin nghề nghiệp
              </h3>
              <div className="space-y-5">
                <div className="border-l-4 border-[#667eea] pl-4 py-2 bg-gray-50 rounded-r-lg">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Phòng ban
                  </p>
                  <p className="text-lg font-medium text-gray-800">
                    {supervisor.department || "Chưa cập nhật"}
                  </p>
                </div>
                <div className="border-l-4 border-[#764ba2] pl-4 py-2 bg-gray-50 rounded-r-lg">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Vị trí
                  </p>
                  <p className="text-lg font-medium text-gray-800">
                    {supervisor.position || "Chưa cập nhật"}
                  </p>
                </div>
                <div className="border-l-4 border-[#667eea] pl-4 py-2 bg-gray-50 rounded-r-lg">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Mức giá
                  </p>
                  <div className="text-lg text-gray-800 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600 font-semibold">Từ:</span>
                      <span className="font-medium">{formatPrice(supervisor.minRate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-red-600 font-semibold">Đến:</span>
                      <span className="font-medium">{formatPrice(supervisor.maxRate)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          {supervisor.bio && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 mt-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#38c1b6] via-[#4ecdc4] to-[#667eea]"></div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-[#38c1b6] to-[#667eea] bg-clip-text text-transparent mb-6 flex items-center gap-2">
                <span className="text-2xl">📝</span>
                Giới thiệu bản thân
              </h3>
              <div className="bg-gradient-to-r from-[#38c1b6]/10 via-[#4ecdc4]/10 to-[#667eea]/10 rounded-xl p-6 border-l-4 border-[#38c1b6]">
                <p className="text-gray-700 leading-relaxed text-base md:text-lg">
                  {supervisor.bio}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button
              onClick={() => router.push("/supervisors")}
              className="flex-1 inline-flex items-center justify-center rounded-xl bg-gray-500 hover:bg-gray-600 text-white px-6 py-3.5 font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
            >
              <span className="mr-2">←</span>
              Quay lại danh sách
            </button>
            <button className="flex-1 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#38c1b6] to-[#667eea] hover:from-[#2fb3a8] hover:to-[#5568d3] text-white px-6 py-3.5 font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02]">
              <span className="mr-2">💬</span>
              Liên hệ ngay
            </button>
            {pendingRegistration && (
              <button
                onClick={handleCollaborate}
                disabled={creatingContract || !supervisor.availableNow}
                className="flex-1 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white px-6 py-3.5 font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:transform-none"
              >
                {creatingContract ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang tạo hợp đồng...
                  </>
                ) : (
                  <>
                    <span className="mr-2">🤝</span>
                    Hợp tác
                  </>
                )}
              </button>
            )}
            <button className="flex-1 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3.5 font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02]">
              <span className="mr-2">⭐</span>
              Đánh giá
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupervisorProfile;