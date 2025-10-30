"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Header from "@/components/layout/Header";
import { projectsApi, type ProjectDetailDto } from "@/lib/projects/projects.api";
import { type ProgressMediaDto } from "@/lib/projects/project.types";
import { useAuth, UserRole } from "@/hooks/useAuth";
import { timelineApi, type ProjectTimelineGanttDto, type MilestoneOverdueDto } from "@/lib/timeline/timeline.api";

export default function Progress() {
  const params = useParams();
  const projectId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<ProjectDetailDto | null>(null);
  const [gallery, setGallery] = useState<ProgressMediaDto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  
  // Timeline states
  const [timeline, setTimeline] = useState<ProjectTimelineGanttDto | null>(null);
  const [overdueMilestones, setOverdueMilestones] = useState<MilestoneOverdueDto[]>([]);
  const [activeTab, setActiveTab] = useState<'progress' | 'timeline'>('progress');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [p, g, t, o] = await Promise.all([
        projectsApi.getProject(projectId),
        projectsApi.getProjectGallery(projectId, { page: 1, pageSize: 100 }),
        timelineApi.getProjectTimeline(projectId),
        timelineApi.checkOverdueMilestones(projectId),
      ]);
      setProject(p);
      setGallery(g.items);
      setTimeline(t);
      setOverdueMilestones(o);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Không tải được dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Normalize media URL to backend origin (if API is at http://host:8080/api)
  const backendOrigin = useMemo(() => {
    const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
    return api.replace(/\/api\/?$/, "");
  }, []);

  const resolveMediaUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("/")) return `${backendOrigin}${url}`;
    return `${backendOrigin}/${url}`;
  };

  // Fake completion calculation using image count over time (until backend summary exists)
  const chartData = useMemo(() => {
    const byDay = new Map<string, number>();
    gallery.forEach((m) => {
      const day = new Date(m.createdAt).toISOString().slice(0, 10);
      byDay.set(day, (byDay.get(day) || 0) + 1);
    });
    const sortedDays = Array.from(byDay.keys()).sort();
    let cumulative = 0;
    return sortedDays.map((d) => {
      cumulative += byDay.get(d) || 0;
      return { date: d, value: cumulative };
    });
  }, [gallery]);

  const completionPercent = useMemo(() => {
    if (!project) return 0;
    const start = new Date(project.startDate).getTime();
    const end = project.estimatedCompletionDate
      ? new Date(project.estimatedCompletionDate).getTime()
      : Date.now();
    const now = Date.now();
    if (!start || !end || end <= start) return 0;
    const progress = Math.min(Math.max((now - start) / (end - start), 0), 1);
    return Math.round(progress * 100);
  }, [project]);

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-4 text-sm text-stone-400">
          <Link href="/projects" className="hover:underline">Dự án</Link>
          <span className="mx-2">/</span>
          <Link href={`/projects/${projectId}`} className="hover:underline">Chi tiết</Link>
          <span className="mx-2">/</span>
          <span>Theo dõi tiến độ</span>
        </div>

        {loading && <div className="py-20 text-center">Đang tải...</div>}
        {error && !loading && (
          <div className="p-4 mb-6 bg-red-900/30 border border-red-600/40 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {!loading && project && (
          <div className="space-y-6">
            {/* Header with tabs */}
            <div className="p-5 rounded-xl border border-stone-700 bg-stone-800/50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{project.name}</h2>
                  <p className="text-stone-400 mt-1">Địa chỉ: {project.address}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-300">{completionPercent}%</div>
                  <div className="text-stone-400 text-sm">Ước tính hoàn thành</div>
                </div>
              </div>
              <div className="mt-4 h-2 bg-stone-700 rounded">
                <div className="h-full bg-blue-500 rounded" style={{ width: `${completionPercent}%` }} />
              </div>
              
              {/* Tab navigation */}
              <div className="mt-6 flex space-x-1 bg-stone-700/50 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('progress')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                    activeTab === 'progress'
                      ? 'bg-blue-600 text-white'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  Tiến độ dự án
                </button>
                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                    activeTab === 'timeline'
                      ? 'bg-blue-600 text-white'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  Timeline & Milestones
                </button>
              </div>
            </div>

            {/* Overdue milestones alert */}
            {overdueMilestones.length > 0 && (
              <div className="p-4 rounded-xl border border-red-600/40 bg-red-900/30">
                <div className="flex items-center mb-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  <h3 className="text-red-200 font-semibold">Cảnh báo tiến độ</h3>
                </div>
                <div className="space-y-2">
                  {overdueMilestones.map((milestone) => (
                    <div key={milestone.milestoneId} className="text-sm">
                      <span className="text-red-300 font-medium">{milestone.milestoneName}</span>
                      {milestone.isOverdue ? (
                        <span className="text-red-400 ml-2">
                          Trễ {milestone.daysOverdue} ngày ({milestone.progressPercentage}% hoàn thành)
                        </span>
                      ) : (
                        <span className="text-yellow-400 ml-2">
                          Sắp đến hạn ({Math.abs(milestone.daysOverdue)} ngày còn lại)
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Progress tab content */}
            {activeTab === 'progress' && (
              <div className="p-5 rounded-xl border border-stone-700 bg-stone-800/50">
                <h3 className="text-lg font-semibold mb-4">Dòng thời gian hoạt động</h3>
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                      <defs>
                        <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.5} />
                          <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                      <XAxis dataKey="date" stroke="#cbd5e1" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#cbd5e1" tick={{ fontSize: 12 }} />
                      <Tooltip contentStyle={{ background: "#0b1220", border: "1px solid #334155" }} />
                      <Area type="monotone" dataKey="value" stroke="#60a5fa" fill="url(#colorA)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Timeline tab content */}
            {activeTab === 'timeline' && (
              <div className="space-y-6">
                {timeline ? (
                  <div className="p-5 rounded-xl border border-stone-700 bg-stone-800/50">
                    <h3 className="text-lg font-semibold mb-4">Timeline dự án: {timeline.name}</h3>
                    <div className="space-y-4">
                      {timeline.milestones.map((milestone) => (
                        <div key={milestone.id} className="p-4 rounded-lg border border-stone-600 bg-stone-700/50">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-lg font-medium">{milestone.name}</h4>
                            <div className="flex items-center space-x-4">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                milestone.status === 'Released' ? 'bg-green-600/20 text-green-300' :
                                milestone.status === 'Approved' ? 'bg-blue-600/20 text-blue-300' :
                                milestone.status === 'Submitted' ? 'bg-purple-600/20 text-purple-300' :
                                'bg-yellow-600/20 text-yellow-300'
                              }`}>
                                {milestone.status === 'Released' ? 'Hoàn thành' :
                                 milestone.status === 'Approved' ? 'Đã duyệt' :
                                 milestone.status === 'Submitted' ? 'Đã nộp' :
                                 milestone.status === 'Funded' ? 'Đã tài trợ' : 'Chưa bắt đầu'}
                              </span>
                              <span className="text-sm text-stone-400">
                                {milestone.progressPercentage}%
                              </span>
                            </div>
                          </div>
                          
                          {milestone.description && (
                            <p className="text-stone-400 text-sm mb-3">{milestone.description}</p>
                          )}
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-stone-500">Dự kiến bắt đầu:</span>
                              <span className="ml-2 text-stone-300">
                                {new Date(milestone.plannedStartDate).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                            <div>
                              <span className="text-stone-500">Dự kiến kết thúc:</span>
                              <span className="ml-2 text-stone-300">
                                {new Date(milestone.plannedEndDate).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                            {milestone.actualStartDate && (
                              <div>
                                <span className="text-stone-500">Thực tế bắt đầu:</span>
                                <span className="ml-2 text-stone-300">
                                  {new Date(milestone.actualStartDate).toLocaleDateString('vi-VN')}
                                </span>
                              </div>
                            )}
                            {milestone.actualEndDate && (
                              <div>
                                <span className="text-stone-500">Thực tế kết thúc:</span>
                                <span className="ml-2 text-stone-300">
                                  {new Date(milestone.actualEndDate).toLocaleDateString('vi-VN')}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-stone-500">Tiến độ</span>
                              <span className="text-stone-300">{milestone.progressPercentage}%</span>
                            </div>
                            <div className="w-full bg-stone-600 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${milestone.progressPercentage}%` }}
                              />
                            </div>
                          </div>
                          
                          {milestone.deliverables.length > 0 && (
                            <div className="mt-4">
                              <h5 className="text-sm font-medium text-stone-300 mb-2">Deliverables:</h5>
                              <div className="space-y-2">
                                {milestone.deliverables.map((deliverable) => (
                                  <div key={deliverable.id} className="flex items-center justify-between p-2 bg-stone-600/30 rounded">
                                    <span className="text-sm text-stone-300">{deliverable.name}</span>
                                    <div className="flex items-center space-x-2">
                                      <span className="text-xs text-stone-400">{deliverable.progressPercentage}%</span>
                                      <span className={`px-2 py-1 rounded text-xs ${
                                        deliverable.status === 'Completed' ? 'bg-green-600/20 text-green-300' :
                                        deliverable.status === 'InProgress' ? 'bg-blue-600/20 text-blue-300' :
                                        'bg-yellow-600/20 text-yellow-300'
                                      }`}>
                                        {deliverable.status === 'Completed' ? 'Hoàn thành' :
                                         deliverable.status === 'InProgress' ? 'Đang làm' : 'Chưa bắt đầu'}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-5 rounded-xl border border-stone-700 bg-stone-800/50 text-center">
                    <h3 className="text-lg font-semibold mb-2">Chưa có timeline</h3>
                    <p className="text-stone-400 mb-4">Dự án này chưa có timeline được tạo.</p>
                    {user?.role === UserRole.Contractor && (
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition">
                        Tạo timeline
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="p-5 rounded-xl border border-stone-700 bg-stone-800/50">
              <h3 className="text-lg font-semibold mb-4">Thư viện tiến độ</h3>
              {user?.role === UserRole.Contractor && (
                <form
                  className="mb-4 grid grid-cols-1 md:grid-cols-6 gap-3 items-center"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!file) return;
                    try {
                      setUploading(true);
                      await projectsApi.uploadProjectMedia(projectId, file, { caption });
                      setFile(null);
                      setCaption("");
                      await fetchData();
                    } catch (err: any) {
                      alert(err?.response?.data?.message || err?.message || "Tải ảnh thất bại");
                    } finally {
                      setUploading(false);
                    }
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="md:col-span-2 text-sm text-stone-300 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Chú thích (tuỳ chọn)"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="md:col-span-3 w-full rounded-md border border-stone-700 bg-stone-900/60 text-stone-100 placeholder-stone-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!file || uploading}
                    className="md:col-span-1 inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-60"
                  >
                    {uploading ? "Đang tải..." : "Tải ảnh tiến độ"}
                  </button>
                </form>
              )}
              {gallery.length === 0 && (
                <div className="text-stone-400">Chưa có ảnh/video tiến độ.</div>
              )}
              {gallery.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {gallery.map((m) => (
                    <div key={m.id} className="group relative overflow-hidden rounded-lg border border-stone-700">
                      <a href={resolveMediaUrl(m.url)} target="_blank" rel="noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={resolveMediaUrl(m.url)} alt={m.caption} className="w-full h-40 object-cover group-hover:opacity-90" />
                      </a>
                      <div className="px-2 py-1 text-xs text-stone-300 truncate">{m.caption || m.fileName}</div>
                      <div className="px-2 pb-2 text-[10px] text-stone-500">{new Date(m.createdAt).toLocaleString("vi-VN")}</div>
                      {user?.role === UserRole.Contractor && (
                        <button
                          onClick={async () => {
                            if (!confirm('Xoá ảnh này?')) return;
                            try {
                              await projectsApi.deleteProjectMedia(projectId, m.id);
                              await fetchData();
                            } catch (err: any) {
                              alert(err?.response?.data?.message || err?.message || 'Xoá ảnh thất bại');
                            }
                          }}
                          className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-500 text-white text-xs px-2 py-1 rounded-md hidden group-hover:block"
                          title="Xoá ảnh"
                        >
                          Xoá
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}