"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { modelAnalysisApi } from "@/lib/model-analysis/model-analysis.api";
import type {
  BuildingElement,
  Project3DModel,
} from "@/types/model-tracking.types";
import { Button } from "@/components/ui";

export default function ElementsListPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [model, setModel] = useState<Project3DModel | null>(null);
  const [elements, setElements] = useState<BuildingElement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const m = await modelAnalysisApi.getModelInfo(projectId);
        setModel(m);
        if (m) {
          const el = await modelAnalysisApi.getBuildingElements(m.modelId);
          setElements(el);
        }
      } catch (e: any) {
        setError(
          e?.response?.data?.message || "Không thể tải danh sách elements"
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [projectId]);

  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-stone-900 to-stone-900 pt-20">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href={`/projects/${projectId}/3d-model`}
                className="text-stone-400 hover:text-stone-300"
              >
                ← Quay lại 3D Model
              </Link>
              <span className="text-stone-600">/</span>
              <h1 className="text-2xl font-bold text-amber-200">
                📦 Building Elements
              </h1>
            </div>
            <Button
              onClick={() => router.push(`/projects/${projectId}/3d-model`)}
              className="bg-stone-700 hover:bg-stone-600"
            >
              Xem mô hình
            </Button>
          </div>

          {loading ? (
            <div className="text-stone-300">Đang tải...</div>
          ) : error ? (
            <div className="text-red-400">{error}</div>
          ) : !model ? (
            <div className="text-stone-300">
              Chưa có mô hình để hiển thị elements.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {elements.map((el) => (
                <div
                  key={el.id}
                  className="bg-stone-800/60 border border-stone-700 rounded-xl p-4"
                >
                  <div className="text-stone-200 font-semibold mb-1">
                    {el.name}
                  </div>
                  <div className="text-xs text-stone-400 mb-3">
                    {el.element_type} • Tầng {el.floor_level}
                  </div>
                  <div className="w-full bg-stone-700 rounded-full h-2 mb-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${el.completion_percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-stone-400 mb-4">
                    Tiến độ: <strong>{el.completion_percentage}%</strong> •
                    Trạng thái: <strong>{el.tracking_status}</strong>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="bg-stone-700 hover:bg-stone-600"
                      onClick={() =>
                        router.push(
                          `/projects/${projectId}/elements/${el.id}/tracking`
                        )
                      }
                    >
                      📊 Tracking
                    </Button>
                    <Button
                      className="bg-stone-700 hover:bg-stone-600"
                      onClick={() =>
                        router.push(`/projects/${projectId}/3d-model`)
                      }
                    >
                      🔎 Xem trên 3D
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
