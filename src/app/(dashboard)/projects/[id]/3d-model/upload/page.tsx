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
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-stone-900 to-stone-900 pt-20">
          <div className="max-w-4xl mx-auto px-4 py-10">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
              <h2 className="text-2xl font-bold text-red-400 mb-2">
                🚫 Không có quyền truy cập
              </h2>
              <p className="text-stone-300 mb-4">
                Chỉ có <strong>Giám sát viên</strong> mới có thể upload mô hình
                3D.
              </p>
              <Button
                onClick={() => router.push(`/projects/${projectId}`)}
                className="bg-stone-700 hover:bg-stone-600"
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
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-stone-900 to-stone-900 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="mb-8">
            <button
              onClick={() => router.push(`/projects/${projectId}/3d-model`)}
              className="text-stone-400 hover:text-stone-300 mb-4 inline-flex items-center gap-2"
            >
              ← Quay lại
            </button>
            <h1 className="text-3xl font-bold text-amber-200 mb-2">
              📤 Upload Mô hình 3D
            </h1>
            <p className="text-stone-400">
              Upload file GLB cho dự án. Chỉ Giám sát viên mới có quyền upload.
            </p>
          </div>

          <div className="bg-stone-800/60 backdrop-blur-xl rounded-xl border border-stone-700 p-6">
            <div className="mb-6">
              <label className="block text-stone-300 font-semibold mb-3">
                📁 Chọn file GLB *
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".glb"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="block w-full text-sm text-stone-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-600 file:text-stone-900 hover:file:bg-amber-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-stone-500 mt-2">
                ⚠️ Chỉ chấp nhận file .GLB, tối đa 50MB
              </p>
            </div>

            {file && (
              <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <h3 className="text-blue-300 font-semibold mb-2">
                  📦 Thông tin file:
                </h3>
                <div className="space-y-1 text-sm text-stone-300">
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
              <label className="block text-stone-300 font-semibold mb-3">
                📝 Mô tả (Tùy chọn)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={uploading}
                rows={3}
                placeholder="Nhập mô tả cho mô hình 3D này..."
                className="w-full bg-stone-900/60 border border-stone-700 rounded-lg px-4 py-2 text-stone-100 placeholder-stone-500 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
              />
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                ⚠️ {error}
              </div>
            )}

            {uploading && (
              <div className="mb-6">
                <div className="flex justify-between text-sm text-stone-400 mb-2">
                  <span>Đang upload...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-stone-700 rounded-full h-2">
                  <div
                    className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="flex-1 bg-amber-600 hover:bg-amber-500 disabled:bg-stone-700 disabled:opacity-50 text-stone-900 font-bold py-3"
              >
                {uploading ? "⏳ Đang upload..." : "🚀 Upload mô hình"}
              </Button>
              <Button
                onClick={() => router.push(`/projects/${projectId}/3d-model`)}
                disabled={uploading}
                className="bg-stone-700 hover:bg-stone-600 text-white px-6"
              >
                Hủy
              </Button>
            </div>
          </div>

          <div className="mt-8 bg-amber-500/10 border border-amber-500/30 rounded-lg p-6">
            <h3 className="text-amber-300 font-bold mb-3">💡 Hướng dẫn:</h3>
            <ol className="space-y-2 text-stone-300 text-sm">
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
