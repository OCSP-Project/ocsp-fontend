"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Input,
  Button,
  message as antdMessage,
  Spin,
  Avatar,
  Empty,
} from "antd";
import {
  SendOutlined,
  RobotOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { consultAI } from "@/lib/api/ai-consultant";
import { useAuth } from "@/hooks/useAuth";
import styles from "./ai-consultant.module.scss";

const { TextArea } = Input;

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
}

export default function AIConsultantPage() {
  const { user } = useAuth();
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
    <div className={styles.pageContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.iconWrapper}>
            <RobotOutlined className={styles.icon} />
          </div>
          <div>
            <h1>AI Tư Vấn Xây Dựng</h1>
            <p>Chuyên gia về kỹ thuật, pháp luật & an toàn lao động</p>
          </div>
        </div>
        <div className={styles.rateLimitBadge}>
          <ThunderboltOutlined />
          <span>{remainingMessages}/5 tin nhắn hôm nay</span>
        </div>
      </div>

      {/* Messages Container */}
      <div className={styles.messagesContainer}>
        {messages.length === 0 && (
          <div className={styles.emptyState}>
            <RobotOutlined className={styles.emptyIcon} />
            <h2>Xin chào! Tôi có thể giúp gì cho bạn?</h2>
            <div className={styles.suggestions}>
              <h3>Tôi có thể tư vấn về:</h3>
              <ul>
                <li>
                  <strong>Kỹ thuật xây dựng:</strong> Thi công móng, cột, dầm,
                  sàn, tường, mái. Vật liệu xây dựng, quy trình thi công theo
                  TCVN.
                </li>
                <li>
                  <strong>Pháp luật xây dựng:</strong> Luật Xây dựng 2014, thủ
                  tục cấp phép, quy chuẩn kỹ thuật quốc gia (QCVN).
                </li>
                <li>
                  <strong>An toàn lao động:</strong> TCVN 5308:2022, trang bị
                  bảo hộ, biện pháp an toàn khi làm việc trên cao.
                </li>
              </ul>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`${styles.messageWrapper} ${
              msg.type === "user" ? styles.userMessage : styles.aiMessage
            }`}
          >
            {msg.type === "ai" && (
              <Avatar size={40} className={styles.avatar}>
                <RobotOutlined />
              </Avatar>
            )}
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
            <Avatar size={40} className={styles.avatar}>
              <RobotOutlined />
            </Avatar>
            <div className={styles.loadingBubble}>
              <Spin size="small" />
              <span>AI đang suy nghĩ...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={styles.inputArea}>
        {remainingMessages === 0 && (
          <div className={styles.rateLimitWarning}>
            Bạn đã hết lượt tư vấn hôm nay. Quay lại vào ngày mai!
          </div>
        )}
        <div className={styles.inputWrapper}>
          <TextArea
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder="Hỏi về kỹ thuật, pháp luật hoặc an toàn xây dựng..."
            autoSize={{ minRows: 1, maxRows: 5 }}
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
      </div>
    </div>
  );
}
