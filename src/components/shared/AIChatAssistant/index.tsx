"use client";

import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import styles from "./AIChatAssistant.module.scss";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const AIChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Xin chào! Tôi là AI Assistant của OCSP. Tôi có thể tư vấn cho bạn về xây dựng, vật liệu, quy trình và các vấn đề kỹ thuật. Bạn cần hỗ trợ gì?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const iconRef = useRef<HTMLDivElement>(null);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const waveTimeoutRef = useRef<NodeJS.Timeout>();

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
    setInputMessage("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "Để tư vấn chính xác, bạn có thể cho tôi biết thêm về loại công trình và quy mô dự án không?",
        "Dựa trên kinh nghiệm, tôi khuyên bạn nên chọn vật liệu phù hợp với khí hậu Đà Nẵng.",
        "Để đảm bảo chất lượng, bạn nên thuê giám sát viên có chứng chỉ từ đầu dự án.",
        "Chi phí này phụ thuộc vào nhiều yếu tố. Bạn có thể tạo dự án trên OCSP để nhận báo giá chi tiết.",
        "Theo quy định xây dựng hiện tại, bạn cần hoàn thành các thủ tục sau...",
      ];

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: responses[Math.floor(Math.random() * responses.length)],
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 2000);
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
            <p>👋 Click vào để mình tư vấn nhé!</p>
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
          <div className={styles.statusDot}></div>
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
                <h3>AI Tư vấn OCSP</h3>
                <span className={styles.status}>🟢 Đang hoạt động</span>
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
              placeholder="Nhập câu hỏi của bạn..."
              className={styles.messageInput}
              rows={1}
            />
            <button
              onClick={sendMessage}
              className={styles.sendButton}
              disabled={!inputMessage.trim()}
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
