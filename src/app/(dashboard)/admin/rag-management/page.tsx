"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  message,
  Tag,
  Space,
  Typography,
  Statistic,
  Row,
  Col,
  Modal,
  Progress,
  Alert,
  Tooltip,
} from "antd";
import {
  SyncOutlined,
  CheckCircleOutlined,
  DatabaseOutlined,
  ThunderboltOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import RoleBasedRoute from "@/components/shared/RoleBasedRoute";
import { UserRole } from "@/hooks/useAuth";

const { Title, Text, Paragraph } = Typography;

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
const RAG_API_BASE = process.env.NEXT_PUBLIC_RAG_API_URL || "http://13.210.146.91:8000";

interface Contractor {
  id: string;
  companyName: string;
  description?: string;
  province?: string;
  city?: string;
  averageRating: number;
  totalReviews: number;
  minProjectBudget?: number;
  maxProjectBudget?: number;
  yearsOfExperience?: number;
  teamSize?: number;
  isVerified: boolean;
  isEmbedded?: boolean; // Track if contractor is embedded in RAG
}

interface RAGHealth {
  status: string;
  database: string;
  document_count: number;
  embedding_service: string;
  gemini_configured: boolean;
}

const RAGManagementPage: React.FC = () => {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(false);
  const [embeddingLoading, setEmbeddingLoading] = useState(false);
  const [ragHealth, setRagHealth] = useState<RAGHealth | null>(null);
  const [selectedContractors, setSelectedContractors] = useState<string[]>([]);
  const [embeddingProgress, setEmbeddingProgress] = useState(0);
  const [showProgressModal, setShowProgressModal] = useState(false);

  // Fetch contractors from backend
  const fetchContractors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/Contractor`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch contractors");

      const data = await response.json();
      setContractors(data);
    } catch (error) {
      console.error("Error fetching contractors:", error);
      message.error("Không thể tải danh sách nhà thầu");
    } finally {
      setLoading(false);
    }
  };

  // Check RAG API health
  const checkRAGHealth = async () => {
    try {
      const response = await fetch(`${RAG_API_BASE}/health`);
      const data = await response.json();
      setRagHealth(data);
    } catch (error) {
      console.error("RAG health check failed:", error);
      message.error("Không thể kết nối đến RAG API");
    }
  };

  // Embed contractors to RAG
  const embedContractors = async (contractorIds?: string[]) => {
    const idsToEmbed = contractorIds || selectedContractors;
    if (idsToEmbed.length === 0) {
      message.warning("Vui lòng chọn nhà thầu để embed");
      return;
    }

    setEmbeddingLoading(true);
    setShowProgressModal(true);
    setEmbeddingProgress(0);

    try {
      const contractorsToEmbed = contractors.filter((c) =>
        idsToEmbed.includes(c.id)
      );

      // Format contractor data for embedding
      const formattedData = contractorsToEmbed.map((c) => ({
        contractor_id: c.id,
        contractor_name: c.companyName,
        contractor_slug: c.companyName.toLowerCase().replace(/\s+/g, "-"),
        description: c.description || "Nhà thầu xây dựng chuyên nghiệp",
        specialties: [], // Can be extracted from description if needed
        budget_range: c.minProjectBudget && c.maxProjectBudget
          ? `${c.minProjectBudget / 1000000000}  tỷ - ${c.maxProjectBudget / 1000000000} tỷ`
          : "Liên hệ để biết giá",
        location: `${c.city || ""}, ${c.province || ""}`.trim(),
        rating: c.averageRating || 0,
        years_of_experience: c.yearsOfExperience || 0,
        team_size: c.teamSize || 0,
        is_verified: c.isVerified,
      }));

      // Send to RAG API
      const response = await fetch(`${RAG_API_BASE}/api/v1/embed/contractors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contractors: formattedData,
          chunk_size: 500,
          chunk_overlap: 50,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to embed contractors");
      }

      const result = await response.json();
      setEmbeddingProgress(100);

      message.success(
        `Đã embed thành công ${result.contractors_processed} nhà thầu (${result.chunks_created} chunks)`
      );

      // Refresh RAG health
      await checkRAGHealth();
      setSelectedContractors([]);
    } catch (error: any) {
      console.error("Embedding error:", error);
      message.error(error.message || "Có lỗi xảy ra khi embedding");
    } finally {
      setEmbeddingLoading(false);
      setTimeout(() => setShowProgressModal(false), 1500);
    }
  };

  useEffect(() => {
    fetchContractors();
    checkRAGHealth();
  }, []);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 100,
      render: (id: string) => (
        <Text copyable ellipsis style={{ maxWidth: 80 }}>
          {id.substring(0, 8)}...
        </Text>
      ),
    },
    {
      title: "Tên công ty",
      dataIndex: "companyName",
      key: "companyName",
      width: 250,
      render: (name: string, record: Contractor) => (
        <Space direction="vertical" size={0}>
          <Text strong>{name}</Text>
          {record.isVerified && (
            <Tag color="blue" icon={<CheckCircleOutlined />}>
              Verified
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: 300,
      ellipsis: true,
      render: (desc: string) => (
        <Tooltip title={desc}>
          <Text ellipsis>{desc || "Chưa có mô tả"}</Text>
        </Tooltip>
      ),
    },
    {
      title: "Địa điểm",
      key: "location",
      width: 150,
      render: (_: any, record: Contractor) => (
        <Text>{`${record.city || ""}, ${record.province || ""}`.trim() || "N/A"}</Text>
      ),
    },
    {
      title: "Đánh giá",
      dataIndex: "averageRating",
      key: "averageRating",
      width: 120,
      render: (rating: number, record: Contractor) => (
        <Space>
          <Text strong>{rating.toFixed(1)} ⭐</Text>
          <Text type="secondary">({record.totalReviews})</Text>
        </Space>
      ),
    },
    {
      title: "Ngân sách",
      key: "budget",
      width: 180,
      render: (_: any, record: Contractor) => {
        if (record.minProjectBudget && record.maxProjectBudget) {
          return (
            <Text>
              {(record.minProjectBudget / 1000000000).toFixed(1)} -{" "}
              {(record.maxProjectBudget / 1000000000).toFixed(1)} tỷ
            </Text>
          );
        }
        return <Text type="secondary">Liên hệ</Text>;
      },
    },
    {
      title: "Kinh nghiệm",
      dataIndex: "yearsOfExperience",
      key: "yearsOfExperience",
      width: 100,
      render: (years: number) => <Text>{years || 0} năm</Text>,
    },
  ];

  const rowSelection = {
    selectedRowKeys: selectedContractors,
    onChange: (selectedRowKeys: React.Key[]) => {
      setSelectedContractors(selectedRowKeys as string[]);
    },
  };

  return (
    <RoleBasedRoute allowedRoles={[UserRole.Admin]}>
      <div style={{ padding: "80px 24px 24px 24px", minHeight: "100vh", background: "#f5f5f5" }}>
        {/* Header */}
        <Card style={{ marginBottom: 24, borderRadius: 12 }}>
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <Title level={2} style={{ margin: 0 }}>
                  <ThunderboltOutlined /> RAG Management
                </Title>
                <Paragraph type="secondary">
                  Quản lý embedding nhà thầu cho AI Assistant
                </Paragraph>
              </div>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  fetchContractors();
                  checkRAGHealth();
                }}
              >
                Refresh
              </Button>
            </div>

            {/* RAG Health Stats */}
            <Row gutter={16}>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="RAG Status"
                    value={ragHealth?.status || "unknown"}
                    valueStyle={{
                      color: ragHealth?.status === "healthy" ? "#3f8600" : "#cf1322",
                    }}
                    prefix={
                      ragHealth?.status === "healthy" ? (
                        <CheckCircleOutlined />
                      ) : (
                        <InfoCircleOutlined />
                      )
                    }
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Documents in RAG"
                    value={ragHealth?.document_count || 0}
                    prefix={<DatabaseOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Total Contractors"
                    value={contractors.length}
                    prefix={<DatabaseOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Gemini Embedding"
                    value={ragHealth?.embedding_service || "unknown"}
                    valueStyle={{
                      color:
                        ragHealth?.embedding_service === "connected"
                          ? "#3f8600"
                          : "#cf1322",
                    }}
                  />
                </Card>
              </Col>
            </Row>

            {ragHealth?.status !== "healthy" && (
              <Alert
                message="RAG API không khả dụng"
                description="Vui lòng kiểm tra kết nối đến RAG API hoặc cấu hình GEMINI_API_KEY"
                type="warning"
                showIcon
              />
            )}
          </Space>
        </Card>

        {/* Actions */}
        <Card style={{ marginBottom: 24, borderRadius: 12 }}>
          <Space>
            <Button
              type="primary"
              icon={<SyncOutlined spin={embeddingLoading} />}
              onClick={() => embedContractors()}
              loading={embeddingLoading}
              disabled={selectedContractors.length === 0 || ragHealth?.status !== "healthy"}
            >
              Embed Selected ({selectedContractors.length})
            </Button>
            <Button
              icon={<DatabaseOutlined />}
              onClick={() => embedContractors(contractors.map((c) => c.id))}
              loading={embeddingLoading}
              disabled={ragHealth?.status !== "healthy"}
            >
              Embed All Contractors
            </Button>
          </Space>
        </Card>

        {/* Contractors Table */}
        <Card title="Danh sách Contractors" style={{ borderRadius: 12 }}>
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={contractors}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} nhà thầu`,
            }}
            scroll={{ x: 1200 }}
          />
        </Card>

        {/* Progress Modal */}
        <Modal
          title="Đang Embedding Contractors"
          open={showProgressModal}
          footer={null}
          closable={false}
          centered
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            <Progress percent={embeddingProgress} status="active" />
            <Text type="secondary">
              Đang xử lý và embedding dữ liệu nhà thầu vào RAG system...
            </Text>
          </Space>
        </Modal>
      </div>
    </RoleBasedRoute>
  );
};

export default RAGManagementPage;
