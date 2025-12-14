"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import Link from "next/link";
import styles from "./AIChatAssistant.module.scss";

interface ContractorAction {
  contractor_id: string;
  contractor_name: string;
  contractor_slug: string;
  description: string;
  budget_range: string;
  rating: number;
  specialties?: string[];
  location: string;
  profile_url: string;
  contact_url: string;
}

interface EnhancedChatResponse {
  response: string;
  sources: Array<{
    id: number;
    score: number;
    source?: string;
  }>;
  contractors: ContractorAction[];
  has_recommendations: boolean;
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  sources?: Array<{
    id: number;
    score: number;
    source?: string;
  }>;
  contractors?: ContractorAction[];
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_RAG_API_URL || "http://13.210.146.91:8000";

// Contractor Card Component
const ContractorCard: React.FC<{ contractor: ContractorAction }> = ({
  contractor,
}) => {
  // Add default values to prevent undefined errors
  const safeContractor = {
    contractor_id: contractor.contractor_id || "",
    contractor_name: contractor.contractor_name || "Nhà thầu không tên",
    contractor_slug: contractor.contractor_slug || "",
    description: contractor.description || "Không có mô tả",
    budget_range: contractor.budget_range || "Liên hệ để biết giá",
    rating: contractor.rating || 0,
    specialties: contractor.specialties || [],
    location: contractor.location || "Không xác định",
    profile_url: contractor.profile_url || "#",
    contact_url: contractor.contact_url || "#",
  };

  return (
    <div className={styles.contractorCard}>
      <div className={styles.contractorHeader}>
        <div className={styles.contractorName}>
          <h4>{safeContractor.contractor_name}</h4>
          <div className={styles.rating}>
            {"★".repeat(Math.floor(safeContractor.rating))}
            <span>{safeContractor.rating}</span>
          </div>
        </div>
      </div>

      <div className={styles.contractorInfo}>
        <p className={styles.description}>{safeContractor.description}</p>
        <div className={styles.details}>
          <span className={styles.budget}>
            💰 {safeContractor.budget_range}
          </span>
          <span className={styles.location}>📍 {safeContractor.location}</span>
        </div>

        {safeContractor.specialties &&
          safeContractor.specialties.length > 0 && (
            <div className={styles.specialties}>
              {safeContractor.specialties.slice(0, 2).map((specialty, idx) => (
                <span key={idx} className={styles.specialtyTag}>
                  {specialty}
                </span>
              ))}
            </div>
          )}
      </div>

      <div className={styles.contractorActions}>
        <Link
          href={`/view-contractors/${safeContractor.contractor_id}`}
          className={styles.viewProfileBtn}
        >
          Xem chi tiết
        </Link>
        <button
          className={styles.contactBtn}
          onClick={() => {
            if (
              safeContractor.contact_url &&
              safeContractor.contact_url !== "#"
            ) {
              window.open(safeContractor.contact_url, "_blank");
            }
          }}
          disabled={
            !safeContractor.contact_url || safeContractor.contact_url === "#"
          }
        >
          Liên hệ ngay
        </button>
      </div>
    </div>
  );
};

const AIChatAssistant: React.FC = () => {
  const pathname = usePathname();

  // Chỉ hiển thị ở trang home
  if (pathname !== "/") {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Xin chào! Tôi là AI Assistant tư vấn nhà thầu xây dựng. Tôi có thể giúp bạn tìm nhà thầu phù hợp, tư vấn về ngân sách, quy trình xây dựng. Bạn cần hỗ trợ gì?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const iconRef = useRef<HTMLDivElement>(null);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const waveTimeoutRef = useRef<NodeJS.Timeout>();

  // Check API health only when chat is opened
  const checkAPIHealth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (response.ok) {
        const data = await response.json();
        setIsConnected(data.status === "healthy");
      }
    } catch (error) {
      console.error("API health check failed:", error);
      setIsConnected(false);
    }
  };

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Wave animation every 10 seconds if not interacted
  useEffect(() => {
    const startWaveInterval = () => {
      waveTimeoutRef.current = setTimeout(() => {
        if (!isOpen) {
          // Wave animation
          gsap.to(iconRef.current, {
            rotation: 15,
            duration: 0.3,
            yoyo: true,
            repeat: 3,
            ease: "power2.inOut",
          });

          // Show tooltip briefly
          setShowTooltip(true);
          setTimeout(() => setShowTooltip(false), 3000);
        }
        startWaveInterval();
      }, 10000);
    };

    startWaveInterval();

    return () => {
      if (waveTimeoutRef.current) {
        clearTimeout(waveTimeoutRef.current);
      }
    };
  }, [isOpen]);

