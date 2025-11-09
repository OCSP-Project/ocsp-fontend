"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Avatar,
  Input,
  Empty,
  Spin,
  message as antdMessage,
  Button,
} from "antd";
import {
  SendOutlined,
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

interface ProjectChatProps {
  projectId: string;
  onBack?: () => void;
}

const ProjectChat: React.FC<ProjectChatProps> = ({ projectId, onBack }) => {
  const router = useRouter();
  const { user } = useAuth();

  const [conversation, setConversation] = useState<ConversationListItem | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [creatingConversation, setCreatingConversation] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Find or create conversation for this project
  useEffect(() => {
    if (!user?.id || !projectId) return;

    const findOrCreateConversation = async () => {
      try {
        setLoading(true);

        // Get all conversations
        const conversations = await chatApi.getUserConversations(user.id);

        // Find conversation for this project
        const projectConversation = conversations.find(
          (conv) => conv.projectId === projectId
        );

        if (projectConversation) {
          setConversation(projectConversation);
          await loadMessages(projectConversation);
        } else {
          // Need to create conversation - but we need project participants
          // For now, show message to start conversation
          setConversation(null);
          antdMessage.info("Cuộc trò chuyện sẽ được tạo khi có tin nhắn đầu tiên");
        }
      } catch (error) {
        console.error("Failed to load conversation:", error);
        antdMessage.error("Không thể tải cuộc trò chuyện");
      } finally {
        setLoading(false);
      }
    };

    findOrCreateConversation();
  }, [user?.id, projectId]);

  const loadMessages = async (conv: ConversationListItem) => {
    try {
      setLoadingMessages(true);
      const existingMessages = await chatApi.getMessages(conv.id);

      const formatted = existingMessages.map((msg) => {
        const sender = conv.participants.find((p) => p.userId === msg.senderId);
        return {
          ...msg,
          isOwn: msg.senderId === user!.id,
          senderName:
            msg.senderId === user!.id
              ? "Bạn"
              : sender?.username || "Unknown",
        };
      }) as MessageItem[];

      setMessages(formatted);
    } catch (error) {
      console.error("Failed to load messages:", error);
      antdMessage.error("Không thể tải tin nhắn");
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !user) return;

    try {
      setSendingMessage(true);

      let conversationId = conversation?.id;

      // Create conversation if it doesn't exist
      if (!conversationId) {
        setCreatingConversation(true);
        try {
          // Get project participants - for now, we'll need to get this from project API
          // For simplicity, we'll try to start conversation with projectId
          const response = await chatApi.startConversation({
            projectId: projectId,
            userIds: [], // Backend should handle adding project participants
            chatType: "project",
          });

          conversationId = response.conversationId;
          
          // Reload conversations to get the new one
          const conversations = await chatApi.getUserConversations(user.id);
          const newConv = conversations.find((c) => c.id === conversationId);
          if (newConv) {
            setConversation(newConv);
          }
        } catch (error) {
          console.error("Failed to create conversation:", error);
          antdMessage.error("Không thể tạo cuộc trò chuyện");
          return;
        } finally {
          setCreatingConversation(false);
        }
      }

      if (!conversationId) {
        antdMessage.error("Không thể tạo cuộc trò chuyện");
        return;
      }

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

      // Update conversation last message
      if (conversation) {
        setConversation({
          ...conversation,
          lastMessage: response.message,
        });
      }

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

  const formatMessageTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const getParticipantNames = (participants: { userId: string; username: string }[]) => {
    const others = participants
      .filter((p) => p.userId !== user?.id)
      .map((p) => p.username);
    return others.join(", ") || "Unknown";
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

  return (
    <div className={styles.messengerContainer}>
      <div className={styles.chatPanel} style={{ display: "flex", width: "100%" }}>
        {!conversation ? (
          <div className={styles.emptyChat}>
            <div className={styles.emptyChatContent}>
              <div className={styles.emptyIcon}>💬</div>
              <h3>Chưa có cuộc trò chuyện</h3>
              <p>Gửi tin nhắn đầu tiên để bắt đầu cuộc trò chuyện</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className={styles.chatHeader}>
              <div className={styles.chatHeaderLeft}>
                {onBack && (
                  <button
                    className={styles.iconButton}
                    onClick={onBack}
                  >
                    <ArrowLeftOutlined />
                  </button>
                )}
                <Avatar size={40} className={styles.headerAvatar}>
                  {getParticipantNames(conversation.participants).charAt(0)}
                </Avatar>
                <div className={styles.headerInfo}>
                  <div className={styles.headerName}>
                    {getParticipantNames(conversation.participants) || "Dự án"}
                  </div>
                  <div className={styles.headerStatus}>Cuộc trò chuyện dự án</div>
                </div>
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
                            {!message.isOwn && (
                              <div className={styles.senderName}>
                                {message.senderName}
                              </div>
                            )}
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
                  disabled={sendingMessage || creatingConversation}
                  className={styles.textArea}
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSendMessage}
                  loading={sendingMessage || creatingConversation}
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

export default ProjectChat;

