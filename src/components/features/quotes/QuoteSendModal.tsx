"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { quotesApi } from '../../../lib/quotes/quotes.api';
import { projectsApi } from '../../../lib/projects/projects.api';
import type { ProjectResponseDto } from '../../../lib/projects/projects.api';
import type { QuoteRequestDto } from '../../../lib/quotes/quote.types';

interface QuoteSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  sendToAll?: boolean;
  contractorId?: string;
  contractorName?: string;
}

export default function QuoteSendModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  sendToAll = false,
  contractorId,
  contractorName 
}: QuoteSendModalProps) {
  const [projects, setProjects] = useState<ProjectResponseDto[]>([]);
  const [quotes, setQuotes] = useState<QuoteRequestDto[]>([]);
  const [selectedQuotes, setSelectedQuotes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load projects
      const projectsData = await projectsApi.getMyProjects();
      setProjects(projectsData);
      
      // Load quotes for all projects
      const allQuotes: QuoteRequestDto[] = [];
      for (const project of projectsData) {
        try {
          const projectQuotes = await quotesApi.listByProject(project.id);
          allQuotes.push(...projectQuotes);
        } catch (e) {
          // Silent fail for individual projects
        }
      }
      setQuotes(allQuotes);
    } catch (e: any) {
      setError('Không thể tải dữ liệu: ' + (e?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuote = (quoteId: string) => {
    setSelectedQuotes(prev => 
      prev.includes(quoteId) 
        ? prev.filter(id => id !== quoteId)
        : [...prev, quoteId]
    );
  };

  const handleSelectAllQuotes = () => {
    // Chọn tất cả quotes trừ những cái đã bị cancelled hoặc closed
    const selectableQuoteIds = quotes
      .filter(q => q.status !== 'Cancelled' && q.status !== 'Closed')
      .map(q => q.id);
    setSelectedQuotes(selectableQuoteIds);
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Dự án không xác định';
  };

  const handleSendQuotes = async () => {
    if (selectedQuotes.length === 0) {
      setError('Vui lòng chọn ít nhất 1 bản báo giá để gửi');
      return;
    }

    // Validate: không cho phép gửi quotes có status Closed hoặc Cancelled
    const invalidQuotes = quotes.filter(q => 
      selectedQuotes.includes(q.id) && (q.status === 'Closed' || q.status === 'Cancelled')
    );
    
    if (invalidQuotes.length > 0) {
      setError(`Không thể gửi ${invalidQuotes.length} bản báo giá có trạng thái ${invalidQuotes[0].status}`);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      
      for (const quoteId of selectedQuotes) {
        if (sendToAll) {
          // Gửi đến tất cả nhà thầu
          await quotesApi.sendToAllContractors(quoteId);
        } else if (contractorId) {
          // Gửi đến nhà thầu cụ thể
          await quotesApi.sendToContractor(quoteId, contractorId);
        }
      }

      const message = sendToAll 
        ? `Đã gửi ${selectedQuotes.length} bản báo giá đến tất cả nhà thầu`
        : `Đã gửi ${selectedQuotes.length} bản báo giá đến ${contractorName}`;
      
      setSuccess(message);
      setSelectedQuotes([]);
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (e: any) {
      setError(e?.response?.data || e?.message || 'Gửi báo giá thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-stone-800 rounded-xl border border-stone-700 p-6 w-full max-w-6xl mx-auto max-h-[95vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-semibold text-amber-300 mb-1">
              {sendToAll ? 'Gửi Báo giá đến Tất cả Nhà thầu' : `Gửi Báo giá đến ${contractorName}`}
            </h3>
            <p className="text-stone-400 text-sm">
              Chọn các bản báo giá bạn muốn gửi. Có thể chọn nhiều bản báo giá cùng lúc.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-200 text-3xl p-2 hover:bg-stone-700 rounded-lg transition-colors"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-stone-300">Đang tải...</div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6 p-4 bg-stone-900/50 rounded-lg border border-stone-700">
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-stone-300">
                    <span className="font-medium text-amber-300">{selectedQuotes.length}</span> bản báo giá đã chọn
                  </div>
                  <div className="text-xs text-stone-500">
                    Tổng cộng {quotes.length} bản báo giá có sẵn
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSelectAllQuotes}
                    className="px-4 py-2 text-sm bg-stone-700 hover:bg-stone-600 rounded-md text-stone-200 transition-colors"
                  >
                    Chọn tất cả
                  </button>
                  <button
                    onClick={() => setSelectedQuotes([])}
                    className="px-4 py-2 text-sm bg-stone-600 hover:bg-stone-500 rounded-md text-stone-300 transition-colors"
                  >
                    Bỏ chọn tất cả
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {quotes.length === 0 ? (
                  <div className="text-stone-400 text-center py-8">Chưa có quote nào</div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {quotes.map(q => (
                      <div
                        key={q.id}
                        className={`p-4 rounded-lg border transition-all duration-200 ${
                          selectedQuotes.includes(q.id)
                            ? 'border-amber-500 bg-amber-900/20 shadow-lg shadow-amber-500/20'
                            : 'border-stone-700 bg-stone-900/50 hover:border-stone-600'
                        } ${
                          (q.status === 'Cancelled' || q.status === 'Closed') ? 'opacity-50' : 'hover:bg-stone-800/50'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedQuotes.includes(q.id)}
                            onChange={() => handleSelectQuote(q.id)}
                            disabled={q.status === 'Cancelled' || q.status === 'Closed'}
                            className="mt-1 rounded border-stone-600 bg-stone-800 text-amber-600 focus:ring-amber-500 disabled:opacity-50"
                            title={q.status === 'Closed' ? 'Không thể gửi bản báo giá đã đóng' : q.status === 'Cancelled' ? 'Không thể gửi bản báo giá đã hủy' : undefined}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-stone-100 mb-2 leading-relaxed">
                              Báo giá: {getProjectName(q.projectId)}
                            </div>
                            {q.scope && (
                              <div className="text-sm text-stone-300 mb-2 leading-relaxed">
                                {q.scope}
                              </div>
                            )}
                            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-400 mb-2">
                              <span>Trạng thái:</span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                q.status === 'Draft' ? 'bg-yellow-900 text-yellow-300' :
                                q.status === 'Sent' ? 'bg-blue-900 text-blue-300' :
                                q.status === 'Closed' ? 'bg-green-900 text-green-300' :
                                'bg-red-900 text-red-300'
                              }`}>
                                {q.status}
                              </span>
                              {(q.status === 'Closed' || q.status === 'Cancelled') && (
                                <span className="text-xs text-stone-500 italic">
                                  {q.status === 'Closed' ? '(Không thể gửi)' : '(Đã hủy)'}
                                </span>
                              )}
                            </div>
                            {q.inviteeUserIds.length > 0 && (
                              <div className="text-xs text-stone-400">
                                Đã mời: {q.inviteeUserIds.length} nhà thầu
                              </div>
                            )}
                            <div className="text-xs text-stone-500 mt-2 font-mono">
                              #{q.id.slice(0, 8)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {error && (
            <div className="text-rose-400 text-sm mt-4 p-3 bg-red-900/20 border border-red-700 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="text-green-400 text-sm mt-4 p-3 bg-green-900/20 border border-green-700 rounded-lg">
              {success}
            </div>
          )}

          <div className="flex items-center gap-4 mt-6 pt-6 border-t border-stone-700">
            <div className="flex-1 text-sm text-stone-400">
              {selectedQuotes.length > 0 && (
                <span>
                  Sẽ gửi <span className="font-medium text-amber-300">{selectedQuotes.length}</span> quote
                  {sendToAll ? ' đến tất cả nhà thầu' : ` đến ${contractorName}`}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-stone-700 hover:bg-stone-600 text-stone-200 rounded-md transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSendQuotes}
                disabled={submitting || selectedQuotes.length === 0}
                className="px-6 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-stone-600 disabled:cursor-not-allowed text-stone-900 font-medium rounded-md transition-colors"
              >
                {submitting ? 'Đang gửi...' : `Gửi ${selectedQuotes.length} bản báo giá`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render modal using Portal to avoid container constraints
  return createPortal(modalContent, document.body);
}
