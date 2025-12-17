// src/app/(dashboard)/contractor/posts/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Row, Col, Button, Typography, Space, Card, message } from "antd";
import { PlusOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import RoleBasedRoute from "@/components/shared/RoleBasedRoute";
import { useAuth, UserRole } from "@/hooks/useAuth";
import ContractorPostsList from "@/components/features/contractors/components/ContractorPosts/ContractorPostsList";
import ContractorPostForm from "@/components/features/contractors/components/ContractorPosts/ContractorPostForm";
import { ContractorPost } from "@/lib/contractors/contractor-posts.types";
import {
  createContractorPost,
  deleteContractorPost,
  getContractorPosts,
  getMyContractorProfile,
} from "@/lib/contractors/contractor-posts.api";

const { Title } = Typography;

const ContractorPostsPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [contractorId, setContractorId] = useState<string | null>(null);
  const [posts, setPosts] = useState<ContractorPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postModalVisible, setPostModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch contractor profile on mount
  useEffect(() => {
    const fetchContractorProfile = async () => {
      try {
        console.log("Fetching contractor profile...");
        const profile = await getMyContractorProfile();
        console.log("Contractor profile:", profile);
        setContractorId(profile.id);

        // Optional: save to localStorage for faster subsequent loads
        localStorage.setItem("contractorId", profile.id);
      } catch (error) {
        console.error("Failed to fetch contractor profile:", error);
        message.error("Không thể tải thông tin contractor");
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === UserRole.Contractor) {
      fetchContractorProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchPosts = async () => {
    if (!contractorId) return;

    setPostsLoading(true);
    try {
      const data = await getContractorPosts(contractorId);
      console.log("Fetched posts:", data);
      setPosts(data);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      message.error("Không thể tải bài đăng");
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    if (contractorId) {
      fetchPosts();
    }
  }, [contractorId]);

  // useEffect(() => {
  //   // Page entrance animation
  //   gsap.fromTo(
  //     ".posts-page-header",
  //     { opacity: 0, y: -20 },
  //     { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
  //   );
  // }, []);

  if (loading) {
    return (
      <RoleBasedRoute allowedRoles={[UserRole.Contractor]}>
        <div style={{ textAlign: "center", padding: "40px" }}>
          <div>Đang tải thông tin contractor...</div>
        </div>
      </RoleBasedRoute>
    );
  }

  if (!contractorId) {
    return (
      <RoleBasedRoute allowedRoles={[UserRole.Contractor]}>
        <div style={{ textAlign: "center", padding: "40px" }}>
          <div>Không tìm thấy thông tin contractor</div>
          <Button
            type="primary"
            onClick={() => router.push("/contractor")}
            style={{ marginTop: 16 }}
          >
            Quay về Dashboard
          </Button>
        </div>
      </RoleBasedRoute>
    );
  }

  return (
    <RoleBasedRoute allowedRoles={[UserRole.Contractor]}>
      <div
        className="posts-page"
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, rgba(56, 193, 182, 0.03) 0%, rgba(102, 126, 234, 0.03) 100%)",
          padding: "80px 24px 24px 24px"
        }}
      >
        {/* Header */}
        <div className="posts-page-header">
          <Card
            className="mb-6"
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "20px",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.08)"
            }}
          >
            <Row justify="space-between" align="middle">
              <Col>
                <Space>
                  <div>
                    <Title
                      level={2}
                      style={{
                        margin: 0,
                        background: "linear-gradient(135deg, #38c1b6 0%, #667eea 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text"
                      }}
                    >
                      Bài đăng của tôi
                    </Title>
                    <p style={{ margin: "8px 0 0 0", color: "#666" }}>
                      Quản lý và chia sẻ các bài đăng về dự án
                    </p>
                  </div>
                </Space>
              </Col>
              <Col>
                <Button
                  type="primary"
                  size="large"
                  icon={<PlusOutlined />}
                  onClick={() => setPostModalVisible(true)}
                  style={{
                    background: "linear-gradient(135deg, #38c1b6 0%, #667eea 100%)",
                    border: "none",
                    borderRadius: "12px",
                    height: 52,
                    paddingLeft: 32,
                    paddingRight: 32,
                    fontSize: 16,
                    fontWeight: 600,
                    boxShadow: "0 4px 15px rgba(56, 193, 182, 0.3)",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 25px rgba(56, 193, 182, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 15px rgba(56, 193, 182, 0.3)";
                  }}
                >
                  Tạo bài đăng mới
                </Button>
              </Col>
            </Row>
          </Card>
        </div>

        {/* Posts List */}
        <Row gutter={[24, 24]}>
          <Col xs={24}>
            <ContractorPostsList
              posts={posts}
              loading={postsLoading}
              canManage
              onDelete={async (postId) => {
                if (!contractorId) return;

                try {
                  await deleteContractorPost(contractorId, postId);
                  message.success("Đã xóa bài đăng");
                  await fetchPosts();
                } catch (error) {
                  console.error("Failed to delete post:", error);
                  message.error("Không thể xóa bài đăng");
                }
              }}
              contractorName={user?.username || "Contractor"}
              contractorAvatar={undefined}
            />
          </Col>
        </Row>

        {/* Create Post Modal */}
        <ContractorPostForm
          visible={postModalVisible}
          onClose={() => setPostModalVisible(false)}
          submitting={submitting}
          onSubmit={async ({ title, description, files }) => {
            setSubmitting(true);
            try {
              await createContractorPost(title, description, files);
              message.success("Tạo bài đăng thành công!");
              setPostModalVisible(false);
              await fetchPosts();
            } catch (error) {
              console.error("Failed to create post:", error);
              message.error("Không thể tạo bài đăng");
            } finally {
              setSubmitting(false);
            }
          }}
        />
      </div>
    </RoleBasedRoute>
  );
};

export default ContractorPostsPage;
