"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Avatar,
  Input,
  Tabs,
  Empty,
  Spin,
  message as antdMessage,
  Button,
} from "antd";
import {
  SearchOutlined,
  MoreOutlined,
  SendOutlined,
  PhoneOutlined,
  VideoCameraOutlined,
  InfoCircleOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/hooks/useAuth";
import { chatApi, type ConversationListItem } from "@/lib/api/chat";
import styles from "./chat-messenger.module.scss";

const { TextArea } = Input;

interface MessageItem {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  senderName?: string;
  isOwn: boolean;
}

const ChatMessengerList: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [conversations, setConversations] = useState<ConversationListItem[]>(
    []
  );
  const [filteredConversations, setFilteredConversations] = useState<
    ConversationListItem[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  // usernames are provided in conversation.participants

  // Active chat states
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationListItem | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Detect mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 900);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const getParticipantName = (
    participants: { userId: string; username: string }[]
  ) => {
    const other = participants.find((p) => p.userId !== user?.id);
    return other?.username || "Unknown";
  };

  useEffect(() => {
    if (user?.id) {
      fetchConversations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = conversations.filter((conv) => {
        // Search in participant names
        const participantName = getParticipantName(
          conv.participants
        ).toLowerCase();
        const matchesParticipantName = participantName.includes(query);

        // Search in last message content
        const matchesMessageContent =
          conv.lastMessage?.content.toLowerCase().includes(query) ?? false;

        return matchesParticipantName || matchesMessageContent;
      });
      setFilteredConversations(filtered);
    } else {
      setFilteredConversations(conversations);
    }
  }, [searchQuery, conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Check URL params for initial conversation selection
  useEffect(() => {
    const conversationId = searchParams.get("conversationId");
    if (conversationId && conversations.length > 0) {
      const conv = conversations.find((c) => c.id === conversationId);
      if (conv) {
        handleConversationClick(conv);
      }
    }
  }, [searchParams, conversations]);

  const fetchConversations = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const data = await chatApi.getUserConversations(user.id);
      setConversations(data);
      setFilteredConversations(data);

      // Names are already present via API `participants`
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
      antdMessage.error("Không thể tải danh sách hội thoại");
    } finally {
      setLoading(false);
    }
  };

  const handleConversationClick = async (
    conversation: ConversationListItem
  ) => {
    setSelectedConversation(conversation);
    setLoadingMessages(true);

    // Update URL without navigation
    const url = new URL(window.location.href);
    url.searchParams.set("conversationId", conversation.id);
    window.history.pushState({}, "", url);

    try {
      const existingMessages = await chatApi.getMessages(conversation.id);
      const contractorName = getParticipantName(conversation.participants);

      const formatted = existingMessages.map((msg) => ({
        ...msg,
        isOwn: msg.senderId === user!.id,
        senderName: msg.senderId === user!.id ? "Bạn" : contractorName,
      })) as MessageItem[];

      setMessages(formatted);
    } catch (error) {
      console.error("Failed to load messages:", error);
      antdMessage.error("Không thể tải tin nhắn");
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
    setMessages([]);

    // Clear conversationId from URL
    const url = new URL(window.location.href);
    url.searchParams.delete("conversationId");
    window.history.pushState({}, "", url);
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !selectedConversation || !user) return;

    try {
      setSendingMessage(true);

      const response = await chatApi.sendMessage(selectedConversation.id, {
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

      // Update conversation list
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversation.id
            ? { ...conv, lastMessage: response.message }
            : conv
        )
      );

      if (response.warning) {
        antdMessage.warning(response.warning.message);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      antdMessage.error("Không thể gửi tin nhắn");
    } finally {
      setSendingMessage(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins}p`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays === 1) return "Hôm qua";
    if (diffDays < 7) return `${diffDays}d`;

    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const formatMessageTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const truncateMessage = (text: string) => {
    if (text.length <= 50) return text;
    return text.substring(0, 50) + "...";
  };

  if (loading) {
    return (
      <div className={styles.messengerContainer}>
        <div className={styles.loadingState}>
          <Spin size="large" tip="Đang tải..." />
        </div>
      </div>
    );
  }

  // Mobile view: show chat panel when conversation selected
  const showChatInMobile = isMobileView && selectedConversation;

  return (
    <div className={styles.messengerContainer}>
      {/* Left Sidebar - Conversations List */}
      <div
        className={styles.conversationsSidebar}
        style={{ display: showChatInMobile ? "none" : "flex" }}
      >
        <div className={styles.sidebarHeader}>
          <div className={styles.headerTop}>
            <h1>Tin nhắn</h1>
            <div className={styles.headerActions}>
              <button className={styles.iconButton}>
                <MoreOutlined />
              </button>
            </div>
          </div>
          <div className={styles.searchBox}>
            <Input
              placeholder="Tìm kiếm"
              prefix={<SearchOutlined />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
            />
          </div>
        </div>

        <div className={styles.conversationTabs}>
          <Tabs
            defaultActiveKey="all"
            items={[
              { key: "all", label: "Tất cả" },
              { key: "unread", label: "Chưa đọc" },
            ]}
          />
        </div>

        <div className={styles.conversationsList}>
          {filteredConversations.length === 0 ? (
            <div className={styles.emptyState}>
              <Empty
                description={
                  searchQuery
                    ? "Không tìm thấy cuộc hội thoại"
                    : "Chưa có tin nhắn nào"
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className={`${styles.conversationItem} ${
                  selectedConversation?.id === conv.id ? styles.active : ""
                } ${conv.unreadCount > 0 ? styles.unread : ""}`}
                onClick={() => handleConversationClick(conv)}
              >
                <div className={styles.conversationAvatar}>
                  <Avatar size={52} className={styles.avatar}>
                    {getParticipantName(conv.participants).charAt(0)}
                  </Avatar>
                  {conv.unreadCount > 0 && (
                    <div className={styles.unreadBadge}>{conv.unreadCount}</div>
                  )}
                </div>
                <div className={styles.conversationInfo}>
                  <div className={styles.nameRow}>
                    <div className={styles.name}>
                      {getParticipantName(conv.participants)}
                    </div>
                    <div className={styles.time}>
                      {conv.lastMessage &&
                        formatTime(conv.lastMessage.createdAt)}
                    </div>
                  </div>
                  <div className={styles.lastMessage}>
                    {conv.lastMessage?.senderId === user?.id && (
                      <span className={styles.messageIcon}>Bạn: </span>
                    )}
                    {conv.lastMessage
                      ? truncateMessage(conv.lastMessage.content)
                      : "Bắt đầu cuộc trò chuyện"}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Panel - Chat View */}
      <div
        className={styles.chatPanel}
        style={{
          display: isMobileView && !selectedConversation ? "none" : "flex",
        }}
      >
        {!selectedConversation ? (
          <div className={styles.emptyChat}>
            <div className={styles.emptyChatContent}>
              <div className={styles.emptyIcon}>💬</div>
              <h3>Chọn một cuộc trò chuyện</h3>
              <p>Chọn từ danh sách bên trái để bắt đầu nhắn tin</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className={styles.chatHeader}>
              <div className={styles.chatHeaderLeft}>
                {isMobileView && (
                  <button
                    className={styles.iconButton}
                    onClick={handleBackToList}
                  >
                    <ArrowLeftOutlined />
                  </button>
                )}
                <Avatar size={40} className={styles.headerAvatar}>
                  {getParticipantName(selectedConversation.participants).charAt(
                    0
                  )}
                </Avatar>
                <div className={styles.headerInfo}>
                  <div className={styles.headerName}>
                    {getParticipantName(selectedConversation.participants)}
                  </div>
                  <div className={styles.headerStatus}>Đang hoạt động</div>
                </div>
              </div>
              <div className={styles.chatHeaderActions}>
                <button className={styles.iconButton}>
                  <PhoneOutlined />
                </button>
                <button className={styles.iconButton}>
                  <VideoCameraOutlined />
                </button>
                <button className={styles.iconButton}>
                  <InfoCircleOutlined />
                </button>
              </div>
            </div>

            {/* Messages Container */}
            <div className={styles.messagesContainer}>
              {loadingMessages ? (
                <div className={styles.messagesLoading}>
                  <Spin tip="Đang tải tin nhắn..." />
                </div>
              ) : messages.length === 0 ? (
                <div className={styles.emptyMessages}>
                  <Empty description="Chưa có tin nhắn nào" />
                </div>
              ) : (
                <>
                  {messages.map((message, index) => {
                    const showAvatar =
                      index === messages.length - 1 ||
                      messages[index + 1]?.senderId !== message.senderId;

                    return (
                      <div
                        key={message.id}
                        className={`${styles.messageWrapper} ${
                          message.isOwn
                            ? styles.ownMessage
                            : styles.otherMessage
                        }`}
                      >
                        <div className={styles.messageContent}>
                          {!message.isOwn && showAvatar && (
                            <Avatar size={32} className={styles.messageAvatar}>
                              {message.senderName?.charAt(0)}
                            </Avatar>
                          )}
                          {!message.isOwn && !showAvatar && (
                            <div className={styles.avatarSpacer} />
                          )}
                          <div className={styles.messageBubble}>
                            <div className={styles.messageText}>
                              {message.content}
                            </div>
                            <div className={styles.messageTime}>
                              {formatMessageTime(message.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <div className={styles.messageInput}>
              <div className={styles.inputWrapper}>
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
                  disabled={sendingMessage}
                  className={styles.textArea}
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSendMessage}
                  loading={sendingMessage}
                  disabled={!currentMessage.trim()}
                  className={styles.sendButton}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatMessengerList;
