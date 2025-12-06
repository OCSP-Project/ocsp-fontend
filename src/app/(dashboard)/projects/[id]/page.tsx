"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import {
  paymentsApi,
  supervisorContractsApi,
} from "@/lib/contracts/contracts.api";
import {
  projectsApi,
  type ProjectDetailDto,
  type UpdateProjectDto,
} from "@/lib/projects/projects.api";
import { MembersSection } from "@/components/features/project-invitations/MembersSection";
import { ProjectParticipantRole } from "@/types/project-invitation.types";
import { useAuth, UserRole } from "@/hooks/useAuth";
import { authApi } from "@/lib/auth/auth.api";
import { chatApi, type ConversationListItem } from "@/lib/api/chat";
import { MessageOutlined, UserAddOutlined } from "@ant-design/icons";
import { message as antdMessage } from "antd";

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
  const [projectConversation, setProjectConversation] =
    useState<ConversationListItem | null>(null);
  const [loadingConversation, setLoadingConversation] = useState(false);

  // Check if current user is the project homeowner
  const isHomeowner = useMemo(() => {
    return user?.id === project?.homeownerId;
  }, [user?.id, project?.homeownerId]);
  const [form, setForm] = useState<UpdateProjectDto>({});
  const [supervisorContract, setSupervisorContract] = useState<{
    status: string;
  } | null>(null);

  // Track which orderIds have been processed to prevent duplicate webhook calls
  const getInitialProcessedOrders = (): Set<string> => {
    // Load previously processed orders from sessionStorage
    try {
      const stored = sessionStorage.getItem("processedMoMoOrders");
      if (stored) {
        const orders = JSON.parse(stored) as string[];
        return new Set(orders);
      }
    } catch (e) {
      console.error("Failed to load processed orders from sessionStorage:", e);
    }
    return new Set<string>();
  };
  const processedOrdersRef = React.useRef<Set<string>>(getInitialProcessedOrders());

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


  // Load project conversation
  useEffect(() => {
    if (user?.id && projectId) {
      loadProjectConversation();
    }
  }, [user?.id, projectId]);

  const loadProjectConversation = async () => {
    if (!user?.id) return;
    try {
      const conversations = await chatApi.getUserConversations(user.id);
      const projectConv = conversations.find((c) => c.projectId === projectId);
      setProjectConversation(projectConv || null);
    } catch (error) {
      console.error("Failed to load project conversation:", error);
    }
  };

  // Handle MoMo payment callback
  useEffect(() => {
    // Chỉ xử lý khi có params từ MoMo
    const orderId = search.get("orderId");
    const requestId = search.get("requestId");
    const resultCode = search.get("resultCode");
    const extraData = search.get("extraData");

    if (orderId && requestId && extraData && project) {
      // Check if this order has already been processed (only check ref, not sessionStorage)
      // We only mark as processed AFTER webhook succeeds to avoid skipping valid payments
      if (processedOrdersRef.current.has(orderId)) {
        console.log("Webhook already processed for orderId:", orderId);
        // Remove params if already processed to prevent re-processing
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, "", cleanUrl);
        return;
      }

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
        .then((response) => {
          console.log("Manual webhook successful", { orderId, resultCode, isSuccess, response });
          
          // Check payment purpose from extraData BEFORE marking as processed
          const purpose = extraData
            ? (() => {
                try {
                  const decoded = atob(extraData);
                  const parsed = JSON.parse(decoded);
                  return parsed.purpose;
                } catch (e) {
                  console.error("Failed to parse extraData:", e);
                  return null;
                }
              })()
            : null;

          console.log("Payment purpose:", purpose, "isSuccess:", isSuccess);

          // Only mark as processed if webhook succeeds AND payment is successful
          if (isSuccess) {
            processedOrdersRef.current.add(orderId);
            
            // Also store in sessionStorage to persist across reloads
            const processedOrders = JSON.parse(sessionStorage.getItem("processedMoMoOrders") || "[]");
            if (!processedOrders.includes(orderId)) {
              processedOrders.push(orderId);
              sessionStorage.setItem("processedMoMoOrders", JSON.stringify(processedOrders));
            }
          }

          // Remove MoMo callback params from URL to prevent infinite loop
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, "", cleanUrl);

          if (isSuccess && purpose === "supervisor-features") {
            antdMessage.success(
              "✓ Đăng ký dịch vụ giám sát thành công! Bạn đã có thể sử dụng các chức năng của giám sát viên.",
              5000
            );
            // Force useAuth to refresh token by making it think token is expired
            // This ensures we get the updated user with new role from backend
            try {
              // Set expiresAt to past date to force token refresh
              localStorage.setItem('expiresAt', new Date(Date.now() - 1000).toISOString());
              console.log("Forced token expiration to trigger refresh on reload");
            } catch (e) {
              console.error("Error setting expiresAt:", e);
            }
            // Reload page - useAuth will see expired token and refresh it, getting new user data
            setTimeout(() => {
              window.location.href = window.location.pathname;
            }, 2000);
          } else if (!isSuccess) {
            console.error("Payment failed:", { resultCode, message: search.get("message") });
            antdMessage.error(
              `Thanh toán không thành công. Mã lỗi: ${resultCode}. ${search.get("message") || ""}`,
              5000
            );
          } else {
            fetchProject(); // Refresh project data
          }
        })
        .catch((error) => {
          console.error("Manual webhook failed:", error);
          // Don't mark as processed if webhook fails - allow retry
          antdMessage.error("Lỗi xử lý webhook thanh toán. Vui lòng thử lại.");
          // Remove params on error to prevent retry loop
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, "", cleanUrl);
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
        return "text-green-600 bg-green-50 border-green-200";
      case "completed":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "onhold":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "draft":
        return "text-gray-600 bg-gray-50 border-gray-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const handleChatWithMember = async (memberUserId: string) => {
    if (!user?.id) return;
    try {
      const response = await chatApi.startConversation({
        userIds: [user.id, memberUserId],
        chatType: "consultation",
      });

      // Route based on user role
      let chatRoute = "/chat";
      if (user.role === UserRole.Contractor) {
        chatRoute = "/contractor/chat";
      } else if (user.role === UserRole.Supervisor) {
        // Supervisor can use the general chat route
        chatRoute = "/chat";
      }
      // Homeowner uses default /chat

      router.push(`${chatRoute}?conversationId=${response.conversationId}`);
    } catch (error) {
      console.error("Failed to start conversation:", error);
      antdMessage.error("Không thể tạo cuộc trò chuyện");
    }
  };

  const handleProjectChat = async () => {
    if (!user?.id || !project) return;

    try {
      setLoadingConversation(true);
      const participantIds = project.participants.map((p) => p.userId);

      if (projectConversation) {
        // Conversation exists, join all participants who are not already in
        const existingParticipantIds = projectConversation.participants.map(
          (p) => p.userId
        );
        const newParticipantIds = participantIds.filter(
          (id) => !existingParticipantIds.includes(id)
        );

        if (newParticipantIds.length > 0) {
          await chatApi.joinUsersToConversation(
            projectConversation.id,
            newParticipantIds
          );
          await loadProjectConversation();
        }
        router.push(`/projects/${projectId}/chat`);
      } else {
        // Create new conversation with all participants
        const response = await chatApi.startConversation({
          projectId: projectId,
          userIds: participantIds,
          chatType: "project",
        });
        await loadProjectConversation();
        router.push(`/projects/${projectId}/chat`);
      }
    } catch (error) {
      console.error("Failed to handle project chat:", error);
      antdMessage.error("Không thể tạo/join cuộc trò chuyện dự án");
    } finally {
      setLoadingConversation(false);
    }
  };

  const handleJoinMemberToProjectChat = async (memberUserId: string) => {
    if (!projectConversation) {
      antdMessage.warning("Cuộc trò chuyện dự án chưa được tạo");
      return;
    }

    try {
      await chatApi.joinUsersToConversation(projectConversation.id, [
        memberUserId,
      ]);
      await loadProjectConversation();
      antdMessage.success("Đã thêm thành viên vào cuộc trò chuyện");
    } catch (error) {
      console.error("Failed to join member:", error);
      antdMessage.error("Không thể thêm thành viên vào cuộc trò chuyện");
    }
  };

  const isMemberInProjectChat = (memberUserId: string) => {
    if (!projectConversation) return false;
    return projectConversation.participants.some(
      (p) => p.userId === memberUserId
    );
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
    const confirmed = window.confirm(
      `Đăng ký giám sát viên với phí đăng ký ${monthlyPrice.toLocaleString(
        "vi-VN"
      )}₫?`
    );
    if (!confirmed) return;
    try {
      setSaving(true);

      // Tạo supervisor contract trước
      const newContract = await supervisorContractsApi.create({
        projectId: projectId,
        monthlyPrice: monthlyPrice,
      });

      // Redirect đến tab contracts với contractId để highlight
      router.push(
        `/projects?tab=contracts&supervisorContractId=${newContract.id}`
      );
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Đăng ký giám sát viên thất bại"
      );
    } finally {
      setSaving(false);
    }
  };

  // Supervisor features registration logic
  const supervisorFeaturesPrice = 500000; 
  // Check if user has supervisor features (role is Supervisor)
  const hasSupervisorFeaturesRole = user?.role === UserRole.Supervisor;
  const canRegisterSupervisorFeatures = isHomeowner && user?.role === UserRole.Homeowner;

  const onRegisterSupervisorFeatures = async () => {
    if (!project || !user) return;
    const confirmed = window.confirm(
      `Đăng ký dịch vụ sử dụng các chức năng giám sát với phí ${supervisorFeaturesPrice.toLocaleString(
        "vi-VN"
      )}₫?`
    );
    if (!confirmed) return;
    try {
      setSaving(true);
      setError(null);

      // Use the same redirect URL format as supervisor payment
      const redirectUrl = `${window.location.origin}/projects/${projectId}`;
      
      console.log("[Supervisor Features] Creating payment:", {
        amount: supervisorFeaturesPrice,
        projectId,
        redirectUrl,
        purpose: "supervisor-features",
      });

      const res = await paymentsApi.momoCreate({
        amount: supervisorFeaturesPrice,
        description: "Phí đăng ký dịch vụ sử dụng các chức năng giám sát",
        projectId: projectId,
        redirectUrl: redirectUrl,
        purpose: "supervisor-features",
      });

      console.log("[Supervisor Features] Payment response:", res);

      if (res?.payUrl) {
        console.log("[Supervisor Features] Redirecting to:", res.payUrl);
        window.location.href = res.payUrl;
      } else {
        console.error("[Supervisor Features] No payUrl in response:", res);
        setError("Không lấy được liên kết thanh toán");
      }
    } catch (e: any) {
      console.error("[Supervisor Features] Payment creation error:", e);
      const errorMessage =
        e?.response?.data?.message ||
        e?.response?.data ||
        e?.message ||
        "Đăng ký dịch vụ giám sát thất bại";
      setError(errorMessage);
      antdMessage.error(`Lỗi: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <>
        <Header />
        <div className="min-h-[calc(100vh-4rem)] bg-white text-gray-700 pt-20">
          <div className="max-w-6xl mx-auto px-4 py-10">
            <div className="text-gray-500">Loading project...</div>
          </div>
        </div>
      </>
    );

  if (error)
    return (
      <>
        <Header />
        <div className="min-h-[calc(100vh-4rem)] bg-white text-gray-700 pt-20">
          <div className="max-w-6xl mx-auto px-4 py-10">
            <div className="text-red-600">{error}</div>
          </div>
        </div>
      </>
    );

  if (!project)
    return (
      <>
        <Header />
        <div className="min-h-[calc(100vh-4rem)] bg-white text-gray-700 pt-20">
          <div className="max-w-6xl mx-auto px-4 py-10">
            <div className="text-gray-600">Project not found</div>
          </div>
        </div>
      </>
    );

  const inputCls =
    "w-full rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#38c1b6] focus:border-[#38c1b6] transition";
  const cardCls =
    "bg-white backdrop-blur-xl rounded-xl border border-gray-200 shadow-lg p-5 text-gray-700 hover:shadow-xl transition-shadow";
  const titleCls =
    "text-xl font-semibold bg-gradient-to-r from-[#38c1b6] to-[#667eea] bg-clip-text text-transparent tracking-wide";
  const btnPrimary =
    "inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-[#38c1b6] to-[#667eea] text-white px-4 py-2 font-semibold hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition shadow-lg hover:shadow-xl";
  const btnGhost =
    "inline-flex items-center justify-center rounded-lg border border-gray-300 px-3 py-2 text-gray-700 hover:bg-gray-50 transition";
  const labelCls = "text-sm text-gray-700 mb-1 block font-medium";

  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-4rem)] bg-white text-gray-700 pt-20">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link
                  href="/projects"
                  className="text-gray-500 hover:text-[#38c1b6] transition"
                >
                  ← Dự án
                </Link>
                <span className="text-gray-400">/</span>
                <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-[#38c1b6] to-[#667eea] bg-clip-text text-transparent">
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
                <span className="text-gray-500 text-sm">
                  Dự án ID: {project.id.slice(0, 8)}...
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              {canRegisterSupervisorFeatures && (
                <button
                  onClick={onRegisterSupervisorFeatures}
                  disabled={saving}
                  className={btnPrimary}
                >
                  Đăng ký dịch vụ giám sát ({supervisorFeaturesPrice.toLocaleString("vi-VN")}₫)
                </button>
              )}
              {canRegisterSupervisor && (
                <button
                  onClick={onRegisterSupervisor}
                  disabled={saving}
                  className={btnPrimary}
                >
                  Đăng ký giám sát viên ({monthlyPrice.toLocaleString("vi-VN")}
                  ₫)
                </button>
              )}
              {!editing && (
                <button onClick={() => setEditing(true)} className={btnPrimary}>
                  Chỉnh sửa
                </button>
              )}
            </div>
          </div>

          {supervisorContract && supervisorContract.status === "Completed" && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">
              ✓ Dự án đã được đăng ký giám sát viên thành công!
            </div>
          )}

          {hasSupervisorFeaturesRole && isHomeowner && (
            <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700">
              ✓ Bạn đã đăng ký sử dụng các dịch vụ giám sát. Bạn có thể sử dụng các chức năng của giám sát viên.
            </div>
          )}

          {search.get("resultCode") !== null &&
            search.get("resultCode") !== "0" && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
                ✗ Thanh toán không thành công. Vui lòng thử lại.
              </div>
            )}

          {!project.supervisorId &&
            !project.hasSupervisorsAvailable &&
            project.floorArea <= 400 && (
              <div className="mb-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-700">
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
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
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
                      <div className="text-gray-500 text-sm mb-1">Mô tả</div>
                      <div className="text-gray-900">
                        {project.description || "Chưa có mô tả"}
                      </div>
                    </div>

                    <div>
                      <div className="text-gray-500 text-sm mb-1">Địa chỉ</div>
                      <div className="text-gray-900">{project.address}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-gray-500 text-sm mb-1">
                          Diện tích
                        </div>
                        <div className="text-gray-900">
                          {project.floorArea}m²
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-sm mb-1">
                          Số tầng
                        </div>
                        <div className="text-gray-900">
                          {project.numberOfFloors}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-sm mb-1">
                          Ngân sách
                        </div>
                        <div className="text-gray-900">
                          {formatCurrency(project.budget)}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-sm mb-1">
                          Ngày bắt đầu
                        </div>
                        <div className="text-gray-900">
                          {formatDate(project.startDate)}
                        </div>
                      </div>
                    </div>

                    {project.estimatedCompletionDate && (
                      <div>
                        <div className="text-gray-500 text-sm mb-1">
                          Ngày hoàn thành dự kiến
                        </div>
                        <div className="text-gray-900">
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
                      className="block w-full text-center py-2 px-4 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
                    >
                      Theo dõi tiến độ
                    </Link>

                    <Link
                      href={`/projects/${project.id}/budget`}
                      className="block w-full text-center py-2 px-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition"
                    >
                      Dự toán & Gantt Chart
                    </Link>

                    <Link
                      href={`/projects/${project.id}/diary`}
                      className="block w-full text-center py-2 px-4 bg-[#38c1b6]/10 text-[#38c1b6] border border-[#38c1b6]/30 rounded-lg hover:bg-[#38c1b6]/20 transition"
                    >
                      Nhật ký công trình
                    </Link>

                    <Link
                      href={`/projects/${project.id}/resources`}
                      className="block w-full text-center py-2 px-4 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg hover:bg-orange-100 transition"
                    >
                      Báo cáo tài nguyên
                    </Link>

                    <button
                      onClick={handleProjectChat}
                      disabled={loadingConversation}
                      className="block w-full text-center py-2 px-4 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingConversation ? "Đang xử lý..." : "Chat dự án"}
                    </button>

                    <Link
                      href={`/projects/${project.id}/reports`}
                      className="block w-full text-center py-2 px-4 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 transition"
                    >
                      Báo cáo
                    </Link>

                    <Link
                      href={`/projects/${project.id}/3d-model`}
                      className="block w-full text-center py-2 px-4 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 transition"
                    >
                      Mô hình 3D
                    </Link>

                    <Link
                      href={`/projects/${project.id}/materials`}
                      className="block w-full text-center py-2 px-4 bg-[#38c1b6]/10 text-[#38c1b6] border border-[#38c1b6]/30 rounded-lg hover:bg-[#38c1b6]/20 transition"
                    >
                      Quản lý vật tư
                    </Link>

                    {isHomeowner && (
                      <Link
                        href={`/projects/${project.id}/settings`}
                        className="block w-full text-center py-2 px-4 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-100 transition"
                      >
                        Cài đặt dự án
                      </Link>
                    )}
                  </div>
                </div>

                {/* Project Stats */}
                <div className={cardCls}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Thống kê
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trạng thái</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          project.status
                        )}`}
                      >
                        {project.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Thành viên</span>
                      <span className="text-gray-900">
                        {project.participants.length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Members List */}
                <div className={cardCls}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Thành viên dự án
                  </h3>
                  <div className="space-y-3">
                    {project.participants.length === 0 ? (
                      <div className="text-gray-500 text-sm text-center py-4">
                        Chưa có thành viên
                      </div>
                    ) : (
                      project.participants.map((participant) => {
                        const isInChat = isMemberInProjectChat(
                          participant.userId
                        );
                        const isCurrentUser = participant.userId === user?.id;

                        return (
                          <div
                            key={participant.userId}
                            className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">
                                  {participant.userName}
                                </span>
                                {isCurrentUser && (
                                  <span className="text-xs text-gray-500">
                                    (Bạn)
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {participant.role}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {!isCurrentUser && (
                                <button
                                  onClick={() =>
                                    handleChatWithMember(participant.userId)
                                  }
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                  title="Nhắn tin riêng"
                                >
                                  <MessageOutlined />
                                </button>
                              )}
                              {!isCurrentUser &&
                                !isInChat &&
                                projectConversation && (
                                  <button
                                    onClick={() =>
                                      handleJoinMemberToProjectChat(
                                        participant.userId
                                      )
                                    }
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                    title="Thêm vào chat dự án"
                                  >
                                    <UserAddOutlined />
                                  </button>
                                )}
                            </div>
                          </div>
                        );
                      })
                    )}
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
