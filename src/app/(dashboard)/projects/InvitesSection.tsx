"use client";

import React, { useEffect, useMemo, useState } from "react";
import { notification } from "antd";
import { FileTextOutlined, DownloadOutlined } from "@ant-design/icons";
import {
  contractorQuotesApi,
  type QuoteRequestDetailDto,
  type ProjectDocumentDto,
} from "@/lib/quotes/quotes.contractor.api";
import { projectsApi } from "@/lib/projects/projects.api";
import {
  proposalsApi,
  type CreateProposalDto,
  type UpdateProposalDto,
  type ProposalDto as ApiProposalDto,
} from "@/lib/proposals/proposals.api";
import {
  ProposalDisplay,
  EditProposalModal,
} from "@/components/features/proposals";
import type { ProposalDto } from "@/lib/proposals/proposal.types";

interface Props {}

export default function InvitesSection({}: Props) {
  // UI tokens tuned to match the Login page palette (teal/indigo on light glass)
  const wrapperCls =
    "relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-50 via-white to-indigo-50 border border-teal-100/60 shadow-xl";
  const cardCls =
    "bg-white/90 backdrop-blur-xl rounded-2xl border border-white/70 shadow-lg p-5 text-slate-800";
  const titleCls = "text-xl font-semibold text-slate-900 tracking-wide";
  const primaryBtnCls =
    "px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-indigo-500 text-white shadow-md hover:shadow-lg transition";
  const ghostBtnCls =
    "px-3 py-2 rounded-lg bg-white/80 text-slate-700 border border-slate-200 hover:border-teal-200 hover:text-teal-700 transition";
  const subtleTextCls = "text-sm text-slate-500";

  // Convert API ProposalDto to Display ProposalDto
  const convertApiProposalToDisplay = (
    apiProposal: ApiProposalDto
  ): ProposalDto => {
    return {
      id: apiProposal.id,
      quoteRequestId: apiProposal.quoteRequestId,
      contractorUserId: apiProposal.contractorUserId,
      priceTotal: apiProposal.priceTotal,
      durationDays: apiProposal.durationDays,
      termsSummary: apiProposal.termsSummary,
      status: apiProposal.status,
      createdAt: new Date().toISOString(), // Default value
      updatedAt: new Date().toISOString(), // Default value
      items: apiProposal.items.map((item) => ({
        name: item.name,
        price: item.price,
        notes: item.notes,
      })),
      contractor: undefined, // Not available in API
      quoteRequest: undefined, // Not available in API
      isFromExcel: apiProposal.isFromExcel,
      excelFileName: apiProposal.excelFileName,
      excelFileUrl: apiProposal.excelFileUrl,
      projectTitle: apiProposal.projectTitle,
      constructionArea: apiProposal.constructionArea,
      constructionTime: apiProposal.constructionTime,
      numberOfWorkers: apiProposal.numberOfWorkers,
      averageSalary: apiProposal.averageSalary,
    };
  };

  // Convert Display ProposalDto back to API ProposalDto
  const convertDisplayProposalToApi = (
    displayProposal: ProposalDto
  ): ApiProposalDto => {
    return {
      id: displayProposal.id,
      quoteRequestId: displayProposal.quoteRequestId,
      contractorUserId: displayProposal.contractorUserId,
      priceTotal: displayProposal.priceTotal,
      durationDays: displayProposal.durationDays,
      termsSummary: displayProposal.termsSummary,
      status: displayProposal.status,
      items: displayProposal.items.map((item) => ({
        id: "", // Generate new ID if needed
        name: item.name,
        price: item.price,
        notes: item.notes,
      })),
      isFromExcel: displayProposal.isFromExcel || false,
      excelFileName: displayProposal.excelFileName,
      excelFileUrl: displayProposal.excelFileUrl,
      projectTitle: displayProposal.projectTitle,
      constructionArea: displayProposal.constructionArea,
      constructionTime: displayProposal.constructionTime,
      numberOfWorkers: displayProposal.numberOfWorkers,
      averageSalary: displayProposal.averageSalary,
    };
  };

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [invites, setInvites] = useState<QuoteRequestDetailDto[]>([]);

  // Proposal form state
  const [showFormFor, setShowFormFor] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [showProposalDetail, setShowProposalDetail] = useState<string | null>(
    null
  );
  const [proposalDetail, setProposalDetail] = useState<ProposalDto | null>(
    null
  );
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [showProjectDetail, setShowProjectDetail] = useState<string | null>(
    null
  );
  const [projectDetailData, setProjectDetailData] =
    useState<QuoteRequestDetailDto | null>(null);
  const [showQuoteDetailFor, setShowQuoteDetailFor] = useState<string | null>(
    null
  );
  const [quoteDetailLoading, setQuoteDetailLoading] = useState<boolean>(false);
  const [quoteDetailData, setQuoteDetailData] =
    useState<QuoteRequestDetailDto | null>(null);

  // Edit proposal modal state
  const [editProposalModalVisible, setEditProposalModalVisible] =
    useState(false);
  const [editingProposal, setEditingProposal] = useState<ProposalDto | null>(
    null
  );
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);

  // Color helpers for highlighting status
  const statusColorClass = (status?: string) => {
    switch (status) {
      case "Sent":
        return "text-blue-400";
      case "Closed":
      case "Accepted":
        return "text-green-400";
      case "Rejected":
        return "text-rose-400";
      case "Submitted":
        return "text-amber-400";
      case "Resubmitted":
        return "text-purple-400";
      case "RevisionRequested":
        return "text-orange-400";
      case "Draft":
        return "text-stone-300";
      default:
        return "text-stone-300";
    }
  };

  const loadInvites = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await contractorQuotesApi.myInvitesDetailed();
      setInvites(data);
    } catch (e: any) {
      setError(e?.response?.data || e?.message || "Không tải được lời mời");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvites();
  }, []);

  const resetForm = () => {
    setExcelFile(null);
  };

  const onUploadExcel = async (quoteId: string) => {
    if (!excelFile) {
      notification.warning({
        message: "Chưa chọn file",
        description: "Vui lòng chọn file .xlsx",
      });
      return;
    }
    try {
      setUploading(true);
      await proposalsApi.uploadExcel(quoteId, excelFile);
      setShowFormFor(null);
      resetForm();
      await loadInvites();
      notification.success({
        message: "Thành công",
        description: "Đã tải file Excel. Hệ thống sẽ xử lý và sinh proposal.",
      });
    } catch (e: any) {
      notification.error({
        message: "Lỗi",
        description: e?.response?.data || e?.message || "Tải file thất bại",
      });
    } finally {
      setUploading(false);
    }
  };

  const onViewProposalDetail = async (quoteId: string) => {
    try {
      const apiProposal = await proposalsApi.getMineByQuote(quoteId);
      const proposal = convertApiProposalToDisplay(apiProposal);
      setProposalDetail(proposal);
      setShowProposalDetail(quoteId);
    } catch (e: any) {
      notification.error({
        message: "Lỗi",
        description:
          e?.response?.data || e?.message || "Không thể tải proposal",
      });
    }
  };

  const onCreateProposal = async (_quoteId: string) => {
    notification.info({
      message: "Thông báo",
      description: "Tạo đề xuất trực tiếp đã được thay bằng upload Excel.",
    });
  };

  const onSubmitProposal = async (proposalId: string) => {
    try {
      await proposalsApi.submit(proposalId);
      await loadInvites();
      notification.success({
        message: "Thành công",
        description: "Đã nộp đề xuất",
      });
    } catch (e: any) {
      notification.error({
        message: "Lỗi",
        description:
          e?.response?.data || e?.message || "Submit Proposal thất bại",
      });
    }
  };

  const onEditProposal = async (quoteId: string) => {
    try {
      const apiProposal = await proposalsApi.getMineByQuote(quoteId);
      const proposal = convertApiProposalToDisplay(apiProposal);
      setEditingProposal(proposal);
      setEditingQuoteId(quoteId);
      setEditProposalModalVisible(true);
    } catch (e: any) {
      notification.error({
        message: "Lỗi",
        description:
          e?.response?.data ||
          e?.message ||
          "Không thể tải proposal để chỉnh sửa",
      });
    }
  };

  const onSaveDraft = async (_quoteId: string) => {
    notification.info({
      message: "Thông báo",
      description: "Lưu nháp trực tiếp đã được thay bằng upload Excel.",
    });
  };

  const handleEditProposalSuccess = async () => {
    // Refresh invites data to show updated proposal
    await loadInvites();
  };

  const handleCloseEditModal = () => {
    setEditProposalModalVisible(false);
    setEditingProposal(null);
    setEditingQuoteId(null);
  };

  const handleViewProjectDetail = (quoteId: string) => {
    const quote = invites.find((q) => q.id === quoteId);
    if (quote) {
      setProjectDetailData(quote);
      setShowProjectDetail(quoteId);
    }
  };

  const handleViewQuoteDetail = async (quoteId: string) => {
    try {
      setQuoteDetailLoading(true);
      setShowQuoteDetailFor(quoteId);
      setQuoteDetailData(null);
      const detail = await contractorQuotesApi.getDetail(quoteId);
      setQuoteDetailData(detail);
    } catch (e) {
      // ignore
    } finally {
      setQuoteDetailLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const downloadBlob = (blob: Blob, fileName: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || "document";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const onDownloadTemplate = async () => {
    try {
      const API_BASE =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
      const response = await fetch(`${API_BASE}/templates/proposal-excel`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download template");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "proposal-template.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      notification.success({
        message: "Thành công",
        description: "Đã tải template Excel thành công!",
      });
    } catch (e: any) {
      notification.error({
        message: "Lỗi",
        description:
          "Tải template thất bại: " + (e?.message || "Lỗi không xác định"),
      });
    }
  };

  const onDownloadDocument = async (
    doc: ProjectDocumentDto,
    projectId: string
  ) => {
    try {
      const blob = await projectsApi.downloadDocumentById(doc.id);
      downloadBlob(blob, doc.fileName);
    } catch (e: any) {
      notification.error({
        message: "Lỗi",
        description:
          e?.response?.data?.message || e?.message || "Không thể tải tài liệu",
      });
    }
  };

  return (
    <div className={`${wrapperCls} p-6 grid grid-cols-1 gap-6`}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-teal-600 uppercase tracking-[0.2em]">
            Invites
          </p>
          <h3 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Lời mời báo giá
          </h3>
          <p className={subtleTextCls}>
            Quản lý và phản hồi các lời mời báo giá của bạn.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button className={primaryBtnCls} onClick={onDownloadTemplate}>
            📥 Tải Template Excel
          </button>
          <button className={ghostBtnCls} onClick={loadInvites}>
            ↻ Tải lại
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-slate-500">Đang tải...</div>
      ) : error ? (
        <div className="text-rose-500">{error}</div>
      ) : invites.length === 0 ? (
        <div className={cardCls}>Hiện chưa có lời mời nào</div>
      ) : (
        <div className="space-y-4">
          {invites.map((q) => (
            <div key={q.id} className={cardCls}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-slate-900 font-semibold mb-1">
                    {q.scope || "Không có mô tả"}
                  </div>
                  <div className="text-xs text-slate-500">
                    Dự án: {q.project?.name} • {q.project?.address}
                  </div>
                  <div className="text-xs text-slate-500">
                    Trạng thái: {q.status}
                  </div>
                </div>
                <div className="text-xs text-slate-400">
                  #{q.id.slice(0, 8)}
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <button
                  className={ghostBtnCls}
                  onClick={() => handleViewProjectDetail(q.id)}
                >
                  Chi tiết dự án
                </button>
                <button
                  className="px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white shadow-sm transition"
                  onClick={() => void handleViewQuoteDetail(q.id)}
                >
                  Chi tiết yêu cầu báo giá
                </button>
                {!q.myProposal?.id ? (
                  <button
                    className={primaryBtnCls}
                    onClick={() => setShowFormFor(q.id)}
                  >
                    Tạo đề xuất
                  </button>
                ) : (
                  <>
                    {/* Status Display */}
                    {q.myProposal.status === "RevisionRequested" ? (
                      <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-700">
                        <span className="text-sm font-medium">
                          ⚠️ Yêu cầu chỉnh sửa đề xuất báo giá từ chủ nhà
                        </span>
                        <span className="text-xs text-amber-600">
                          Vui lòng liên hệ với chủ nhà để thảo luận vấn đề cần
                          chỉnh sửa. Sau đó vui lòng chỉnh sửa đề xuất và nộp
                          lại
                        </span>
                      </div>
                    ) : q.myProposal.status === "Resubmitted" ? (
                      <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-700">
                        <span className="text-sm font-medium">
                          ✅ Đã chỉnh sửa và gửi lại
                        </span>
                        <span className="text-xs text-indigo-600">
                          Proposal đã được cập nhật và gửi lại cho chủ nhà
                        </span>
                      </div>
                    ) : (
                      <span
                        className={`text-xs font-medium ${statusColorClass(
                          q.myProposal.status
                        )}`}
                      >
                        Proposal: {q.myProposal.status}
                      </span>
                    )}

                    {/* Action Buttons */}
                    {q.myProposal.status === "Draft" && (
                      <button
                        className={ghostBtnCls}
                        onClick={() => onEditProposal(q.id)}
                      >
                        Sửa đề xuất
                      </button>
                    )}
                    {q.myProposal.status === "Draft" && (
                      <button
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white disabled:opacity-50 shadow-sm transition"
                        onClick={() => onSubmitProposal(q.myProposal!.id!)}
                      >
                        Nộp đề xuất
                      </button>
                    )}
                    {q.myProposal.status === "RevisionRequested" && (
                      <button
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-white shadow-sm transition"
                        onClick={() => onEditProposal(q.id)}
                      >
                        Chỉnh sửa đề xuất
                      </button>
                    )}
                    {q.myProposal.status === "RevisionRequested" && (
                      <button
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white disabled:opacity-50 shadow-sm transition"
                        onClick={() => onSubmitProposal(q.myProposal!.id!)}
                      >
                        Nộp đề xuất
                      </button>
                    )}
                    {q.myProposal && (
                      <button
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white shadow-sm transition"
                        onClick={() => onViewProposalDetail(q.id)}
                      >
                        Xem đề xuất
                      </button>
                    )}
                  </>
                )}
              </div>

              {showFormFor === q.id && (
                <div className="mt-4 border-t border-slate-200 pt-4">
                  <div className="mb-4 p-4 bg-gradient-to-r from-teal-50 to-indigo-50 border border-teal-100 rounded-lg">
                    <h4 className="text-teal-700 font-semibold mb-2">
                      📋 Hướng dẫn tạo đề xuất:
                    </h4>
                    <ol className="text-sm text-slate-700 space-y-1">
                      <li>1. Nhấn "📥 Tải Template Excel" để tải file mẫu</li>
                      <li>
                        2. Mở file Excel và chỉnh sửa sao cho phù hợp với dự án
                      </li>
                      <li>3. Upload file Excel đã hoàn thành ở bên dưới</li>
                    </ol>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-600 mb-1">
                      Upload Proposal (.xlsx)
                    </label>
                    <input
                      type="file"
                      accept=".xlsx"
                      className="w-full bg-white/80 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-200"
                      onChange={(e) =>
                        setExcelFile(e.target.files?.[0] || null)
                      }
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      Chỉ chấp nhận tệp Excel (.xlsx). Hệ thống sẽ xử lý và sinh
                      proposal.
                    </p>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <button
                      disabled={uploading || !excelFile}
                      className={`${primaryBtnCls} disabled:opacity-60`}
                      onClick={() => onUploadExcel(q.id)}
                    >
                      {uploading ? "Đang tải..." : "Tải lên Excel"}
                    </button>
                    <button
                      className={ghostBtnCls}
                      onClick={() => {
                        setShowFormFor(null);
                        resetForm();
                      }}
                    >
                      Huỷ
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Project Detail Modal */}
      {showProjectDetail && projectDetailData && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 w-full max-w-6xl mx-auto max-h-[90vh] overflow-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-slate-900">
                Chi tiết dự án
              </h3>
              <button
                className="text-slate-400 hover:text-slate-600 text-2xl"
                onClick={() => {
                  setShowProjectDetail(null);
                  setProjectDetailData(null);
                }}
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Project Information */}
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <h4 className="text-xl font-semibold text-slate-900 mb-6">
                  Thông tin dự án
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-slate-500 text-sm mb-2">Mô tả</p>
                    <p className="text-slate-900 text-lg">
                      {projectDetailData.project.description || "Chưa có mô tả"}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm mb-2">Địa chỉ</p>
                    <p className="text-slate-900 text-lg">
                      {projectDetailData.project.address || "Chưa cập nhật"}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm mb-2">Diện tích</p>
                    <p className="text-slate-900 text-lg">
                      {projectDetailData.project.floorArea
                        ? `${projectDetailData.project.floorArea}m²`
                        : "Chưa cập nhật"}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm mb-2">Số tầng</p>
                    <p className="text-slate-900 text-lg">
                      {projectDetailData.project.numberOfFloors ||
                        "Chưa cập nhật"}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm mb-2">
                      Trạng thái dự án
                    </p>
                    <p className="text-emerald-600 font-medium text-lg">
                      Active
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => {
                    setShowProjectDetail(null);
                    setProjectDetailData(null);
                  }}
                  className={ghostBtnCls}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quote Request Detail Modal */}
      {showQuoteDetailFor && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 w-full max-w-4xl mx-auto max-h-[90vh] overflow-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-slate-900">
                Chi tiết yêu cầu báo giá
              </h3>
              <button
                className="text-slate-400 hover:text-slate-600 text-2xl"
                onClick={() => {
                  setShowQuoteDetailFor(null);
                  setQuoteDetailData(null);
                }}
              >
                ×
              </button>
            </div>
            {quoteDetailLoading || !quoteDetailData ? (
              <div className="text-slate-500">Đang tải...</div>
            ) : (
              <div className="space-y-4 text-sm text-slate-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500">Mô tả phạm vi:</span>{" "}
                    <span className="text-slate-900">
                      {quoteDetailData.scope || "—"}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500">Trạng thái:</span>{" "}
                    <span className="text-slate-900">
                      {quoteDetailData.status}
                    </span>
                  </div>
                </div>
                <div className="border-t border-slate-200 pt-3">
                  <div className="text-slate-500 mb-2">Chủ nhà</div>
                  <div className="text-slate-900">
                    {quoteDetailData.homeowner.username} (
                    {quoteDetailData.homeowner.email})
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-3">
                  <div className="text-slate-500 mb-2">Dự án</div>
                  <div className="text-slate-900">
                    {quoteDetailData.project.name} •{" "}
                    {quoteDetailData.project.address}
                  </div>

                  {/* Project Documents Section */}
                  {quoteDetailData.project.documents &&
                  quoteDetailData.project.documents.length > 0 ? (
                    <div className="mt-4">
                      <div className="text-slate-600 mb-3 font-medium">
                        Tài liệu đính kèm dự án
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {quoteDetailData.project.documents
                          .filter(
                            (d: ProjectDocumentDto) =>
                              d.documentType === 1 || d.documentType === 2
                          )
                          .map((doc: ProjectDocumentDto) => (
                            <button
                              key={doc.id}
                              onClick={() =>
                                onDownloadDocument(
                                  doc,
                                  quoteDetailData.project.id
                                )
                              }
                              className="flex items-center gap-3 text-left p-4 rounded-lg bg-white border border-slate-200 hover:border-teal-200 hover:shadow-md transition-colors group"
                            >
                              <FileTextOutlined className="text-amber-500 text-xl group-hover:text-amber-400" />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-slate-900 mb-1">
                                  {doc.documentTypeName}
                                </div>
                                <div className="text-xs text-slate-600 truncate">
                                  {doc.fileName}
                                </div>
                                {doc.fileSizeFormatted && (
                                  <div className="text-xs text-slate-500 mt-1">
                                    {doc.fileSizeFormatted}
                                  </div>
                                )}
                              </div>
                              <DownloadOutlined className="text-slate-400 group-hover:text-teal-500" />
                            </button>
                          ))}
                      </div>
                      {quoteDetailData.project.documents.filter(
                        (d: ProjectDocumentDto) =>
                          d.documentType === 1 || d.documentType === 2
                      ).length === 0 && (
                        <div className="text-slate-500 text-sm italic">
                          Chưa có tài liệu Drawing hoặc Permit
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-4 text-slate-500 text-sm italic">
                      Chưa có tài liệu đính kèm
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="mt-6 text-right">
              <button
                className={ghostBtnCls}
                onClick={() => {
                  setShowQuoteDetailFor(null);
                  setQuoteDetailData(null);
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Proposal Detail Modal */}
      {showProposalDetail && proposalDetail && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl border-2 border-gray-200 max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b-2 border-gray-200">
              <h2
                className="text-xl font-bold"
                style={{
                  background:
                    "linear-gradient(135deg, #38c1b6 0%, #667eea 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                ĐỀ XUẤT BÁO GIÁ
              </h2>
              <button
                onClick={() => {
                  setShowProposalDetail(null);
                  setProposalDetail(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] bg-white">
              <ProposalDisplay proposal={proposalDetail} />
            </div>
          </div>
        </div>
      )}

      {/* Edit Proposal Modal */}
      {editingProposal && editingQuoteId && (
        <EditProposalModal
          proposal={convertDisplayProposalToApi(editingProposal)}
          quoteId={editingQuoteId}
          visible={editProposalModalVisible}
          onClose={handleCloseEditModal}
          onSuccess={handleEditProposalSuccess}
        />
      )}
    </div>
  );
}
