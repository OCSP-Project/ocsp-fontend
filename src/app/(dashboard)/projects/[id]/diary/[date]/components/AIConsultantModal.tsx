'use client';

import { useState } from 'react';
import { DiaryImage } from '@/types/construction-diary.types';
import { analyzeIncident } from '@/lib/api/ai-consultant';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIConsultantModalProps {
  isOpen: boolean;
  onClose: () => void;
  incidentImages: DiaryImage[];
  incidentReport: string;
  onApplySuggestion: (suggestion: string) => void;
}

export function AIConsultantModal({
  isOpen,
  onClose,
  incidentImages,
  incidentReport,
  onApplySuggestion,
}: AIConsultantModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState('');

  if (!isOpen) return null;

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Gọi AI API với câu hỏi của người dùng
      const result = await analyzeIncident({
        images: incidentImages.map(img => img.url),
        incident_report: `${incidentReport}\n\nCâu hỏi bổ sung: ${inputMessage}`,
        context: incidentImages.map((img, idx) => `Ảnh ${idx + 1}: ${img.description || ''}`).join('; '),
      });

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `**📋 Trả lời:**\n${result.incident_report}\n\n**💡 Đề xuất:**\n${result.recommendations}`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      setCurrentSuggestion(result.recommendations);
      setIsLoading(false);
    } catch (error: any) {
      console.error('AI chat error:', error);

      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `❌ Lỗi: ${error.message || 'Không thể kết nối AI'}`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  const handleAnalyzeIncident = async () => {
    console.log('🚀 [AI Consultant] Starting analysis...');
    console.log('📷 Images count:', incidentImages.length);
    console.log('📝 Incident report:', incidentReport);
    console.log('🌐 API URL:', process.env.NEXT_PUBLIC_RAG_API_URL);

    setIsLoading(true);

    const systemMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: '🔍 Đang phân tích ảnh sự cố với AI...',
      timestamp: new Date(),
    };

    setMessages([systemMessage]);

    try {
      console.log('📤 Calling analyzeIncident API...');

      // Gọi AI API thực tế
      const result = await analyzeIncident({
        images: incidentImages.map(img => img.url),
        incident_report: incidentReport,
        context: incidentImages.map((img, idx) => `Ảnh ${idx + 1}: ${img.description || ''}`).join('; '),
      });

      console.log('✅ API Response:', result);

      const aiResponse: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `**📋 Báo cáo phân tích:**\n${result.incident_report}\n\n**💡 Đề xuất giải pháp:**\n${result.recommendations}`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiResponse]);
      setCurrentSuggestion(result.recommendations);
      setIsLoading(false);
    } catch (error: any) {
      console.error('❌ AI Analysis error:', error);

      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `❌ Lỗi khi phân tích: ${error.message || 'Không thể kết nối với hệ thống AI'}.\n\n**Debug Info:**\n- API URL: ${process.env.NEXT_PUBLIC_RAG_API_URL || 'CHƯA CẤU HÌNH'}\n- Error: ${error.toString()}\n\nVui lòng kiểm tra Console để xem chi tiết lỗi.`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (currentSuggestion) {
      onApplySuggestion(currentSuggestion);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Tư vấn AI về Sự cố</h2>
              <p className="text-sm text-slate-400">Phân tích và đề xuất giải pháp xử lý sự cố</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Panel - Incident Info */}
          <div className="w-1/3 border-r border-slate-700 p-4 overflow-y-auto bg-slate-900/30">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Thông tin sự cố
            </h3>

            {/* Incident Report */}
            <div className="mb-4">
              <label className="text-xs font-medium text-slate-400 mb-1 block">Báo cáo sự cố</label>
              <div className="bg-slate-800/50 rounded-lg p-3 text-sm text-slate-300 max-h-32 overflow-y-auto">
                {incidentReport || <span className="text-slate-500 italic">Chưa có báo cáo</span>}
              </div>
            </div>

            {/* Incident Images */}
            <div>
              <label className="text-xs font-medium text-slate-400 mb-2 block">
                Ảnh sự cố ({incidentImages.length})
              </label>
              <div className="space-y-2">
                {incidentImages.length > 0 ? (
                  incidentImages.map((img, idx) => (
                    <div key={img.id} className="bg-slate-800/50 rounded-lg overflow-hidden">
                      <img
                        src={img.url}
                        alt={img.description || `Ảnh sự cố ${idx + 1}`}
                        className="w-full aspect-video object-cover"
                      />
                      {img.description && (
                        <div className="p-2 text-xs text-slate-400">
                          {img.description}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-slate-500 text-xs">
                    Chưa có ảnh sự cố
                  </div>
                )}
              </div>
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyzeIncident}
              disabled={isLoading || !incidentReport}
              className="w-full mt-4 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-medium shadow-lg shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Phân tích sự cố
            </button>
          </div>

          {/* Right Panel - Chat */}
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-slate-400">
                    <svg className="w-16 h-16 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-sm">Click "Phân tích sự cố" hoặc gửi câu hỏi để bắt đầu</p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700/50 text-slate-200'
                      }`}
                    >
                      <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                      <div className={`text-xs mt-1 ${msg.role === 'user' ? 'text-blue-200' : 'text-slate-500'}`}>
                        {msg.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))
              )}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-700/50 rounded-lg px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-slate-700 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Đặt câu hỏi về sự cố..."
                  className="flex-1 px-4 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>

              {/* Apply Button */}
              {currentSuggestion && (
                <button
                  onClick={handleApply}
                  className="w-full mt-3 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-lg font-medium shadow-lg shadow-green-500/30 transition-all"
                >
                  <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Áp dụng đề xuất này
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
