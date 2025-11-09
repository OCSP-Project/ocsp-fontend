"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { modelAnalysisApi } from "@/lib/model-analysis/model-analysis.api";
import { useAuth, UserRole } from "@/hooks/useAuth";
import type { BuildingElement } from "@/types/model-tracking.types";
import { Button } from "@/components/ui";

export default function ElementTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const projectId = params.id as string;
  const elementId = params.elementId as string;

  const [element, setElement] = useState<BuildingElement | null>(null);
  const [percentage, setPercentage] = useState(0);
  const [photos, setPhotos] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        // We don't have a single-element endpoint; fetch via model then filter
        const model = await modelAnalysisApi.getModelInfo(projectId);
        const elements = await modelAnalysisApi.getBuildingElements(
          model.modelId
        );
        const el = elements.find((e) => e.id === elementId) || null;
        setElement(el);
        if (el) setPercentage(el.completion_percentage || 0);
      } catch (e: any) {
        setError(e?.response?.data?.message || "Không thể tải dữ liệu element");
      }
    };
    load();
  }, [projectId, elementId]);

  const onSelectPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotos(files);
  };

  const onSave = async () => {
    if (user?.role !== UserRole.Supervisor) {
      setError("Chỉ Giám sát viên mới được cập nhật tiến độ");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      if (photos.length > 0) {
        await modelAnalysisApi.uploadTrackingPhotos(elementId, photos);
      }
      await modelAnalysisApi.updateCompletionPercentage(elementId, percentage);
      router.push(`/projects/${projectId}/elements`);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Lưu tiến độ thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-stone-900 to-stone-900 pt-20">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <div className="mb-6 flex items-center gap-3">
            <Link
              href={`/projects/${projectId}/elements`}
              className="text-stone-400 hover:text-stone-300"
            >
              ← Danh sách elements
            </Link>
            <span className="text-stone-600">/</span>
            <h1 className="text-2xl font-bold text-amber-200">
              📊 Cập nhật tiến độ
            </h1>
          </div>

          {!element ? (
            <div className="bg-stone-800/60 border border-stone-700 rounded-xl p-6 text-stone-300">
              Đang tải hoặc không tìm thấy element.
            </div>
          ) : (
            <div className="bg-stone-800/60 border border-stone-700 rounded-xl p-6">
              <div className="mb-4">
                <div className="text-stone-200 font-semibold">
                  {element.name}
                </div>
                <div className="text-xs text-stone-400">
                  {element.element_type} • Tầng {element.floor_level}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-stone-300 font-semibold mb-2">
                  Tiến độ (%)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={percentage}
                    onChange={(e) => setPercentage(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <div className="w-14 text-right text-stone-200 font-bold">
                    {percentage}%
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-stone-300 font-semibold mb-2">
                  Ảnh minh chứng (tùy chọn)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={onSelectPhotos}
                  className="block w-full text-sm text-stone-300"
                />
                {photos.length > 0 && (
                  <div className="text-xs text-stone-400 mt-2">
                    Đã chọn {photos.length} ảnh
                  </div>
                )}
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-md bg-red-500/10 border border-red-500/30 text-red-400">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={onSave}
                  disabled={saving || user?.role !== UserRole.Supervisor}
                  className="bg-green-600 hover:bg-green-500 disabled:opacity-50"
                >
                  {saving ? "Đang lưu..." : "Lưu tiến độ"}
                </Button>
                <Button
                  onClick={() => router.back()}
                  className="bg-stone-700 hover:bg-stone-600"
                >
                  Hủy
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
