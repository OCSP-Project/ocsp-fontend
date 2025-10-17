"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { contractorQuotesApi, type QuoteRequestDetailDto, type ProjectDocumentDto } from '@/lib/quotes/quotes.contractor.api';
import { projectsApi } from '@/lib/projects/projects.api';
import { proposalsApi, type CreateProposalDto, type UpdateProposalDto, type ProposalDto } from '@/lib/proposals/proposals.api';
import ProposalDisplay from '@/components/ProposalDisplay';

interface Props {}

export default function InvitesSection({}: Props) {
  const cardCls = 'bg-stone-800/60 backdrop-blur-xl rounded-xl border border-stone-700 shadow-lg p-5 text-stone-100';
  const titleCls = 'text-xl font-semibold text-amber-300 tracking-wide';

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [invites, setInvites] = useState<QuoteRequestDetailDto[]>([]);

  // Proposal form state
  const [showFormFor, setShowFormFor] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [showProposalDetail, setShowProposalDetail] = useState<string | null>(null);
  const [proposalDetail, setProposalDetail] = useState<ProposalDto | null>(null);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [previewFor, setPreviewFor] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<{priceTotal: number; durationDays: number; termsSummary?: string; items: {name:string; price:number; notes?:string}[]}|null>(null);
  const [showProjectDetail, setShowProjectDetail] = useState<string | null>(null);
  const [projectDetailData, setProjectDetailData] = useState<QuoteRequestDetailDto | null>(null);
  const [showQuoteDetailFor, setShowQuoteDetailFor] = useState<string | null>(null);
  const [quoteDetailLoading, setQuoteDetailLoading] = useState<boolean>(false);
  const [quoteDetailData, setQuoteDetailData] = useState<QuoteRequestDetailDto | null>(null);

  // Load proposal detail once when previewFor changes
  useEffect(() => {
    const fetchPreview = async () => {
      if (!previewFor) return;
      const q = invites.find(i => i.id === previewFor);
      const mp = q?.myProposal;
      if (!mp?.id) return;
      try {
        setPreviewLoading(true);
        const full = await proposalsApi.getMineById(mp.id);
        setPreviewData({
          priceTotal: full.priceTotal,
          durationDays: full.durationDays,
          termsSummary: full.termsSummary,
          items: full.items.map(i => ({ name: i.name, price: i.price, notes: i.notes }))
        });
      } catch {
        // ignore
      } finally {
        setPreviewLoading(false);
      }
    };
    // reset data on open
    if (previewFor) {
      setPreviewData(null);
      void fetchPreview();
    }
  }, [previewFor, invites]);

  const loadInvites = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await contractorQuotesApi.myInvitesDetailed();
      setInvites(data);
    } catch (e: any) {
      setError(e?.response?.data || e?.message || 'Không tải được lời mời');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadInvites(); }, []);

  const resetForm = () => { setExcelFile(null); };

  const onUploadExcel = async (quoteId: string) => {
    if (!excelFile) { alert('Vui lòng chọn file .xlsx'); return; }
    try {
      setUploading(true);
      await proposalsApi.uploadExcel(quoteId, excelFile);
      setShowFormFor(null);
      resetForm();
      await loadInvites();
      alert('Đã tải file Excel. Hệ thống sẽ xử lý và sinh proposal.');
    } catch (e: any) {
      alert(e?.response?.data || e?.message || 'Tải file thất bại');
    } finally {
      setUploading(false);
    }
  };

  const onViewProposalDetail = async (quoteId: string) => {
    try {
      const proposal = await proposalsApi.getMineByQuote(quoteId);
      setProposalDetail(proposal);
      setShowProposalDetail(quoteId);
    } catch (e: any) {
      alert(e?.response?.data || e?.message || 'Không thể tải proposal');
    }
  };

  const onCreateProposal = async (_quoteId: string) => {
    alert('Tạo proposal trực tiếp đã được thay bằng upload Excel.');
  };

  const onSubmitProposal = async (proposalId: string) => {
    try {
      await proposalsApi.submit(proposalId);
      await loadInvites();
      alert('Đã nộp Proposal');
    } catch (e: any) {
      alert(e?.response?.data || e?.message || 'Submit Proposal thất bại');
    }
  };

  const onEditProposal = async (_quoteId: string) => {
    alert('Chỉnh sửa trực tiếp đã được thay bằng upload Excel.');
  };

  const onSaveDraft = async (_quoteId: string) => {
    alert('Lưu nháp trực tiếp đã được thay bằng upload Excel.');
  };

  const handleViewProjectDetail = (quoteId: string) => {
    const quote = invites.find(q => q.id === quoteId);
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
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const downloadBlob = (blob: Blob, fileName: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || 'document';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const onDownloadDocument = async (doc: ProjectDocumentDto, projectId: string) => {
    try {
      const blob = await projectsApi.downloadDocumentById(doc.id);
      downloadBlob(blob, doc.fileName);
    } catch (e: any) {
      alert(e?.response?.data?.message || e?.message || 'Không thể tải tài liệu');
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-extrabold tracking-tight text-amber-200">Lời mời báo giá</h3>
        <button className="px-3 py-2 rounded-md bg-stone-700 hover:bg-stone-600 text-stone-200" onClick={loadInvites}>Tải lại</button>
      </div>

      {loading ? (
        <div className="text-stone-300">Đang tải...</div>
      ) : error ? (
        <div className="text-rose-400">{error}</div>
      ) : invites.length === 0 ? (
        <div className={cardCls}>Hiện chưa có lời mời nào</div>
      ) : (
        <div className="space-y-4">
          {invites.map(q => (
            <div key={q.id} className={cardCls}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-stone-100 font-medium mb-1">{q.scope || 'Không có mô tả'}</div>
                  <div className="text-xs text-stone-400">Dự án: {q.project?.name} • {q.project?.address}</div>
                  <div className="text-xs text-stone-400">Trạng thái: {q.status}</div>
                </div>
                <div className="text-xs text-stone-500">#{q.id.slice(0,8)}</div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <button
                  className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white"
                  onClick={() => handleViewProjectDetail(q.id)}
                >
                  Xem chi tiết dự án
                </button>
                <button
                  className="px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white"
                  onClick={() => void handleViewQuoteDetail(q.id)}
                >
                  Xem chi tiết yêu cầu báo giá
                </button>
                {!q.myProposal?.id ? (
                  <button className="px-3 py-1.5 rounded-md bg-amber-600 hover:bg-amber-500 text-stone-900" onClick={() => setShowFormFor(q.id)}>Tạo Proposal</button>
                ) : (
                  <>
                    <span className="text-xs text-stone-400">Proposal: {q.myProposal.status}</span>
                    {q.myProposal.status === 'Draft' ? (
                      <button className="px-3 py-1.5 rounded-md bg-stone-700 hover:bg-stone-600 text-stone-200" onClick={() => onEditProposal(q.id)}>Sửa Proposal</button>
                    ) : (
                      <button className="px-3 py-1.5 rounded-md bg-stone-700 hover:bg-stone-600 text-stone-200" onClick={() => setPreviewFor(q.id)}>Xem Proposal</button>
                    )}
                    {q.myProposal.status === 'Draft' && (
                      <button className="px-3 py-1.5 rounded-md bg-green-600 hover:bg-green-500 text-stone-900 disabled:opacity-50" onClick={() => onSubmitProposal(q.myProposal!.id!)}>Nộp Proposal</button>
                    )}
                    {q.myProposal && (
                      <button className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-stone-100" onClick={() => onViewProposalDetail(q.id)}>Xem Proposal</button>
                    )}
                  </>
                )}
              </div>


              {showFormFor === q.id && (
                <div className="mt-4 border-t border-stone-700/60 pt-4">
                  <div>
                    <label className="block text-sm text-stone-300 mb-1">Upload Proposal (.xlsx)</label>
                    <input
                      type="file"
                      accept=".xlsx"
                      className="w-full bg-stone-900/50 border border-stone-700 rounded-md px-3 py-2 text-stone-100"
                      onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
                    />
                    <p className="text-xs text-stone-400 mt-2">Chỉ chấp nhận tệp Excel (.xlsx). Hệ thống sẽ xử lý và sinh proposal.</p>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <button disabled={uploading || !excelFile} className="px-4 py-2 rounded-md bg-amber-600 hover:bg-amber-500 text-stone-900 disabled:opacity-50" onClick={() => onUploadExcel(q.id)}>
                      {uploading ? 'Đang tải...' : 'Tải lên Excel'}
                    </button>
                    <button className="px-4 py-2 rounded-md bg-stone-700 hover:bg-stone-600 text-stone-200" onClick={() => { setShowFormFor(null); resetForm(); }}>Huỷ</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Project Detail Modal */}
      {showProjectDetail && projectDetailData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-stone-800 rounded-xl border border-stone-700 p-6 w-full max-w-6xl mx-auto max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-amber-300">Chi tiết dự án</h3>
              <button 
                className="text-stone-400 hover:text-stone-200 text-2xl" 
                onClick={() => { setShowProjectDetail(null); setProjectDetailData(null); }}
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Project Information */}
              <div className="bg-stone-700 rounded-lg p-6">
                <h4 className="text-xl font-semibold text-amber-300 mb-6">Thông tin dự án</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-stone-500 text-sm mb-2">Mô tả</p>
                    <p className="text-stone-100 text-lg">{projectDetailData.project.description || 'Chưa có mô tả'}</p>
                  </div>
                  <div>
                    <p className="text-stone-500 text-sm mb-2">Địa chỉ</p>
                    <p className="text-stone-100 text-lg">{projectDetailData.project.address || 'Chưa cập nhật'}</p>
                  </div>
                  <div>
                    <p className="text-stone-500 text-sm mb-2">Diện tích</p>
                    <p className="text-stone-100 text-lg">
                      {projectDetailData.project.floorArea ? `${projectDetailData.project.floorArea}m²` : 'Chưa cập nhật'}
                    </p>
                  </div>
                  <div>
                    <p className="text-stone-500 text-sm mb-2">Số tầng</p>
                    <p className="text-stone-100 text-lg">
                      {projectDetailData.project.numberOfFloors || 'Chưa cập nhật'}
                    </p>
                  </div>
                  <div>
                    <p className="text-stone-500 text-sm mb-2">Ngân sách</p>
                    <p className="text-amber-300 font-semibold text-xl">
                      {projectDetailData.project.budget ? formatCurrency(projectDetailData.project.budget) : 'Chưa xác định'}
                    </p>
                  </div>
                  {/* Ngừng hiển thị ngày bắt đầu theo flow mới */}
                  {/* Ngừng hiển thị ngày hoàn thành dự kiến theo flow mới */}
                  <div>
                    <p className="text-stone-500 text-sm mb-2">Trạng thái dự án</p>
                    <p className="text-green-400 font-medium text-lg">Active</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-600">
                <button
                  onClick={() => { setShowProjectDetail(null); setProjectDetailData(null); }}
                  className="px-6 py-2 bg-stone-600 hover:bg-stone-500 text-stone-300 rounded-lg transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Proposal Preview Modal */}
      {previewFor && (() => {
        const q = invites.find(i => i.id === previewFor);
        const mp = q?.myProposal;
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-stone-800 rounded-xl border border-stone-700 p-6 w-full max-w-5xl mx-auto max-h-[90vh] overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-amber-300">Proposal của bạn</h3>
                <button className="text-stone-400 hover:text-stone-200 text-2xl" onClick={() => { setPreviewFor(null); setPreviewData(null); }}>×</button>
              </div>
              {!mp ? (
                <div className="text-stone-300">Chưa có proposal</div>
              ) : previewLoading || !previewData ? (
                <div className="text-stone-300">Đang tải chi tiết...</div>
              ) : (
                <div className="space-y-4 text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div><span className="text-stone-400">Trạng thái:</span> <span className="text-stone-100 font-medium">{mp.status}</span></div>
                    <div><span className="text-stone-400">Tổng giá:</span> <span className="text-amber-300 font-semibold">{previewData.priceTotal.toLocaleString('vi-VN')}</span></div>
                    <div><span className="text-stone-400">Thời gian thi công:</span> <span className="text-stone-100">{previewData.durationDays} ngày</span></div>
                  </div>
                  {previewData.termsSummary && (
                    <div>
                      <div className="text-stone-400">Điều khoản tóm tắt</div>
                      <div className="text-stone-100">{previewData.termsSummary}</div>
                    </div>
                  )}
                    <div>
                      <div className="text-stone-400 mb-2">Danh sách hạng mục</div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                          <thead className="text-stone-300">
                            <tr>
                              <th className="px-2 py-1">Hạng mục</th>
                              <th className="px-2 py-1">Giá trị</th>
                              <th className="px-2 py-1">Tỷ lệ (%)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {previewData.items.map((it, idx) => (
                              <tr key={idx} className="border-t border-stone-700/60 text-stone-200">
                                <td className="px-2 py-1">{it.name}</td>
                                <td className="px-2 py-1">{it.price.toLocaleString('vi-VN')} VNĐ</td>
                                <td className="px-2 py-1">{it.notes || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                </div>
              )}
              <div className="mt-6 text-right">
                <button className="px-4 py-2 rounded-md bg-stone-700 hover:bg-stone-600 text-stone-200" onClick={() => { setPreviewFor(null); setPreviewData(null); }}>Đóng</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Quote Request Detail Modal */}
      {showQuoteDetailFor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-stone-800 rounded-xl border border-stone-700 p-6 w-full max-w-4xl mx-auto max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-amber-300">Chi tiết yêu cầu báo giá</h3>
              <button className="text-stone-400 hover:text-stone-200 text-2xl" onClick={() => { setShowQuoteDetailFor(null); setQuoteDetailData(null); }}>×</button>
            </div>
            {quoteDetailLoading || !quoteDetailData ? (
              <div className="text-stone-300">Đang tải...</div>
            ) : (
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div><span className="text-stone-400">Mô tả phạm vi:</span> <span className="text-stone-100">{quoteDetailData.scope || '—'}</span></div>
                 
                  <div><span className="text-stone-400">Trạng thái:</span> <span className="text-stone-100">{quoteDetailData.status}</span></div>
                </div>
                <div className="border-t border-stone-700/60 pt-3">
                  <div className="text-stone-400 mb-2">Chủ nhà</div>
                  <div className="text-stone-100">{quoteDetailData.homeowner.username} ({quoteDetailData.homeowner.email})</div>
                </div>
           
                <div className="border-t border-stone-700/60 pt-3">
                  <div className="text-stone-400 mb-2">Dự án</div>
                  <div className="text-stone-100">{quoteDetailData.project.name} • {quoteDetailData.project.address}</div>
                  {quoteDetailData.project.documents && quoteDetailData.project.documents.length > 0 && (
                    <div className="mt-3">
                      <div className="text-stone-400 mb-2">Tài liệu đính kèm</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {quoteDetailData.project.documents
                          .filter((d: ProjectDocumentDto) => d.documentType === 1 || d.documentType === 2)
                          .slice(0, 2)
                          .map((doc: ProjectDocumentDto) => (
                            <button
                              key={doc.id}
                              onClick={() => onDownloadDocument(doc, quoteDetailData.project.id)}
                              className="text-left p-3 rounded-md bg-stone-700 hover:bg-stone-600 text-stone-100 border border-stone-600"
                            >
                              <div className="text-sm font-medium">{doc.documentTypeName}</div>
                              <div className="text-xs text-stone-300 truncate">{doc.fileName}</div>
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="mt-6 text-right">
              <button className="px-4 py-2 rounded-md bg-stone-700 hover:bg-stone-600 text-stone-200" onClick={() => { setShowQuoteDetailFor(null); setQuoteDetailData(null); }}>Đóng</button>
            </div>
          </div>
        </div>
      )}
      {/* Proposal Detail Modal */}
      {showProposalDetail && proposalDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-stone-900 rounded-xl border border-stone-700 max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-stone-700">
              <h2 className="text-xl font-bold text-stone-100">Chi tiết Proposal</h2>
              <button 
                onClick={() => { setShowProposalDetail(null); setProposalDetail(null); }}
                className="text-stone-400 hover:text-stone-200 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <ProposalDisplay proposal={proposalDetail} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
