"use client";

import React, { useState, useRef, useEffect } from "react";
import { Input, Button, message as antdMessage, Spin } from "antd";
import {
  SendOutlined,
  RobotOutlined,
  CloseOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { consultAI } from "@/lib/api/ai-consultant";
import { useAuth } from "@/hooks/useAuth";
import styles from "./ai-consultant-box.module.scss";

const { TextArea } = Input;

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
}

const AIConsultantBox: React.FC = () => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [remainingMessages, setRemainingMessages] = useState(5);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!currentMessage.trim() || !user || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: currentMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentMessage("");
    setLoading(true);

    try {
      const response = await consultAI({
        user_id: user.id,
        message: currentMessage,
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: response.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setRemainingMessages(response.remaining_messages);
    } catch (error: any) {
      console.error("AI consultation error:", error);

      if (error.message.includes("429") || error.message.includes("hết lượt")) {
        antdMessage.error(
          "Bạn đã hết lượt tư vấn hôm nay (5 tin nhắn/ngày). Vui lòng quay lại vào ngày mai."
        );
        setRemainingMessages(0);
      } else {
        antdMessage.error(
          error.message || "Không thể kết nối với AI. Vui lòng thử lại."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.aiConsultantBox}>
      {/* Collapsed Header */}
      {!isExpanded && (
        <div
          className={styles.collapsedHeader}
          onClick={() => setIsExpanded(true)}
        >
          <div className={styles.headerContent}>
            <div className={styles.iconWrapper}>
              <RobotOutlined className={styles.icon} />
            </div>
            <div className={styles.headerText}>
              <h3>AI Tư Vấn Xây Dựng</h3>
              <p>Chuyên gia về kỹ thuật, pháp luật & an toàn lao động</p>
            </div>
          </div>
          <div className={styles.badge}>
            <ThunderboltOutlined /> {remainingMessages}/5
          </div>
        </div>
      )}

      {/* Expanded Chat */}
      {isExpanded && (
        <div className={styles.expandedChat}>
          {/* Header */}
          <div className={styles.chatHeader}>
            <div className={styles.headerLeft}>
              <RobotOutlined className={styles.headerIcon} />
              <div>
                <h3>AI Tư Vấn Xây Dựng</h3>
                <p>Chuyên gia về kỹ thuật, pháp luật & an toàn</p>
              </div>
            </div>
            <div className={styles.headerRight}>
              <span className={styles.rateLimitBadge}>
                {remainingMessages}/5 tin nhắn
              </span>
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={() => setIsExpanded(false)}
                className={styles.closeButton}
              />
            </div>
          </div>

          {/* Messages */}
          <div className={styles.messagesContainer}>
            {messages.length === 0 && (
              <div className={styles.emptyState}>
                <RobotOutlined className={styles.emptyIcon} />
                <h4>Xin chào! Tôi có thể giúp gì cho bạn?</h4>
                <p className={styles.suggestions}>
                  Hãy hỏi tôi về:
                  <br />• Kỹ thuật thi công xây dựng
                  <br />• Pháp luật & quy chuẩn xây dựng
                  <br />• An toàn lao động tại công trường
                </p>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`${styles.messageWrapper} ${
                  msg.type === "user" ? styles.userMessage : styles.aiMessage
                }`}
              >
                <div className={styles.messageBubble}>
                  <div className={styles.messageContent}>{msg.content}</div>
                  <div className={styles.messageTime}>
                    {msg.timestamp.toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className={styles.loadingMessage}>
                <Spin size="small" />
                <span>AI đang suy nghĩ...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className={styles.messageInput}>
            <TextArea
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="Hỏi về kỹ thuật, pháp luật hoặc an toàn xây dựng..."
              autoSize={{ minRows: 1, maxRows: 3 }}
              onPressEnter={(e) => {
                if (e.shiftKey) return;
                e.preventDefault();
                handleSend();
              }}
              disabled={loading || remainingMessages === 0}
              className={styles.textArea}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              loading={loading}
              disabled={!currentMessage.trim() || remainingMessages === 0}
              className={styles.sendButton}
            />
          </div>

          {remainingMessages === 0 && (
            <div className={styles.rateLimitWarning}>
              Bạn đã hết lượt tư vấn hôm nay. Quay lại vào ngày mai!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIConsultantBox;
