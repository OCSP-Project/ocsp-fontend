"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  Input,
  Button,
  Avatar,
  Typography,
  Space,
  Divider,
  Alert,
  Modal,
  message,
  Spin,
  Empty,
  Tag,
} from "antd";
import {
  SendOutlined,
  WarningOutlined,
  UserOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/hooks/useAuth";
import { chatApi, type StartChatRequest } from "@/lib/api/chat";
import styles from "./chat.module.scss";

/* ✅ LẤY RA TextArea, Title, Text */
const { TextArea } = Input;
const { Text, Title } = Typography;

/* ✅ THÊM TYPE THIẾU */
type ChatType = "consultation" | "project";

interface MessageItem {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  senderName?: string;
  isOwn: boolean;
}

interface ChatWarning {
  message: string;
  reason: string;
  warningLevel: number;
  requiresAcknowledgment: boolean;
}

const ChatPageClient: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [warning, setWarning] = useState<ChatWarning | null>(null);
  const [showWarningModal, setShowWarningModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const contractorId = searchParams.get("contractorId");
  const projectId = searchParams.get("projectId");
  const chatType = (searchParams.get("type") as ChatType) || "project";

  useEffect(() => {
    // Nếu thiếu user/contractorId thì dừng init để hiện Empty thay vì treo
    if (!user || !contractorId) {
      setInitializing(false);
      return;
    }
    initializeChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractorId, projectId, chatType, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const initializeChat = async () => {
    try {
      setInitializing(true);

      const requestData: StartChatRequest = {
        userIds: [user!.id, contractorId!],
        chatType,
      };
      if (projectId && chatType === "project") {
        requestData.projectId = projectId;
      }

      const conversation = await chatApi.startConversation(requestData);
      setConversationId(conversation.conversationId);

      const existingMessages = await chatApi.getMessages(
        conversation.conversationId
      );

      const formatted = existingMessages.map((msg) => ({
        ...msg,
        isOwn: msg.senderId === user!.id,
        senderName: msg.senderId === user!.id ? "Bạn" : "Nhà thầu",
      })) as MessageItem[];

      setMessages(formatted);
    } catch (error) {
      console.error("Failed to initialize chat:", error);
      message.error("Không thể khởi tạo chat");
    } finally {
      setInitializing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !conversationId || !user) return;

    try {
      setLoading(true);

      const response = await chatApi.sendMessage(conversationId, {
        senderId: user.id,
        content: currentMessage,
      });

      const newMessage: MessageItem = {
        ...response.message,
        isOwn: true,
        senderName: "Bạn",
      };

      setMessages((prev) => [...prev, newMessage]);
      setCurrentMessage("");

      if (response.warning) {
        setWarning(response.warning);
        if (response.requiresAcknowledgment) {
          setShowWarningModal(true);
        } else {
          message.warning(response.warning.message);
        }
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      message.error("Không thể gửi tin nhắn");
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledgeWarning = async () => {
    if (!warning || !user) return;

    try {
      await chatApi.acknowledgeWarning({
        userId: user.id,
        warningType: "contact_info",
      });

      setShowWarningModal(false);
      setWarning(null);
      message.success("Đã ghi nhận cảnh báo");
    } catch (error) {
      console.error("Failed to acknowledge warning:", error);
      message.error("Lỗi khi ghi nhận cảnh báo");
    }
  };

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("vi-VN");

  const groupMessagesByDate = (items: MessageItem[]) => {
    return items.reduce<Record<string, MessageItem[]>>((acc, m) => {
      const key = formatDate(m.createdAt);
      (acc[key] ||= []).push(m);
      return acc;
    }, {});
  };

  if (initializing) {
    return (
      <div className={styles.chatPage}>
        <div className={styles.loadingContainer}>
          <Spin size="large" tip="Đang khởi tạo chat..." />
        </div>
      </div>
    );
  }

  if (!contractorId || !conversationId) {
    return (
      <div className={styles.chatPage}>
        <div className={styles.errorContainer}>
          <Empty
            description="Không thể khởi tạo chat"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={() => router.back()}>
              Quay lại
            </Button>
          </Empty>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className={styles.chatPage}>
      <Card className={styles.chatContainer}>
        <div className={styles.chatHeader}>
          <Title level={4}>
            {chatType === "consultation" ? "Tư vấn với nhà thầu" : "Chat dự án"}
          </Title>
          <div className={styles.chatInfo}>
            {projectId && <Tag color="blue">Dự án: {projectId}</Tag>}
            {chatType === "consultation" && (
              <Tag color="green">Tư vấn miễn phí</Tag>
            )}
            <Tag color="green">Đang hoạt động</Tag>
          </div>
        </div>

        <div className={styles.messagesContainer}>
          {Object.keys(messageGroups).length === 0 ? (
            <div className={styles.emptyChat}>
              <Empty
                description="Chưa có tin nhắn nào"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          ) : (
            Object.entries(messageGroups).map(([date, msgs]) => (
              <div key={date}>
                <Divider>
                  <Text type="secondary" className={styles.dateLabel}>
                    {date}
                  </Text>
                </Divider>

                {msgs.map((message) => (
                  <div
                    key={message.id}
                    className={`${styles.messageItem} ${
                      message.isOwn ? styles.ownMessage : styles.otherMessage
                    }`}
                  >
                    <div className={styles.messageContent}>
                      <div className={styles.messageHeader}>
                        <Avatar
                          size="small"
                          icon={
                            message.isOwn ? <UserOutlined /> : <RobotOutlined />
                          }
                        />
                        <Text strong className={styles.senderName}>
                          {message.senderName}
                        </Text>
                        <Text type="secondary" className={styles.timestamp}>
                          {formatTime(message.createdAt)}
                        </Text>
                      </div>
                      <div className={styles.messageText}>
                        {message.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.messageInput}>
          <Space.Compact style={{ width: "100%" }}>
            <TextArea
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="Nhập tin nhắn..."
              autoSize={{ minRows: 1, maxRows: 4 }}
              onPressEnter={(e) => {
                if (e.shiftKey) return;
                e.preventDefault();
                handleSendMessage();
              }}
              disabled={loading}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSendMessage}
              loading={loading}
              disabled={!currentMessage.trim()}
            />
          </Space.Compact>
        </div>

        {/* Warning Alert */}
        {warning && !showWarningModal && (
          <Alert
            message="Cảnh báo"
            description={warning.message}
            type="warning"
            showIcon
            icon={<WarningOutlined />}
            closable
            onClose={() => setWarning(null)}
            className={styles.warningAlert}
          />
        )}
      </Card>

      {/* Warning Modal */}
      <Modal
        title={
          <Space>
            <WarningOutlined style={{ color: "#faad14" }} />
            Cảnh báo vi phạm chính sách
          </Space>
        }
        open={showWarningModal}
        onOk={handleAcknowledgeWarning}
        onCancel={() => setShowWarningModal(false)}
        okText="Tôi hiểu"
        cancelText="Đóng"
        className={styles.warningModal}
      >
        <div className={styles.warningContent}>
          <Text>{warning?.message}</Text>
          <div className={styles.warningLevel}>
            <Text type="secondary">Mức độ cảnh báo: </Text>
            <Tag
              color={
                warning?.warningLevel === 3
                  ? "red"
                  : warning?.warningLevel === 2
                  ? "orange"
                  : "yellow"
              }
            >
              Level {warning?.warningLevel}
            </Tag>
          </div>
          <Alert
            message="Lưu ý"
            description="Việc tiếp tục vi phạm có thể dẫn đến hạn chế tài khoản. Vui lòng sử dụng hệ thống chat của OCSP để đảm bảo an toàn."
            type="info"
            showIcon
            className={styles.modalAlert}
          />
        </div>
      </Modal>
    </div>
  );
};

export default ChatPageClient;