  // Initial animations
  useEffect(() => {
    gsap.fromTo(
      iconRef.current,
      { scale: 0, rotation: -180 },
      { scale: 1, rotation: 0, duration: 0.8, ease: "back.out(1.7)", delay: 1 }
    );

    // Floating animation
    gsap.to(iconRef.current, {
      y: -10,
      duration: 2,
      yoyo: true,
      repeat: -1,
      ease: "power2.inOut",
    });

    // Tooltip animation
    gsap.fromTo(
      tooltipRef.current,
      { opacity: 0, scale: 0.8, x: 20 },
      { opacity: 1, scale: 1, x: 0, duration: 0.5, delay: 2 }
    );

    setTimeout(() => setShowTooltip(true), 2000);
    setTimeout(() => setShowTooltip(false), 5000);
  }, []);

  const toggleChat = () => {
    if (isOpen) {
      // Close animation
      gsap.to(chatBoxRef.current, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: "back.in(1.7)",
        onComplete: () => setIsOpen(false),
      });
    } else {
      setIsOpen(true);
      // Check API health when opening chat
      checkAPIHealth();
      // Open animation
      gsap.fromTo(
        chatBoxRef.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.7)" }
      );
    }
    setShowTooltip(false);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    const currentMessage = inputMessage;
    setInputMessage("");
    setIsTyping(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: currentMessage,
          top_k: 5,
        }),
      });

      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      const data: EnhancedChatResponse = await response.json();

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        isUser: false,
        timestamp: new Date(),
        sources: data.sources || [],
        contractors: data.contractors || [],
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Chat API error:", error);

      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={styles.aiChatAssistant}>
      {/* Tooltip */}
      {showTooltip && !isOpen && (
        <div ref={tooltipRef} className={styles.tooltip}>
          <div className={styles.tooltipContent}>
            <p>👋 Hỏi mình về nhà thầu xây dựng nhé!</p>
            <div className={styles.tooltipArrow}></div>
          </div>
        </div>
      )}

      {/* AI Icon */}
      <div
        ref={iconRef}
        className={styles.aiIcon}
        onClick={toggleChat}
        role="button"
        aria-label="Open AI Chat Assistant"
      >
        {/* Outer glow ring */}
        <div className={styles.glowRing}></div>

        {/* Main icon container */}
        <div className={styles.iconContainer}>
          {/* AI Icon SVG */}
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            className={styles.iconSvg}
          >
            {/* Brain/AI symbol */}
            <path
              d="M12 2C13.1 2 14 2.9 14 4C14 4.74 13.6 5.39 13 5.73V7H14C15.1 7 16 7.9 16 9V10C16.6 10 17 10.4 17 11C17 11.6 16.6 12 16 12V13C16 14.1 15.1 15 14 15H13V16.27C13.6 16.61 14 17.26 14 18C14 19.1 13.1 20 12 20C10.9 20 10 19.1 10 18C10 17.26 10.4 16.61 11 16.27V15H10C8.9 15 8 14.1 8 13V12C7.4 12 7 11.6 7 11C7 10.4 7.4 10 8 10V9C8 7.9 8.9 7 10 7H11V5.73C10.4 5.39 10 4.74 10 4C10 2.9 10.9 2 12 2Z"
              fill="currentColor"
            />
            {/* Sparkle effects */}
            <circle cx="6" cy="6" r="1" fill="currentColor" opacity="0.6">
              <animate
                attributeName="opacity"
                values="0.6;1;0.6"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="18" cy="6" r="1" fill="currentColor" opacity="0.8">
              <animate
                attributeName="opacity"
                values="0.8;0.3;0.8"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="18" cy="18" r="1" fill="currentColor" opacity="0.7">
              <animate
                attributeName="opacity"
                values="0.7;1;0.7"
                dur="1.8s"
                repeatCount="indefinite"
              />
            </circle>
          </svg>

          {/* Status indicator */}
          <div
            className={`${styles.statusDot} ${
              isConnected ? styles.connected : styles.disconnected
            }`}
          ></div>
        </div>
      </div>

      {/* Chat Box */}
      {isOpen && (
        <div ref={chatBoxRef} className={styles.chatBox}>
          {/* Header */}
          <div className={styles.chatHeader}>
            <div className={styles.headerInfo}>
              <div className={styles.aiAvatar}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2C13.1 2 14 2.9 14 4C14 4.74 13.6 5.39 13 5.73V7H14C15.1 7 16 7.9 16 9V10C16.6 10 17 10.4 17 11C17 11.6 16.6 12 16 12V13C16 14.1 15.1 15 14 15H13V16.27C13.6 16.61 14 17.26 14 18C14 19.1 13.1 20 12 20C10.9 20 10 19.1 10 18C10 17.26 10.4 16.61 11 16.27V15H10C8.9 15 8 14.1 8 13V12C7.4 12 7 11.6 7 11C7 10.4 7.4 10 8 10V9C8 7.9 8.9 7 10 7H11V5.73C10.4 5.39 10 4.74 10 4C10 2.9 10.9 2 12 2Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <div>
                <h3>AI Tư vấn Nhà thầu</h3>
                <span className={styles.status}>
                  {isConnected ? "🟢 Đang hoạt động" : "🔴 Offline"}
                </span>
              </div>
            </div>
            <button className={styles.closeBtn} onClick={toggleChat}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className={styles.messagesContainer}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`${styles.message} ${
                  message.isUser ? styles.userMessage : styles.aiMessage
                }`}
              >
                {!message.isUser && (
                  <div className={styles.messageAvatar}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 2C13.1 2 14 2.9 14 4C14 4.74 13.6 5.39 13 5.73V7H14C15.1 7 16 7.9 16 9V10C16.6 10 17 10.4 17 11C17 11.6 16.6 12 16 12V13C16 14.1 15.1 15 14 15H13V16.27C13.6 16.61 14 17.26 14 18C14 19.1 13.1 20 12 20C10.9 20 10 19.1 10 18C10 17.26 10.4 16.61 11 16.27V15H10C8.9 15 8 14.1 8 13V12C7.4 12 7 11.6 7 11C7 10.4 7.4 10 8 10V9C8 7.9 8.9 7 10 7H11V5.73C10.4 5.39 10 4.74 10 4C10 2.9 10.9 2 12 2Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                )}
                <div className={styles.messageContent}>
                  <p>{message.text}</p>

                  {/* Contractor Recommendations */}
                  {message.contractors &&
                    Array.isArray(message.contractors) &&
                    message.contractors.length > 0 && (
                      <div className={styles.contractorRecommendations}>
                        <div className={styles.recommendationHeader}>
                          <h5>
                            🏗️ Nhà thầu được đề xuất (
                            {message.contractors.length})
                          </h5>
                        </div>
                        <div className={styles.contractorGrid}>
                          {message.contractors.map((contractor, index) => (
                            <ContractorCard
                              key={
                                contractor.contractor_id ||
                                `contractor-${index}`
                              }
                              contractor={contractor}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Sources */}
                  {message.sources && message.sources.length > 0 && (
                    <div className={styles.sources}>
                      <small>Nguồn tham khảo:</small>
                      {message.sources.slice(0, 3).map((source, index) => (
                        <div key={source.id} className={styles.sourceItem}>
                          <span>#{index + 1}</span>
                          <span>
                            Độ liên quan: {(source.score * 100).toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <span className={styles.timestamp}>
                    {message.timestamp.toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className={`${styles.message} ${styles.aiMessage}`}>
                <div className={styles.messageAvatar}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2C13.1 2 14 2.9 14 4C14 4.74 13.6 5.39 13 5.73V7H14C15.1 7 16 7.9 16 9V10C16.6 10 17 10.4 17 11C17 11.6 16.6 12 16 12V13C16 14.1 15.1 15 14 15H13V16.27C13.6 16.61 14 17.26 14 18C14 19.1 13.1 20 12 20C10.9 20 10 19.1 10 18C10 17.26 10.4 16.61 11 16.27V15H10C8.9 15 8 14.1 8 13V12C7.4 12 7 11.6 7 11C7 10.4 7.4 10 8 10V9C8 7.9 8.9 7 10 7H11V5.73C10.4 5.39 10 4.74 10 4C10 2.9 10.9 2 12 2Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <div className={styles.typingIndicator}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className={styles.inputContainer}>
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                isConnected
                  ? "Hỏi về nhà thầu, ngân sách, quy trình..."
                  : "Đang kết nối..."
              }
              className={styles.messageInput}
              rows={1}
              disabled={!isConnected}
            />
            <button
              onClick={sendMessage}
              className={styles.sendButton}
              disabled={!inputMessage.trim() || !isConnected}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChatAssistant;
