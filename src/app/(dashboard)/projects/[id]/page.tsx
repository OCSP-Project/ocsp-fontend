"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { paymentsApi, supervisorContractsApi } from '@/lib/contracts/contracts.api';
import { projectsApi, type ProjectDetailDto, type UpdateProjectDto } from '@/lib/projects/projects.api';
import { MembersSection } from "@/components/features/project-invitations/MembersSection";
import { ProjectParticipantRole } from "@/types/project-invitation.types";
import { useAuth } from '@/hooks/useAuth';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const search = useSearchParams();
  const projectId = params.id as string;
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const [project, setProject] = useState<ProjectDetailDto | null>(null);

  // Check if current user is the project homeowner
  const isHomeowner = useMemo(() => {
    return user?.id === project?.homeownerId;
  }, [user?.id, project?.homeownerId]);
  const [form, setForm] = useState<UpdateProjectDto>({});
  const [supervisorContract, setSupervisorContract] = useState<{ status: string } | null>(null);

  // Track which orderIds have been processed to prevent duplicate webhook calls
  const processedOrdersRef = React.useRef<Set<string>>(new Set());

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectsApi.getProject(projectId);
      setProject(data);
      setForm({
        name: data.name,
        description: data.description,
        address: data.address,
        floorArea: data.floorArea,
        numberOfFloors: data.numberOfFloors,
        budget: data.budget,
        startDate: data.startDate.split("T")[0], // Convert to date input format
        estimatedCompletionDate: data.estimatedCompletionDate?.split("T")[0],
        status: data.status,
      });

      // Fetch supervisor contract if exists
      try {
        const contract = await supervisorContractsApi.getByProjectId(projectId);
        setSupervisorContract(contract ? { status: contract.status } : null);
      } catch (e) {
        setSupervisorContract(null);
      }
    } catch (e: any) {
      setError(
        e?.response?.data?.message || e?.message || "Failed to load project"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  // Handle MoMo payment callback
  useEffect(() => {
    // Chỉ xử lý khi có params từ MoMo
    const orderId = search.get("orderId");
    const requestId = search.get("requestId");
    const resultCode = search.get("resultCode");
    const extraData = search.get("extraData");

    if (orderId && requestId && extraData && project) {
      // Check if this order has already been processed
      if (processedOrdersRef.current.has(orderId)) {
        console.log("Webhook already processed for orderId:", orderId);
        return;
      }

      // Mark this order as being processed
      processedOrdersRef.current.add(orderId);

      // Display payment status
      const isSuccess = resultCode === "0";
      if (isSuccess) {
        setPaymentSuccess(true);
      }

      // Gửi webhook về backend để update trạng thái
      const payload = {
        PartnerCode: search.get("partnerCode") || "MOMO",
        OrderId: orderId,
        RequestId: requestId,
        Amount: Number(search.get("amount")) || 0,
        ResponseTime: search.get("responseTime") || Date.now().toString(),
        Message: search.get("message") || "",
        ResultCode: Number(resultCode) || 0,
        PayUrl: search.get("payUrl") || "",
        ShortLink: search.get("shortLink") || "",
        OrderInfo: search.get("orderInfo") || "",
        PayType: search.get("payType") || "",
        TransId: search.get("transId") || "",
        ExtraData: extraData,
        Signature: search.get("signature") || "",
      };

      paymentsApi
        .manualWebhook(payload)
        .then(() => {
          console.log("Manual webhook successful");
          fetchProject(); // Refresh project data
        })
        .catch((error) => {
          console.error("Manual webhook failed:", error);
          processedOrdersRef.current.delete(orderId); // Allow retry on error
        });
    }
  }, [search, projectId, project]);

  const onChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (form.name && !form.name.trim()) {
      setError("Tên dự án không được để trống");
      return;
    }
    if (form.address && !form.address.trim()) {
      setError("Địa chỉ không được để trống");
      return;
    }
    if (form.floorArea && form.floorArea <= 0) {
      setError("Diện tích phải lớn hơn 0");
      return;
    }
    if (form.numberOfFloors && form.numberOfFloors <= 0) {
      setError("Số tầng phải lớn hơn 0");
      return;
    }
    if (form.budget && form.budget <= 0) {
      setError("Ngân sách phải lớn hơn 0");
      return;
    }
    if (
      form.estimatedCompletionDate &&
      form.startDate &&
      new Date(form.estimatedCompletionDate) <= new Date(form.startDate)
    ) {
      setError("Ngày hoàn thành dự kiến phải sau ngày bắt đầu");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Convert date format to ISO string for backend
      const updateData = {
        ...form,
        startDate: form.startDate
          ? new Date(form.startDate).toISOString()
          : undefined,
        estimatedCompletionDate: form.estimatedCompletionDate
          ? new Date(form.estimatedCompletionDate).toISOString()
          : undefined,
        // Remove status if it's empty string to avoid backend validation error
        status: form.status && form.status.trim() ? form.status : undefined,
      };

      const updated = await projectsApi.updateProject(projectId, updateData);
      setProject(updated);
      setEditing(false);
    } catch (e: any) {
      setError(
        e?.response?.data?.message || e?.message || "Failed to update project"
      );
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "Chưa có";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Ngày không hợp lệ";
      return date.toLocaleDateString("vi-VN");
    } catch (error) {
      return "Ngày không hợp lệ";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "text-green-400 bg-green-400/10 border-green-400/30";
      case "completed":
        return "text-blue-400 bg-blue-400/10 border-blue-400/30";
      case "onhold":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
      case "draft":
        return "text-gray-400 bg-gray-400/10 border-gray-400/30";
      default:
        return "text-stone-400 bg-stone-400/10 border-stone-400/30";
    }
  };

  // Supervisor registration logic
  const canRegisterSupervisor =
    !!project &&
    !project.supervisorId &&
    project.floorArea <= 400 &&
    project.hasSupervisorsAvailable;
  const monthlyPrice = !!project
    ? project.floorArea <= 200
      ? 8000000
      : 15000000
    : 0;

  const onRegisterSupervisor = async () => {
    if (!project) return;
    const confirmed = window.confirm(`Đăng ký giám sát viên với giá ${monthlyPrice.toLocaleString('vi-VN')}₫/tháng?`);
    if (!confirmed) return;
    try {
      setSaving(true);

      // Tạo supervisor contract trước
      const newContract = await supervisorContractsApi.create({
        projectId: projectId,
        monthlyPrice: monthlyPrice,
      });

      // Redirect đến tab contracts với contractId để highlight
      router.push(`/projects?tab=contracts&supervisorContractId=${newContract.id}`);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Đăng ký giám sát viên thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <>
        <Header />
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-stone-900 via-stone-900/95 to-stone-900 text-stone-100 pt-20">
          <div className="max-w-6xl mx-auto px-4 py-10">
            <div className="text-stone-300">Loading project...</div>
          </div>
        </div>
      </>
    );

  if (error)
    return (
      <>
        <Header />
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-stone-900 via-stone-900/95 to-stone-900 text-stone-100 pt-20">
          <div className="max-w-6xl mx-auto px-4 py-10">
            <div className="text-rose-400">{error}</div>
          </div>
        </div>
      </>
    );

  if (!project)
    return (
      <>
        <Header />
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-stone-900 via-stone-900/95 to-stone-900 text-stone-100 pt-20">
          <div className="max-w-6xl mx-auto px-4 py-10">
            <div className="text-stone-200">Project not found</div>
          </div>
        </div>
      </>
    );

  const inputCls =
    "w-full rounded-md border border-stone-700 bg-stone-900/60 text-stone-100 placeholder-stone-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition";
  const cardCls =
    "bg-stone-800/60 backdrop-blur-xl rounded-xl border border-stone-700 shadow-lg p-5 text-stone-100";
  const titleCls = "text-xl font-semibold text-amber-300 tracking-wide";
  const btnPrimary =
    "inline-flex items-center justify-center rounded-md bg-amber-600 text-stone-900 px-4 py-2 font-semibold hover:bg-amber-500 active:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed transition";
  const btnGhost =
    "inline-flex items-center justify-center rounded-md border border-stone-600 px-3 py-2 text-stone-200 hover:bg-stone-700/60 transition";
  const labelCls = "text-sm text-stone-300 mb-1 block";

  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-stone-900 via-stone-900/95 to-stone-900 text-stone-100 pt-20">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link
                  href="/projects"
                  className="text-stone-400 hover:text-stone-300 transition"
                >
                  ← Dự án
                </Link>
                <span className="text-stone-500">/</span>
                <h1 className="text-3xl font-extrabold tracking-tight text-amber-200">
                  {project.name}
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                    project.status
                  )}`}
                >
                  {project.status}
                </span>
                <span className="text-stone-400 text-sm">
                  Dự án ID: {project.id.slice(0, 8)}...
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              {canRegisterSupervisor && (
                <button
                  onClick={onRegisterSupervisor}
                  disabled={saving}
                  className={btnPrimary}
                >
                  Đăng ký giám sát viên ({monthlyPrice.toLocaleString("vi-VN")}
                  ₫/tháng)
                </button>
              )}
              {!editing && (
                <button onClick={() => setEditing(true)} className={btnPrimary}>
                  Chỉnh sửa
                </button>
              )}
            </div>
          </div>

          {supervisorContract && supervisorContract.status === 'Completed' && (
            <div className="mb-4 p-3 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
              ✓ Dự án đã được đăng ký giám sát viên thành công!
            </div>
          )}

          {search.get("resultCode") !== null &&
            search.get("resultCode") !== "0" && (
              <div className="mb-4 p-3 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-300">
                ✗ Thanh toán không thành công. Vui lòng thử lại.
              </div>
            )}

          {!project.supervisorId &&
            !project.hasSupervisorsAvailable &&
            project.floorArea <= 400 && (
              <div className="mb-4 p-3 rounded-md bg-yellow-500/10 border border-yellow-500/30 text-yellow-300">
                ℹ Hiện tại không có giám sát viên khả dụng. Vui lòng thử lại
                sau.
              </div>
            )}

          {editing ? (
            <form onSubmit={onSave} className={cardCls}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={titleCls}>Chỉnh sửa dự án</h2>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelCls} htmlFor="name">
                    Tên dự án
                  </label>
                  <input
                    id="name"
                    className={inputCls}
                    name="name"
                    value={form.name || ""}
                    onChange={onChange}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelCls} htmlFor="description">
                    Mô tả
                  </label>
                  <textarea
                    id="description"
                    className={`${inputCls} resize-none`}
                    rows={3}
                    name="description"
                    value={form.description || ""}
                    onChange={onChange}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelCls} htmlFor="address">
                    Địa chỉ
                  </label>
                  <input
                    id="address"
                    className={inputCls}
                    name="address"
                    value={form.address || ""}
                    onChange={onChange}
                  />
                </div>

                <div>
                  <label className={labelCls} htmlFor="floorArea">
                    Diện tích (m²)
                  </label>
                  <input
                    id="floorArea"
                    className={inputCls}
                    type="number"
                    name="floorArea"
                    min="0.1"
                    step="0.1"
                    value={form.floorArea || ""}
                    onChange={onChange}
                  />
                </div>

                <div>
                  <label className={labelCls} htmlFor="numberOfFloors">
                    Số tầng
                  </label>
                  <input
                    id="numberOfFloors"
                    className={inputCls}
                    type="number"
                    name="numberOfFloors"
                    min="1"
                    value={form.numberOfFloors || ""}
                    onChange={onChange}
                  />
                </div>

                <div>
                  <label className={labelCls} htmlFor="budget">
                    Ngân sách (VND)
                  </label>
                  <input
                    id="budget"
                    className={inputCls}
                    type="number"
                    name="budget"
                    min="1000000"
                    step="1000000"
                    value={form.budget || ""}
                    onChange={onChange}
                  />
                </div>

                <div>
                  <label className={labelCls} htmlFor="startDate">
                    Ngày bắt đầu
                  </label>
                  <input
                    id="startDate"
                    className={inputCls}
                    type="date"
                    name="startDate"
                    value={form.startDate || ""}
                    onChange={onChange}
                  />
                </div>

                <div>
                  <label className={labelCls} htmlFor="estimatedCompletionDate">
                    Ngày hoàn thành dự kiến
                  </label>
                  <input
                    id="estimatedCompletionDate"
                    className={inputCls}
                    type="date"
                    name="estimatedCompletionDate"
                    value={form.estimatedCompletionDate || ""}
                    min={form.startDate}
                    onChange={onChange}
                  />
                </div>

                <div>
                  <label className={labelCls} htmlFor="status">
                    Trạng thái
                  </label>
                  <select
                    id="status"
                    className={inputCls}
                    name="status"
                    value={form.status || ""}
                    onChange={onChange}
                  >
                    <option value="">Giữ nguyên</option>
                    <option value="Draft">Draft</option>
                    <option value="Active">Active</option>
                    <option value="OnHold">On Hold</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button type="submit" disabled={saving} className={btnPrimary}>
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
                <button
                  type="button"
                  className={btnGhost}
                  onClick={() => {
                    setEditing(false);
                    setError(null);
                    fetchProject(); // Reset form
                  }}
                >
                  Hủy
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Project Info */}
              <div className="lg:col-span-2">
                <div className={cardCls}>
                  <h2 className={`${titleCls} mb-4`}>Thông tin dự án</h2>
                  <div className="space-y-4">
                    <div>
                      <div className="text-stone-500 text-sm mb-1">Mô tả</div>
                      <div className="text-stone-100">
                        {project.description || "Chưa có mô tả"}
                      </div>
                    </div>

                    <div>
                      <div className="text-stone-500 text-sm mb-1">Địa chỉ</div>
                      <div className="text-stone-100">{project.address}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-stone-500 text-sm mb-1">
                          Diện tích
                        </div>
                        <div className="text-stone-100">
                          {project.floorArea}m²
                        </div>
                      </div>
                      <div>
                        <div className="text-stone-500 text-sm mb-1">
                          Số tầng
                        </div>
                        <div className="text-stone-100">
                          {project.numberOfFloors}
                        </div>
                      </div>
                      <div>
                        <div className="text-stone-500 text-sm mb-1">
                          Ngân sách
                        </div>
                        <div className="text-stone-100">
                          {formatCurrency(project.budget)}
                        </div>
                      </div>
                      <div>
                        <div className="text-stone-500 text-sm mb-1">
                          Ngày bắt đầu
                        </div>
                        <div className="text-stone-100">
                          {formatDate(project.startDate)}
                        </div>
                      </div>
                    </div>

                    {project.estimatedCompletionDate && (
                      <div>
                        <div className="text-stone-500 text-sm mb-1">
                          Ngày hoàn thành dự kiến
                        </div>
                        <div className="text-stone-100">
                          {formatDate(project.estimatedCompletionDate)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Participants - Replaced with MembersSection */}
                <div className={`${cardCls} mt-6`}>
                  <MembersSection
                    projectId={projectId}
                    currentUserRole={ProjectParticipantRole.Homeowner}
                  />
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className={cardCls}>
                  <div className="space-y-3">
                    <Link
                      href={`/projects/${project.id}/progress`}
                      className="block w-full text-center py-2 px-4 bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded-lg hover:bg-blue-600/30 transition"
                    >
                      Theo dõi tiến độ
                    </Link>

                    <Link
                      href={`/projects/${project.id}/budget`}
                      className="block w-full text-center py-2 px-4 bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 rounded-lg hover:bg-emerald-600/30 transition"
                    >
                      Dự toán & Gantt Chart
                    </Link>

                    <Link
                      href={`/projects/${project.id}/diary`}
                      className="block w-full text-center py-2 px-4 bg-teal-600/20 text-teal-300 border border-teal-500/30 rounded-lg hover:bg-teal-600/30 transition"
                    >
                      Nhật ký công trình
                    </Link>

                    <Link
                      href={`/projects/${project.id}/resources`}
                      className="block w-full text-center py-2 px-4 bg-orange-600/20 text-orange-300 border border-orange-500/30 rounded-lg hover:bg-orange-600/30 transition"
                    >
                      Báo cáo tài nguyên
                    </Link>

                    <Link
                      href={`/projects/${project.id}/chat`}
                      className="block w-full text-center py-2 px-4 bg-green-600/20 text-green-300 border border-green-500/30 rounded-lg hover:bg-green-600/30 transition"
                    >
                      Chat dự án
                    </Link>

                    <Link
                      href={`/projects/${project.id}/reports`}
                      className="block w-full text-center py-2 px-4 bg-purple-600/20 text-purple-300 border border-purple-500/30 rounded-lg hover:bg-purple-600/30 transition"
                    >
                      Báo cáo
                    </Link>

                    <Link
                      href={`/projects/${project.id}/3d-model`}
                      className="block w-full text-center py-2 px-4 bg-purple-600/20 text-purple-300 border border-purple-500/30 rounded-lg hover:bg-purple-600/30 transition"
                    >
                      Mô hình 3D
                    </Link>

                    <Link
                      href={`/projects/${project.id}/materials`}
                      className="block w-full text-center py-2 px-4 bg-amber-600/20 text-amber-300 border border-amber-500/30 rounded-lg hover:bg-amber-600/30 transition"
                    >
                      Quản lý vật tư
                    </Link>

                    {isHomeowner && (
                      <Link
                        href={`/projects/${project.id}/settings`}
                        className="block w-full text-center py-2 px-4 bg-gray-600/20 text-gray-300 border border-gray-500/30 rounded-lg hover:bg-gray-600/30 transition"
                      >
                        Cài đặt dự án
                      </Link>
                    )}
                  </div>
                </div>

                {/* Project Stats */}
                <div className={cardCls}>
                  <h3 className="text-lg font-semibold text-stone-100 mb-4">
                    Thống kê
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-stone-400">Trạng thái</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          project.status
                        )}`}
                      >
                        {project.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Thành viên</span>
                      <span className="text-stone-100">
                        {project.participants.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}