"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import { modelAnalysisApi } from "@/lib/model-analysis/model-analysis.api";
import { useAuth, UserRole } from "@/hooks/useAuth";
import { Button } from "@/components/ui";

export default function ModelUploadPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const projectId = params.id as string;

  // UI tokens aligned with dashboard teal/indigo light theme
  const wrapperCls =
    "min-h-[calc(100vh-4rem)] bg-gradient-to-br from-teal-50 via-white to-indigo-50 pt-24 px-4";
  const innerCls = "max-w-4xl mx-auto space-y-6";
  const cardCls =
    "bg-white/95 backdrop-blur-xl rounded-2xl border border-white/70 shadow-lg p-6 text-slate-800";
  const infoCardCls =
    "bg-amber-50 border border-amber-200 rounded-2xl p-6 text-slate-800";
  const btnPrimaryCls =
    "flex-1 bg-gradient-to-r from-teal-500 to-indigo-500 hover:from-teal-600 hover:to-indigo-600 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition disabled:opacity-60 disabled:cursor-not-allowed";
  const btnGhostCls =
    "bg-white/80 hover:bg-white text-slate-700 border border-slate-200 rounded-xl px-6 py-3 shadow-sm hover:border-teal-200 transition disabled:opacity-60 disabled:cursor-not-allowed";

  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  if (user?.role !== UserRole.Supervisor) {
    return (
      <>
        <Header />
        <div className={wrapperCls}>
          <div className={innerCls}>
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center shadow-md">
              <h2 className="text-2xl font-bold text-red-600 mb-2">
                🚫 Không có quyền truy cập
              </h2>
              <p className="text-slate-600 mb-4">
                Chỉ có <strong>Giám sát viên</strong> mới có thể upload mô hình
                3D.
              </p>
              <Button
                onClick={() => router.push(`/projects/${projectId}`)}
                className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-xl"
              >
                ← Quay lại dự án
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith(".glb")) {
      setError("Chỉ chấp nhận file .GLB!");
      setFile(null);
      return;
    }

    const maxSize = 50 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError("File quá lớn! Tối đa 50MB.");
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError(null);
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Vui lòng chọn file GLB!");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setProgress(0);

      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await modelAnalysisApi.uploadGLB(projectId, file, description);

      clearInterval(progressInterval);
      setProgress(100);
      setTimeout(() => {
        router.push(`/projects/${projectId}/3d-model`);
      }, 800);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Lỗi khi upload file!");
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <>
      <Header />
      <div className={wrapperCls}>
        <div className={innerCls}>
          <div className="mb-6">
            <button
              onClick={() => router.push(`/projects/${projectId}/3d-model`)}
              className="text-slate-500 hover:text-slate-700 mb-3 inline-flex items-center gap-2 text-sm"
            >
              ← Quay lại
            </button>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-[#38c1b6] to-[#667eea] bg-clip-text text-transparent mb-2">
              📤 Upload Mô hình 3D
            </h1>
            <p className="text-slate-600">
              Tải lên file GLB cho dự án. Chỉ Giám sát viên mới có quyền upload.
            </p>
          </div>

          <div className={cardCls}>
            <div className="mb-6">
              <label className="block text-slate-800 font-semibold mb-3">
                📁 Chọn file GLB *
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".glb"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="block w-full text-sm text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-teal-500 file:to-indigo-500 file:text-white hover:file:from-teal-600 hover:file:to-indigo-600 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                ⚠️ Chỉ chấp nhận file .GLB, tối đa 50MB
              </p>
            </div>

            {file && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <h3 className="text-blue-700 font-semibold mb-2">
                  📦 Thông tin file:
                </h3>
                <div className="space-y-1 text-sm text-slate-700">
                  <div>
                    Tên file: <strong>{file.name}</strong>
                  </div>
                  <div>
                    Kích thước:{" "}
                    <strong>{(file.size / (1024 * 1024)).toFixed(2)} MB</strong>
                  </div>
                  <div>
                    Loại: <strong>{file.type || "model/gltf-binary"}</strong>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-slate-800 font-semibold mb-3">
                📝 Mô tả (Tùy chọn)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={uploading}
                rows={3}
                placeholder="Nhập mô tả cho mô hình 3D này..."
                className="w-full bg-white/80 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-teal-200 disabled:opacity-60"
              />
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                ⚠️ {error}
              </div>
            )}

            {uploading && (
              <div className="mb-6">
                <div className="flex justify-between text-sm text-slate-500 mb-2">
                  <span>Đang upload...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-teal-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleUpload}
                disabled={!file || uploading}
                className={btnPrimaryCls}
              >
                {uploading ? "⏳ Đang upload..." : "🚀 Upload mô hình"}
              </Button>
              <Button
                onClick={() => router.push(`/projects/${projectId}/3d-model`)}
                disabled={uploading}
                className={btnGhostCls}
              >
                Hủy
              </Button>
            </div>
          </div>

          <div className={infoCardCls + " mt-4"}>
            <h3 className="text-amber-700 font-bold mb-3">💡 Hướng dẫn:</h3>
            <ol className="space-y-2 text-slate-700 text-sm">
              <li>1️⃣ Chọn file GLB từ máy tính của bạn</li>
              <li>2️⃣ Kiểm tra thông tin file (kích thước, tên file)</li>
              <li>3️⃣ Thêm mô tả nếu cần (tùy chọn)</li>
              <li>4️⃣ Click "Upload mô hình" để bắt đầu</li>
              <li>5️⃣ Sau khi upload xong, bạn có thể tạo Building Elements</li>
            </ol>
          </div>
        </div>
      </div>
    </>
  );
}
