"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSupervisorById, SupervisorDetailsDto } from "@/lib/api/supervisors";

export default function SupervisorProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [supervisor, setSupervisor] = useState<SupervisorDetailsDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      getSupervisorById(id as string)
        .then(setSupervisor)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-600 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!supervisor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md mx-auto">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy</h2>
          <p className="text-gray-600 mb-6">Giám sát viên này không tồn tại hoặc đã bị xóa.</p>
          <button
            onClick={() => router.push("/supervisors")}
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            ← Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-2xl ${i < rating ? 'text-yellow-500' : 'text-gray-300'}`}>
        ⭐
      </span>
    ));
  };

  const formatPrice = (price: number | null | undefined) => {
    if (!price) return "Chưa cập nhật";
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => router.push("/supervisors")}
              className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl font-medium transition-all duration-200 mb-6"
            >
              ← Quay lại danh sách
            </button>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              HỒ SƠ GIÁM SÁT VIÊN
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-amber-200">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Avatar */}
              <div className="w-32 h-32 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-4xl shadow-xl">
                {supervisor.username.charAt(0).toUpperCase()}
              </div>
              
              {/* Basic Info */}
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">{supervisor.username}</h2>
                <p className="text-lg text-gray-600 mb-4">{supervisor.email}</p>
                
                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {renderStars(supervisor.rating || 0)}
                  </div>
                  <span className="text-lg font-semibold text-gray-700">
                    {supervisor.rating || 0}/5
                  </span>
                  <span className="text-gray-500">
                    ({supervisor.reviewsCount || 0} đánh giá)
                  </span>
                </div>

                {/* Availability Status */}
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${
                  supervisor.availableNow 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {supervisor.availableNow ? "✅ Sẵn sàng nhận việc" : "❌ Hiện tại không rảnh"}
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact & Basic Info */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-amber-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                📞 Thông tin liên hệ
              </h3>
              <div className="space-y-4">
                <div className="border-l-4 border-amber-500 pl-4">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Điện thoại</p>
                  <p className="text-lg text-gray-800">{supervisor.phone || "Chưa cập nhật"}</p>
                </div>
                <div className="border-l-4 border-amber-500 pl-4">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Khu vực</p>
                  <p className="text-lg text-gray-800">{supervisor.district || "Chưa cập nhật"}</p>
                </div>
                <div className="border-l-4 border-amber-500 pl-4">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Kinh nghiệm</p>
                  <p className="text-lg text-gray-800">
                    <span className="font-bold text-amber-600">{supervisor.yearsExperience || 0}</span> năm
                  </p>
                </div>
              </div>
            </div>

            {/* Professional Info */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-amber-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                💼 Thông tin nghề nghiệp
              </h3>
              <div className="space-y-4">
                <div className="border-l-4 border-orange-500 pl-4">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Phòng ban</p>
                  <p className="text-lg text-gray-800">{supervisor.department || "Chưa cập nhật"}</p>
                </div>
                <div className="border-l-4 border-orange-500 pl-4">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Vị trí</p>
                  <p className="text-lg text-gray-800">{supervisor.position || "Chưa cập nhật"}</p>
                </div>
                <div className="border-l-4 border-orange-500 pl-4">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Mức giá</p>
                  <div className="text-lg text-gray-800">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600 font-semibold">Từ:</span>
                      <span>{formatPrice(supervisor.minRate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-red-600 font-semibold">Đến:</span>
                      <span>{formatPrice(supervisor.maxRate)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          {supervisor.bio && (
            <div className="bg-white rounded-2xl shadow-xl p-6 mt-8 border border-amber-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                📝 Giới thiệu bản thân
              </h3>
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border-l-4 border-amber-500">
                <p className="text-gray-700 leading-relaxed text-lg">{supervisor.bio}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button
              onClick={() => router.push("/supervisors")}
              className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              ← Quay lại danh sách
            </button>
            <button className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
              💬 Liên hệ ngay
            </button>
            <button className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
              ⭐ Đánh giá
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}