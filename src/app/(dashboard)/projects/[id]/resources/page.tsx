"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { notification, Modal } from 'antd';
import Header from '@/components/layout/Header';
import { projectDailyResourceApi, type ProjectDailyResourceDto, type ProjectDailyResourceListDto, type CreateProjectDailyResourceDto } from '@/lib/resources/project-daily-resource.api';
import { useAuth, UserRole } from '@/hooks/useAuth';

export default function ProjectResourcesPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const projectId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [resources, setResources] = useState<ProjectDailyResourceListDto[]>([]);
  const [monthResources, setMonthResources] = useState<ProjectDailyResourceListDto[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    () => {
      const d = new Date();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      return `${d.getFullYear()}-${mm}`;
    }
  );
  const [form, setForm] = useState<CreateProjectDailyResourceDto>({
    projectId: projectId,
    resourceDate: new Date().toISOString().split('T')[0], // Today's date
    towerCrane: false,
    concreteMixer: false,
    materialHoist: false,
    passengerHoist: false,
    vibrator: false,
    cementConsumed: 0,
    cementRemaining: 0,
    sandConsumed: 0,
    sandRemaining: 0,
    aggregateConsumed: 0,
    aggregateRemaining: 0,
    notes: '',
  });

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Fetching resources for projectId:', projectId);
      const data = await projectDailyResourceApi.getDailyResourcesByProject(projectId);
      console.log('✅ Resources data received:', data);
      console.log('📊 Number of resources:', data?.length || 0);
      if (Array.isArray(data)) {
        data.forEach((r, i) => {
          const rr: any = r;
          console.log(
            `🔎 Item #${i} ${rr.id} ${rr.resourceDate} ->`,
            {
              towerCrane: rr.towerCrane ?? rr.TowerCrane,
              concreteMixer: rr.concreteMixer ?? rr.ConcreteMixer,
              materialHoist: rr.materialHoist ?? rr.MaterialHoist,
              passengerHoist: rr.passengerHoist ?? rr.PassengerHoist,
              vibrator: rr.vibrator ?? rr.Vibrator,
              equipmentCount: rr.equipmentCount ?? rr.EquipmentCount,
            }
          );
        });
      }
      
      
      
      setResources(data);
    } catch (e: any) {
      console.error('❌ Error fetching resources:', e);
      console.error('❌ Error response:', e?.response?.data);
      console.error('❌ Error message:', e?.message);
      setError(e?.response?.data?.message || e?.message || 'Không thể tải danh sách báo cáo tài nguyên');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🎯 Component mounted, projectId:', projectId);
    if (projectId) {
      fetchResources();
    }
  }, [projectId]);


  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) || 0 : value)
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);

      if (editingId) {
        // Update existing resource - include all required fields
        const updateData = {
          resourceDate: new Date(form.resourceDate).toISOString(),
          towerCrane: Boolean(form.towerCrane),
          concreteMixer: Boolean(form.concreteMixer),
          materialHoist: Boolean(form.materialHoist),
          passengerHoist: Boolean(form.passengerHoist),
          vibrator: Boolean(form.vibrator),
          cementConsumed: Number(form.cementConsumed) || 0,
          cementRemaining: Number(form.cementRemaining) || 0,
          sandConsumed: Number(form.sandConsumed) || 0,
          sandRemaining: Number(form.sandRemaining) || 0,
          aggregateConsumed: Number(form.aggregateConsumed) || 0,
          aggregateRemaining: Number(form.aggregateRemaining) || 0,
          notes: form.notes || '',
        };
        
        console.log('🔄 Updating resource with data:', updateData);
        await projectDailyResourceApi.updateDailyResource(editingId, updateData);
      } else {
        // Create new resource
        const createData = {
          projectId: form.projectId,
          resourceDate: new Date(form.resourceDate).toISOString(),
          towerCrane: Boolean(form.towerCrane),
          concreteMixer: Boolean(form.concreteMixer),
          materialHoist: Boolean(form.materialHoist),
          passengerHoist: Boolean(form.passengerHoist),
          vibrator: Boolean(form.vibrator),
          cementConsumed: Number(form.cementConsumed) || 0,
          cementRemaining: Number(form.cementRemaining) || 0,
          sandConsumed: Number(form.sandConsumed) || 0,
          sandRemaining: Number(form.sandRemaining) || 0,
          aggregateConsumed: Number(form.aggregateConsumed) || 0,
          aggregateRemaining: Number(form.aggregateRemaining) || 0,
          notes: form.notes || '',
        };
        
        console.log('🆕 Creating resource with data:', createData);
        await projectDailyResourceApi.createDailyResource(createData);
      }

      await fetchResources(); // Refresh list
      setShowCreateForm(false);
      setEditingId(null);
      setForm({
        projectId: projectId,
        resourceDate: new Date().toISOString().split('T')[0],
        towerCrane: false,
        concreteMixer: false,
        materialHoist: false,
        passengerHoist: false,
        vibrator: false,
        cementConsumed: 0,
        cementRemaining: 0,
        sandConsumed: 0,
        sandRemaining: 0,
        aggregateConsumed: 0,
        aggregateRemaining: 0,
        notes: '',
      });
    } catch (e: any) {
      console.error('❌ Submit error:', e);
      console.error('❌ Error response:', e?.response?.data);
      setError(e?.response?.data?.message || e?.message || 'Không thể lưu báo cáo tài nguyên');
    } finally {
      setSaving(false);
    }
  };

  const onEdit = async (resource: ProjectDailyResourceListDto) => {
    try {
      // Get full resource details first
      const fullResource = await projectDailyResourceApi.getDailyResourceById(resource.id);
      setForm({
        projectId: fullResource.projectId,
        resourceDate: fullResource.resourceDate.split('T')[0],
        towerCrane: fullResource.towerCrane,
        concreteMixer: fullResource.concreteMixer,
        materialHoist: fullResource.materialHoist,
        passengerHoist: fullResource.passengerHoist,
        vibrator: fullResource.vibrator,
        cementConsumed: fullResource.cementConsumed,
        cementRemaining: fullResource.cementRemaining,
        sandConsumed: fullResource.sandConsumed,
        sandRemaining: fullResource.sandRemaining,
        aggregateConsumed: fullResource.aggregateConsumed,
        aggregateRemaining: fullResource.aggregateRemaining,
        notes: fullResource.notes || '',
      });
      setEditingId(resource.id);
      setShowCreateForm(true);
    } catch (error) {
      console.error('Error fetching full resource details:', error);
      notification.error({
        message: "Lỗi",
        description: "Không thể tải chi tiết báo cáo để chỉnh sửa",
      });
    }
  };

  const onDelete = async (id: string) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa báo cáo tài nguyên này?",
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          setError(null);
          await projectDailyResourceApi.deleteDailyResource(id);
          await fetchResources(); // Refresh list
        } catch (e: any) {
          setError(e?.response?.data?.message || e?.message || 'Không thể xóa báo cáo tài nguyên');
        }
      },
    });
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch (error) {
      return 'Ngày không hợp lệ';
    }
  };

  // Chỉ Supervisor được tạo/sửa/xóa; Contractor/Homeowner chỉ xem
  const canEdit = user?.role === UserRole.Supervisor;

  // Helpers for month start/end
  const getMonthStartEnd = (ym: string) => {
    const [y, m] = ym.split('-').map((x) => parseInt(x, 10));
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0); // last day of month
    return {
      startISO: new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())).toISOString(),
      endISO: new Date(Date.UTC(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59)).toISOString(),
      daysInMonth: end.getDate(),
    };
  };

  const fetchMonthResources = async () => {
    try {
      if (!projectId || !selectedMonth) return;
      const { startISO, endISO } = getMonthStartEnd(selectedMonth);
      const data = await projectDailyResourceApi.getDailyResourcesByProjectAndDateRange(projectId, startISO, endISO);
      setMonthResources(data || []);
    } catch (err) {
      console.error('Fetch month resources failed', err);
    }
  };

  useEffect(() => {
    fetchMonthResources();
  }, [projectId, selectedMonth]);

  const buildSeries = (flag: 'towerCrane' | 'concreteMixer' | 'materialHoist' | 'passengerHoist' | 'vibrator') => {
    const { daysInMonth } = getMonthStartEnd(selectedMonth);
    const byDate = new Map<string, boolean>();
    monthResources.forEach((r) => {
      const key = new Date(r.resourceDate).toISOString().split('T')[0];
      const rr: any = r;
      const val = (rr[flag] ?? rr[flag.charAt(0).toUpperCase() + flag.slice(1)]) ? true : false;
      byDate.set(key, val);
    });
    const [y, m] = selectedMonth.split('-').map((x) => parseInt(x, 10));
    const series: number[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const key = new Date(Date.UTC(y, m - 1, d)).toISOString().split('T')[0];
      series.push(byDate.get(key) ? 1 : 0);
    }
    return series;
  };

  if (loading) return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-stone-900 via-stone-900/95 to-stone-900 text-stone-100 pt-20">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="text-stone-300">Đang tải...</div>
        </div>
      </div>
    </>
  );

  const inputCls = 'w-full rounded-md border border-stone-700 bg-stone-900/60 text-stone-100 placeholder-stone-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition';
  const cardCls = 'bg-stone-800/60 backdrop-blur-xl rounded-xl border border-stone-700 shadow-lg p-5 text-stone-100';
  const titleCls = 'text-xl font-semibold text-orange-300 tracking-wide';
  const btnPrimary = 'inline-flex items-center justify-center rounded-md bg-orange-600 text-stone-900 px-4 py-2 font-semibold hover:bg-orange-500 active:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed transition';
  const btnGhost = 'inline-flex items-center justify-center rounded-md border border-stone-600 px-3 py-2 text-stone-200 hover:bg-stone-700/60 transition';
  const labelCls = 'text-sm text-stone-300 mb-1 block';

  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-stone-900 via-stone-900/95 to-stone-900 text-stone-100 pt-20">
        <div className="max-w-6xl mx-auto px-4 py-10">
          
          {/* Breadcrumb */}
          <div className="mb-6 text-sm text-stone-400">
            <Link href="/projects" className="hover:underline">Dự án</Link>
            <span className="mx-2">/</span>
            <Link href={`/projects/${projectId}`} className="hover:underline">Chi tiết</Link>
            <span className="mx-2">/</span>
            <span>Báo cáo tài nguyên</span>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-extrabold tracking-tight text-orange-200">
              Báo cáo tài nguyên hàng ngày
            </h1>
            {canEdit && (
              <button
                onClick={() => {
                  setShowCreateForm(true);
                  setEditingId(null);
                  setForm({
                    projectId: projectId,
                    resourceDate: new Date().toISOString().split('T')[0],
                    towerCrane: false,
                    concreteMixer: false,
                    materialHoist: false,
                    passengerHoist: false,
                    vibrator: false,
                    cementConsumed: 0,
                    cementRemaining: 0,
                    sandConsumed: 0,
                    sandRemaining: 0,
                    aggregateConsumed: 0,
                    aggregateRemaining: 0,
                    notes: '',
                  });
                }}
                className={btnPrimary}
              >
                + Tạo báo cáo mới
              </button>
            )}
          </div>

          {/* Monthly Equipment Usage Charts */}
          <div className={`${cardCls} mb-6`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`${titleCls}`}>Biểu đồ sử dụng thiết bị theo tháng</h2>
              <div className="flex items-center gap-2">
                <label htmlFor="monthPicker" className="text-sm text-stone-300">Tháng</label>
                <input
                  id="monthPicker"
                  type="month"
                  className={inputCls}
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                />
              </div>
            </div>

            {[
              { key: 'towerCrane', label: 'Cần trục tháp', color: 'bg-cyan-400' },
              { key: 'concreteMixer', label: 'Máy trộn', color: 'bg-emerald-400' },
              { key: 'materialHoist', label: 'Vận thăng tải', color: 'bg-orange-400' },
              { key: 'passengerHoist', label: 'Vận thăng lồng', color: 'bg-blue-400' },
              { key: 'vibrator', label: 'Đầm dùi', color: 'bg-fuchsia-400' },
            ].map((cfg) => {
              const data = buildSeries(cfg.key as any);
              const maxHeight = 80;
              return (
                <div key={cfg.key} className="mb-5">
                  <div className="mb-2 text-sm text-stone-300">{cfg.label}</div>
                  <div className="overflow-x-auto">
                    <div className="min-w-full">
                      <div className="flex items-end gap-1" style={{ height: maxHeight + 30 }}>
                        {data.map((v, idx) => (
                          <div key={idx} className="flex flex-col items-center" style={{ width: 12 }}>
                            <div
                              className={v === 1 ? cfg.color : 'bg-stone-700'}
                              style={{ height: v === 1 ? maxHeight : 2, width: 8, borderRadius: 2 }}
                              title={`Ngày ${idx + 1}: ${v === 1 ? 'Có' : 'Không'}`}
                            />
                            <span className="mt-1 text-[10px] text-stone-400">{idx + 1}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-600/40 rounded-lg text-red-200">
              {error}
            </div>
          )}

          {/* Create/Edit Form */}
          {showCreateForm && (
            <div className={`${cardCls} mb-6`}>
              <h2 className={`${titleCls} mb-4`}>
                {editingId ? 'Chỉnh sửa báo cáo tài nguyên' : 'Tạo báo cáo tài nguyên mới'}
              </h2>
              
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls} htmlFor="resourceDate">Ngày báo cáo</label>
                    <input
                      id="resourceDate"
                      type="date"
                      className={inputCls}
                      name="resourceDate"
                      value={form.resourceDate}
                      onChange={onChange}
                      required
                    />
                  </div>
                </div>

                {/* Equipment Status */}
                <div>
                  <h3 className="text-lg font-medium text-orange-300 mb-3">Trạng thái thiết bị</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="towerCrane"
                        checked={form.towerCrane}
                        onChange={onChange}
                        className="rounded border-stone-600 bg-stone-800 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-stone-300">Cần trục tháp</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="concreteMixer"
                        checked={form.concreteMixer}
                        onChange={onChange}
                        className="rounded border-stone-600 bg-stone-800 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-stone-300">Máy trộn</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="materialHoist"
                        checked={form.materialHoist}
                        onChange={onChange}
                        className="rounded border-stone-600 bg-stone-800 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-stone-300">Vận thăng tải</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="passengerHoist"
                        checked={form.passengerHoist}
                        onChange={onChange}
                        className="rounded border-stone-600 bg-stone-800 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-stone-300">Vận thăng lồng</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="vibrator"
                        checked={form.vibrator}
                        onChange={onChange}
                        className="rounded border-stone-600 bg-stone-800 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-stone-300">Đầm dùi</span>
                    </label>
                  </div>
                </div>

                {/* Material Consumption */}
                <div>
                  <h3 className="text-lg font-medium text-orange-300 mb-3">Tiêu thụ vật liệu</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={labelCls} htmlFor="cementConsumed">Xi măng đã sử dụng (kg)</label>
                      <input
                        id="cementConsumed"
                        type="number"
                        min="0"
                        step="0.1"
                        className={inputCls}
                        name="cementConsumed"
                        value={form.cementConsumed}
                        onChange={onChange}
                        required
                      />
                    </div>
                    <div>
                      <label className={labelCls} htmlFor="cementRemaining">Xi măng còn lại (kg)</label>
                      <input
                        id="cementRemaining"
                        type="number"
                        min="0"
                        step="0.1"
                        className={inputCls}
                        name="cementRemaining"
                        value={form.cementRemaining}
                        onChange={onChange}
                        required
                      />
                    </div>
                    <div>
                      <label className={labelCls} htmlFor="sandConsumed">Cát đã sử dụng (m³)</label>
                      <input
                        id="sandConsumed"
                        type="number"
                        min="0"
                        step="0.1"
                        className={inputCls}
                        name="sandConsumed"
                        value={form.sandConsumed}
                        onChange={onChange}
                        required
                      />
                    </div>
                    <div>
                      <label className={labelCls} htmlFor="sandRemaining">Cát còn lại (m³)</label>
                      <input
                        id="sandRemaining"
                        type="number"
                        min="0"
                        step="0.1"
                        className={inputCls}
                        name="sandRemaining"
                        value={form.sandRemaining}
                        onChange={onChange}
                        required
                      />
                    </div>
                    <div>
                      <label className={labelCls} htmlFor="aggregateConsumed">Đá sỏi đã sử dụng (m³)</label>
                      <input
                        id="aggregateConsumed"
                        type="number"
                        min="0"
                        step="0.1"
                        className={inputCls}
                        name="aggregateConsumed"
                        value={form.aggregateConsumed}
                        onChange={onChange}
                        required
                      />
                    </div>
                    <div>
                      <label className={labelCls} htmlFor="aggregateRemaining">Đá sỏi còn lại (m³)</label>
                      <input
                        id="aggregateRemaining"
                        type="number"
                        min="0"
                        step="0.1"
                        className={inputCls}
                        name="aggregateRemaining"
                        value={form.aggregateRemaining}
                        onChange={onChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className={labelCls} htmlFor="notes">Ghi chú</label>
                  <textarea
                    id="notes"
                    rows={3}
                    className={`${inputCls} resize-none`}
                    name="notes"
                    value={form.notes}
                    onChange={onChange}
                    placeholder="Nhập ghi chú về tình hình tài nguyên..."
                  />
                </div>

                <div className="flex gap-3">
                  <button type="submit" disabled={saving} className={btnPrimary}>
                    {saving ? 'Đang lưu...' : (editingId ? 'Cập nhật' : 'Tạo báo cáo')}
                  </button>
                  <button
                    type="button"
                    className={btnGhost}
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingId(null);
                      setError(null);
                    }}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Resources List */}
          <div className={cardCls}>
            <h2 className={`${titleCls} mb-4`}>Danh sách báo cáo tài nguyên</h2>
            
            
            {resources.length === 0 ? (
              <div className="text-center py-8 text-stone-400">
                Chưa có báo cáo tài nguyên nào
              </div>
            ) : (
              <div className="space-y-4">
                {resources.map((resource) => (
                  <div key={resource.id} className="p-4 bg-stone-700/30 rounded-lg border border-stone-600/30">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-medium text-orange-300">
                          {formatDate(resource.resourceDate)}
                        </h3>
                        <p className="text-sm text-stone-400">
                          Tạo bởi: {resource.createdBy} • {formatDate(resource.createdAt)}
                        </p>
                      </div>
                      {canEdit && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => onEdit(resource)}
                            className="px-3 py-1 bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded hover:bg-blue-600/30 transition"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => onDelete(resource.id)}
                            className="px-3 py-1 bg-red-600/20 text-red-300 border border-red-500/30 rounded hover:bg-red-600/30 transition"
                          >
                            Xóa
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Equipment Status */}
                      <div className="md:col-span-2">
                        <h4 className="text-sm font-medium text-orange-200 mb-2">Thiết bị</h4>
                        <div className="space-y-1 text-sm">
                          {/* Chi tiết từng thiết bị */}
                          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Cột trái */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-stone-400">Cần trục tháp</span>
                                <span className={((resource as any).towerCrane ?? (resource as any).TowerCrane) ? 'text-green-400 font-medium' : 'text-red-400 font-medium'}>
                                  {((resource as any).towerCrane ?? (resource as any).TowerCrane) ? 'Có sử dụng' : 'Không sử dụng'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-stone-400">Máy trộn</span>
                                <span className={((resource as any).concreteMixer ?? (resource as any).ConcreteMixer) ? 'text-green-400 font-medium' : 'text-red-400 font-medium'}>
                                  {((resource as any).concreteMixer ?? (resource as any).ConcreteMixer) ? 'Có sử dụng' : 'Không sử dụng'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-stone-400">Vận thăng tải</span>
                                <span className={((resource as any).materialHoist ?? (resource as any).MaterialHoist) ? 'text-green-400 font-medium' : 'text-red-400 font-medium'}>
                                  {((resource as any).materialHoist ?? (resource as any).MaterialHoist) ? 'Có sử dụng' : 'Không sử dụng'}
                                </span>
                              </div>
                            </div>

                            {/* Cột phải */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-stone-400">Vận thăng lồng</span>
                                <span className={((resource as any).passengerHoist ?? (resource as any).PassengerHoist) ? 'text-green-400 font-medium' : 'text-red-400 font-medium'}>
                                  {((resource as any).passengerHoist ?? (resource as any).PassengerHoist) ? 'Có sử dụng' : 'Không sử dụng'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-stone-400">Đầm dùi</span>
                                <span className={((resource as any).vibrator ?? (resource as any).Vibrator) ? 'text-green-400 font-medium' : 'text-red-400 font-medium'}>
                                  {((resource as any).vibrator ?? (resource as any).Vibrator) ? 'Có sử dụng' : 'Không sử dụng'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Material Consumption */}
                      <div>
                        <h4 className="text-sm font-medium text-orange-200 mb-2">Vật liệu</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-stone-400">Xi măng:</span>
                            <span className="text-stone-300">
                              {resource.totalCementConsumed || 0}kg / {resource.totalCementRemaining || 0}kg
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-stone-400">Cát:</span>
                            <span className="text-stone-300">
                              {resource.totalSandConsumed || 0}m³ / {resource.totalSandRemaining || 0}m³
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-stone-400">Đá sỏi:</span>
                            <span className="text-stone-300">
                              {resource.totalAggregateConsumed || 0}m³ / {resource.totalAggregateRemaining || 0}m³
                            </span>
                          </div>
                        </div>
                      </div>

                      
                    </div>

                    {/* Notes - moved below to free space above for Thiết bị & Vật liệu */}
                    {resource.notes && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-orange-200 mb-2">Ghi chú</h4>
                        <p className="text-sm text-stone-300">{resource.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
