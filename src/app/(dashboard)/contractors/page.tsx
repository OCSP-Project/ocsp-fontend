// src/app/dashboard/contractor/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Tag,
  Button,
  Progress,
  Tabs,
  Avatar,
  Typography,
  Space,
  Divider,
  List,
  Rate,
  Timeline,
  Modal,
} from "antd";
import {
  ProjectOutlined,
  DollarOutlined,
  TeamOutlined,
  StarOutlined,
  RiseOutlined,
  PlusOutlined,
  CalendarOutlined,
  ToolOutlined,
  FileTextOutlined,
  CameraOutlined,
  BankOutlined,
  AlertOutlined,
} from "@ant-design/icons";
import { gsap } from "gsap";
import RoleBasedRoute from "@/components/shared/RoleBasedRoute";
import { UserRole } from "@/hooks/useAuth";
import styles from "./ContractorDashboard.module.scss";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Mock data
const mockStats = {
  activeProjects: 5,
  totalRevenue: 1250000000,
  teamMembers: 24,
  averageRating: 4.8,
  projectsGrowth: 25.3,
  revenueGrowth: 42.7,
  ratingImprovement: 0.3,
};

const mockProjects = [
  {
    id: 1,
    title: "Nhà phố 3 tầng",
    homeowner: "Nguyễn Văn An",
    budget: 2500000000,
    progress: 65,
    status: "In Progress",
    deadline: "2024-03-15",
    phase: "Thi công thô",
    team: ["Phạm Văn A", "Trần Thị B", "Lê Văn C"],
    nextPayment: 500000000,
  },
  {
    id: 2,
    title: "Villa 2 tầng",
    homeowner: "Trần Thị Bình",
    budget: 4200000000,
    progress: 30,
    status: "Planning",
    deadline: "2024-06-20",
    phase: "Chuẩn bị thi công",
    team: ["Nguyễn Văn D", "Hoàng Thị E"],
    nextPayment: 1200000000,
  },
  {
    id: 3,
    title: "Nhà cấp 4",
    homeowner: "Lê Văn Cường",
    budget: 1800000000,
    progress: 85,
    status: "Near Completion",
    deadline: "2024-02-10",
    phase: "Hoàn thiện",
    team: ["Vũ Văn F", "Đặng Thị G", "Mai Văn H"],
    nextPayment: 180000000,
  },
];

const mockLeads = [
  {
    id: 1,
    title: "Xây nhà 2 tầng",
    homeowner: "Phạm Thị Lan",
    location: "Hải Châu, Đà Nẵng",
    budget: "2.8 - 3.2 tỷ",
    postDate: "2024-01-16",
    deadline: "2024-01-25",
    status: "New",
  },
  {
    id: 2,
    title: "Sửa chữa villa",
    homeowner: "Trương Văn Minh",
    location: "Thanh Khê, Đà Nẵng",
    budget: "800 - 1.2 tỷ",
    postDate: "2024-01-15",
    deadline: "2024-01-22",
    status: "Interested",
  },
];

const mockPayments = [
  {
    id: 1,
    project: "Nhà phố 3 tầng",
    amount: 500000000,
    dueDate: "2024-01-25",
    status: "Pending",
  },
  {
    id: 2,
    project: "Villa 2 tầng",
    amount: 1200000000,
    dueDate: "2024-02-01",
    status: "Scheduled",
  },
  {
    id: 3,
    project: "Nhà cấp 4",
    amount: 180000000,
    dueDate: "2024-01-30",
    status: "Due Soon",
  },
];

const ContractorDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [proposalModalVisible, setProposalModalVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);

    // GSAP Animations
    gsap.fromTo(
      ".contractor-header",
      { opacity: 0, y: -30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
    );

    gsap.fromTo(
      ".contractor-stat-card",
      { opacity: 0, scale: 0.9 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: "back.out(1.7)",
        delay: 0.2,
      }
    );

    gsap.fromTo(
      ".contractor-content",
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out",
        delay: 0.4,
      }
    );
  }, []);

  const projectColumns = [
    {
      title: "Dự án",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: any) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            Chủ nhà: {record.homeowner}
          </div>
          <div style={{ fontSize: "12px", color: "#999" }}>
            Giai đoạn: {record.phase}
          </div>
        </div>
      ),
    },
    {
      title: "Ngân sách",
      dataIndex: "budget",
      key: "budget",
      render: (budget: number) => (
        <Text strong>
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            notation: "compact",
          }).format(budget)}
        </Text>
      ),
    },
    {
      title: "Tiến độ",
      dataIndex: "progress",
      key: "progress",
      render: (progress: number) => (
        <Progress percent={progress} size="small" />
      ),
    },
    {
      title: "Deadline",
      dataIndex: "deadline",
      key: "deadline",
      render: (date: string) => (
        <Space>
          <CalendarOutlined />
          <span>{new Date(date).toLocaleDateString("vi-VN")}</span>
        </Space>
      ),
    },
    {
      title: "Nhóm",
      dataIndex: "team",
      key: "team",
      render: (team: string[]) => (
        <Avatar.Group maxCount={3} size="small">
          {team.map((member, index) => (
            <Avatar key={index} size="small">
              {member.split(" ").pop()}
            </Avatar>
          ))}
        </Avatar.Group>
      ),
    },
  ];

  return (
    <RoleBasedRoute allowedRoles={[UserRole.Contractor]}>
      <div className={styles.contractorDashboard}>
        {/* Header */}
        <div className={`${styles.dashboardHeader} contractor-header`}>
          <div className={styles.headerContent}>
            <div>
              <Title level={2} className={styles.pageTitle}>
                Dashboard Thầu xây dựng
              </Title>
              <Text className={styles.pageSubtitle}>
                Quản lý dự án và phát triển kinh doanh
              </Text>
            </div>
            <div className={styles.headerActions}>
              <Button icon={<FileTextOutlined />}>Tạo báo giá</Button>
              <Button type="primary" icon={<PlusOutlined />}>
                Dự án mới
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[24, 24]} className={styles.statsSection}>
          <Col xs={24} sm={12} lg={6}>
            <Card
              className={`${styles.statCard} contractor-stat-card`}
              loading={loading}
            >
              <Statistic
                title="Dự án đang thực hiện"
                value={mockStats.activeProjects}
                valueStyle={{ color: "#1890ff" }}
                prefix={<ProjectOutlined />}
                suffix={
                  <span className={styles.growthIndicator}>
                    <RiseOutlined style={{ color: "#52c41a" }} />
                    {mockStats.projectsGrowth}%
                  </span>
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              className={`${styles.statCard} contractor-stat-card`}
              loading={loading}
            >
              <Statistic
                title="Doanh thu tháng này"
                value={mockStats.totalRevenue}
                valueStyle={{ color: "#52c41a" }}
                prefix={<DollarOutlined />}
                formatter={(value) =>
                  new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                    notation: "compact",
                  }).format(Number(value))
                }
                suffix={
                  <span className={styles.growthIndicator}>
                    <RiseOutlined style={{ color: "#52c41a" }} />
                    {mockStats.revenueGrowth}%
                  </span>
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              className={`${styles.statCard} contractor-stat-card`}
              loading={loading}
            >
              <Statistic
                title="Thành viên nhóm"
                value={mockStats.teamMembers}
                valueStyle={{ color: "#faad14" }}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              className={`${styles.statCard} contractor-stat-card`}
              loading={loading}
            >
              <Statistic
                title="Đánh giá trung bình"
                value={mockStats.averageRating}
                precision={1}
                valueStyle={{ color: "#ff4d4f" }}
                prefix={<StarOutlined />}
                suffix={
                  <Rate
                    disabled
                    defaultValue={mockStats.averageRating}
                    style={{ fontSize: "14px" }}
                  />
                }
              />
            </Card>
          </Col>
        </Row>

        {/* Main Content Tabs */}
        <div className={`${styles.mainContent} contractor-content`}>
          <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
            <TabPane tab="Tổng quan" key="overview">
              <Row gutter={[24, 24]}>
                <Col xs={24} xl={16}>
                  <Card
                    title="Dự án đang thực hiện"
                    className={styles.contentCard}
                  >
                    <Table
                      columns={projectColumns}
                      dataSource={mockProjects}
                      pagination={false}
                      rowKey="id"
                    />
                  </Card>
                </Col>
                <Col xs={24} xl={8}>
                  <Space
                    direction="vertical"
                    style={{ width: "100%" }}
                    size="large"
                  >
                    <Card
                      title="Thanh toán sắp tới"
                      className={styles.contentCard}
                    >
                      <List
                        dataSource={mockPayments}
                        renderItem={(payment) => (
                          <List.Item>
                            <List.Item.Meta
                              title={payment.project}
                              description={
                                <Space direction="vertical" size="small">
                                  <Text strong style={{ color: "#52c41a" }}>
                                    {new Intl.NumberFormat("vi-VN", {
                                      style: "currency",
                                      currency: "VND",
                                      notation: "compact",
                                    }).format(payment.amount)}
                                  </Text>
                                  <Text type="secondary">
                                    Hạn:{" "}
                                    {new Date(
                                      payment.dueDate
                                    ).toLocaleDateString("vi-VN")}
                                  </Text>
                                  <Tag
                                    color={
                                      payment.status === "Due Soon"
                                        ? "orange"
                                        : payment.status === "Pending"
                                        ? "red"
                                        : "blue"
                                    }
                                  >
                                    {payment.status}
                                  </Tag>
                                </Space>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    </Card>

                    <Card
                      title="Hoạt động gần đây"
                      className={styles.contentCard}
                    >
                      <Timeline>
                        <Timeline.Item color="blue">
                          <div>
                            <strong>Nhận thanh toán</strong>
                            <br />
                            <Text type="secondary">
                              Villa 2 tầng - 1.2 tỷ VNĐ
                            </Text>
                            <br />
                            <Text type="secondary">2 giờ trước</Text>
                          </div>
                        </Timeline.Item>
                        <Timeline.Item color="green">
                          <div>
                            <strong>Hoàn thành giai đoạn</strong>
                            <br />
                            <Text type="secondary">
                              Nhà cấp 4 - Thi công thô
                            </Text>
                            <br />
                            <Text type="secondary">1 ngày trước</Text>
                          </div>
                        </Timeline.Item>
                        <Timeline.Item color="orange">
                          <div>
                            <strong>Báo cáo tiến độ</strong>
                            <br />
                            <Text type="secondary">Nhà phố 3 tầng - 65%</Text>
                            <br />
                            <Text type="secondary">2 ngày trước</Text>
                          </div>
                        </Timeline.Item>
                      </Timeline>
                    </Card>
                  </Space>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="Cơ hội mới" key="leads">
              <Row gutter={[24, 24]}>
                <Col xs={24}>
                  <Card
                    title="Dự án cần thầu"
                    className={styles.contentCard}
                    extra={<Button type="primary">Xem tất cả</Button>}
                  >
                    <List
                      dataSource={mockLeads}
                      renderItem={(lead) => (
                        <List.Item
                          actions={[
                            <Button
                              key="view"
                              type="link"
                              onClick={() => setProposalModalVisible(true)}
                            >
                              Xem chi tiết
                            </Button>,
                            <Button key="proposal" type="primary">
                              Gửi báo giá
                            </Button>,
                          ]}
                        >
                          <List.Item.Meta
                            title={
                              <Space>
                                {lead.title}
                                <Tag
                                  color={
                                    lead.status === "New" ? "green" : "blue"
                                  }
                                >
                                  {lead.status}
                                </Tag>
                              </Space>
                            }
                            description={
                              <Space direction="vertical" size="small">
                                <Text>Chủ nhà: {lead.homeowner}</Text>
                                <Text type="secondary">
                                  Địa điểm: {lead.location}
                                </Text>
                                <Text>
                                  Ngân sách:{" "}
                                  <Text strong style={{ color: "#52c41a" }}>
                                    {lead.budget}
                                  </Text>
                                </Text>
                                <Text type="secondary">
                                  Đăng ngày:{" "}
                                  {new Date(lead.postDate).toLocaleDateString(
                                    "vi-VN"
                                  )}{" "}
                                  • Hạn:{" "}
                                  {new Date(lead.deadline).toLocaleDateString(
                                    "vi-VN"
                                  )}
                                </Text>
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="Tài chính" key="finance">
              <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                  <Card
                    title="Tổng quan tài chính"
                    className={styles.contentCard}
                  >
                    <Space
                      direction="vertical"
                      style={{ width: "100%" }}
                      size="large"
                    >
                      <Statistic
                        title="Doanh thu tháng này"
                        value={mockStats.totalRevenue}
                        formatter={(value) =>
                          new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(Number(value))
                        }
                        prefix={<BankOutlined />}
                      />
                      <Divider />
                      <Statistic
                        title="Thanh toán chờ nhận"
                        value={1680000000}
                        formatter={(value) =>
                          new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(Number(value))
                        }
                        prefix={<AlertOutlined />}
                        valueStyle={{ color: "#faad14" }}
                      />
                    </Space>
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card title="Chi phí dự án" className={styles.contentCard}>
                    <List
                      dataSource={[
                        {
                          name: "Vật liệu xây dựng",
                          amount: 680000000,
                          percentage: 45,
                        },
                        {
                          name: "Nhân công",
                          amount: 450000000,
                          percentage: 30,
                        },
                        {
                          name: "Máy móc thiết bị",
                          amount: 230000000,
                          percentage: 15,
                        },
                        {
                          name: "Chi phí khác",
                          amount: 150000000,
                          percentage: 10,
                        },
                      ]}
                      renderItem={(item) => (
                        <List.Item>
                          <div style={{ width: "100%" }}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <Text>{item.name}</Text>
                              <Text strong>
                                {new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                  notation: "compact",
                                }).format(item.amount)}
                              </Text>
                            </div>
                            <Progress
                              percent={item.percentage}
                              size="small"
                              showInfo={false}
                            />
                          </div>
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
              </Row>
            </TabPane>
          </Tabs>
        </div>

        {/* Proposal Modal */}
        <Modal
          title="Chi tiết dự án"
          visible={proposalModalVisible}
          onCancel={() => setProposalModalVisible(false)}
          footer={[
            <Button key="cancel" onClick={() => setProposalModalVisible(false)}>
              Đóng
            </Button>,
            <Button key="proposal" type="primary">
              Gửi báo giá
            </Button>,
          ]}
          width={800}
        >
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            <div>
              <Title level={4}>Xây nhà 2 tầng</Title>
              <Text type="secondary">Chủ nhà: Phạm Thị Lan</Text>
            </div>
            <Divider />
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>Địa điểm:</Text>
                <br />
                <Text>Hải Châu, Đà Nẵng</Text>
              </Col>
              <Col span={12}>
                <Text strong>Ngân sách:</Text>
                <br />
                <Text>2.8 - 3.2 tỷ VNĐ</Text>
              </Col>
              <Col span={12}>
                <Text strong>Diện tích:</Text>
                <br />
                <Text>120m²</Text>
              </Col>
              <Col span={12}>
                <Text strong>Thời gian dự kiến:</Text>
                <br />
                <Text>6-8 tháng</Text>
              </Col>
            </Row>
            <Divider />
            <div>
              <Text strong>Mô tả chi tiết:</Text>
              <br />
              <Text>
                Cần xây dựng nhà 2 tầng trên diện tích 120m², bao gồm 3 phòng
                ngủ, 2 phòng tắm, phòng khách, phòng bếp. Yêu cầu sử dụng vật
                liệu cao cấp, thiết kế hiện đại, thi công đảm bảo chất lượng và
                đúng tiến độ.
              </Text>
            </div>
          </Space>
        </Modal>
      </div>
    </RoleBasedRoute>
  );
};

export default ContractorDashboard;
