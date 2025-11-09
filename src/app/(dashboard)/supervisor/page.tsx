// src/app/dashboard/supervisor/page.tsx
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
  Timeline,
  Badge,
  Avatar,
  Typography,
  Space,
  Alert,
  Tabs,
  Calendar,
  Upload,
} from "antd";
import {
  SafetyCertificateOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  CameraOutlined,
  CalendarOutlined,
  AlertOutlined,
  RiseOutlined,
  EyeOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { gsap } from "gsap";
import { UserRole } from "@/hooks/useAuth";
import styles from "./SupervisorDashboard.module.scss";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Mock data
const mockStats = {
  activeProjects: 8,
  completedInspections: 42,
  pendingReports: 6,
  safetyViolations: 3,
  projectsGrowth: 15.2,
  inspectionsGrowth: 28.7,
  violationsChange: -12.5,
};

const mockProjects = [
  {
    id: 1,
    title: "Nhà phố 3 tầng",
    address: "123 Lê Duẩn, Hải Châu, Đà Nẵng",
    homeowner: "Nguyễn Văn An",
    contractor: "Công ty ABC",
    progress: 65,
    status: "In Progress",
    nextInspection: "2024-01-20",
    riskLevel: "Low",
  },
  {
    id: 2,
    title: "Villa 2 tầng",
    address: "456 Nguyễn Văn Linh, Thanh Khê, Đà Nẵng",
    homeowner: "Trần Thị Bình",
    contractor: "Công ty XYZ",
    progress: 30,
    status: "Planning",
    nextInspection: "2024-01-18",
    riskLevel: "Medium",
  },
  {
    id: 3,
    title: "Nhà cấp 4",
    address: "789 Điện Biên Phủ, Thanh Khê, Đà Nẵng",
    homeowner: "Lê Văn Cường",
    contractor: "Thầu DEF",
    progress: 85,
    status: "Construction",
    nextInspection: "2024-01-22",
    riskLevel: "High",
  },
];

const mockInspections = [
  {
    id: 1,
    projectTitle: "Nhà phố 3 tầng",
    inspectionType: "An toàn lao động",
    date: "2024-01-15",
    status: "Completed",
    findings: 2,
    severity: "Low",
  },
  {
    id: 2,
    projectTitle: "Villa 2 tầng",
    inspectionType: "Chất lượng xây dựng",
    date: "2024-01-14",
    status: "In Review",
    findings: 0,
    severity: "None",
  },
  {
    id: 3,
    projectTitle: "Nhà cấp 4",
    inspectionType: "Tiến độ thi công",
    date: "2024-01-16",
    status: "Scheduled",
    findings: 1,
    severity: "Medium",
  },
];

const SupervisorDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);

    // GSAP Animations
    gsap.fromTo(
      ".supervisor-header",
      { opacity: 0, y: -30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
    );

    gsap.fromTo(
      ".supervisor-stat-card",
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
      ".supervisor-content",
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
            {record.address}
          </div>
          <div style={{ fontSize: "12px", color: "#999" }}>
            {record.homeowner} • {record.contractor}
          </div>
        </div>
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
      title: "Mức độ rủi ro",
      dataIndex: "riskLevel",
      key: "riskLevel",
      render: (risk: string) => {
        const colors = {
          Low: "success",
          Medium: "warning",
          High: "error",
        };
        return <Tag color={colors[risk as keyof typeof colors]}>{risk}</Tag>;
      },
    },
    {
      title: "Kiểm tra tiếp theo",
      dataIndex: "nextInspection",
      key: "nextInspection",
      render: (date: string) => (
        <Space>
          <CalendarOutlined />
          <span>{new Date(date).toLocaleDateString("vi-VN")}</span>
        </Space>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (record: any) => (
        <Space>
          <Button type="primary" size="small" icon={<EyeOutlined />}>
            Xem chi tiết
          </Button>
          <Button size="small" icon={<CameraOutlined />}>
            Kiểm tra
          </Button>
        </Space>
      ),
    },
  ];

  const inspectionColumns = [
    {
      title: "Dự án",
      dataIndex: "projectTitle",
      key: "projectTitle",
    },
    {
      title: "Loại kiểm tra",
      dataIndex: "inspectionType",
      key: "inspectionType",
    },
    {
      title: "Ngày kiểm tra",
      dataIndex: "date",
      key: "date",
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const colors = {
          Completed: "success",
          "In Review": "processing",
          Scheduled: "warning",
        };
        return (
          <Tag color={colors[status as keyof typeof colors]}>{status}</Tag>
        );
      },
    },
    {
      title: "Phát hiện",
      dataIndex: "findings",
      key: "findings",
      render: (findings: number, record: any) => (
        <Badge count={findings} showZero>
          <Tag
            color={
              record.severity === "High"
                ? "red"
                : record.severity === "Medium"
                ? "orange"
                : "green"
            }
          >
            {record.severity}
          </Tag>
        </Badge>
      ),
    },
  ];

  return (
    <div className={styles.supervisorDashboard}>
      {/* Header */}
      <div className={`${styles.dashboardHeader} supervisor-header`}>
        <div className={styles.headerContent}>
          <div>
            <Title level={2} className={styles.pageTitle}>
              Dashboard Giám sát viên
            </Title>
            <Text className={styles.pageSubtitle}>
              Giám sát chất lượng và an toàn công trình
            </Text>
          </div>
          <div className={styles.headerActions}>
            <Button icon={<FileTextOutlined />}>Báo cáo mới</Button>
            <Button type="primary" icon={<CameraOutlined />}>
              Kiểm tra hiện trường
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[24, 24]} className={styles.statsSection}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            className={`${styles.statCard} supervisor-stat-card`}
            loading={loading}
          >
            <Statistic
              title="Dự án đang giám sát"
              value={mockStats.activeProjects}
              valueStyle={{ color: "#1890ff" }}
              prefix={<SafetyCertificateOutlined />}
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
            className={`${styles.statCard} supervisor-stat-card`}
            loading={loading}
          >
            <Statistic
              title="Kiểm tra hoàn thành"
              value={mockStats.completedInspections}
              valueStyle={{ color: "#52c41a" }}
              prefix={<CheckCircleOutlined />}
              suffix={
                <span className={styles.growthIndicator}>
                  <RiseOutlined style={{ color: "#52c41a" }} />
                  {mockStats.inspectionsGrowth}%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            className={`${styles.statCard} supervisor-stat-card`}
            loading={loading}
          >
            <Statistic
              title="Báo cáo chờ xử lý"
              value={mockStats.pendingReports}
              valueStyle={{ color: "#faad14" }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            className={`${styles.statCard} supervisor-stat-card`}
            loading={loading}
          >
            <Statistic
              title="Vi phạm an toàn"
              value={mockStats.safetyViolations}
              valueStyle={{ color: "#ff4d4f" }}
              prefix={<ExclamationCircleOutlined />}
              suffix={
                <span className={styles.growthIndicator}>
                  <RiseOutlined
                    style={{
                      color: "#52c41a",
                      transform: "rotate(180deg)",
                    }}
                  />
                  {Math.abs(mockStats.violationsChange)}%
                </span>
              }
            />
          </Card>
        </Col>
      </Row>

      {/* Safety Alert */}
      <div className={`${styles.alertSection} supervisor-content`}>
        <Alert
          message="Cảnh báo an toàn"
          description="Dự án 'Nhà cấp 4' có mức độ rủi ro cao. Cần kiểm tra đặc biệt vào ngày 22/01."
          type="warning"
          showIcon
          action={
            <Button size="small" type="primary">
              Xem chi tiết
            </Button>
          }
        />
      </div>

      {/* Main Content Tabs */}
      <div className={`${styles.mainContent} supervisor-content`}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
          <TabPane tab="Tổng quan" key="overview">
            <Row gutter={[24, 24]}>
              <Col xs={24} xl={16}>
                <Card
                  title="Dự án đang giám sát"
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
                <Card title="Lịch kiểm tra" className={styles.contentCard}>
                  <Timeline>
                    <Timeline.Item color="blue" dot={<CalendarOutlined />}>
                      <div>
                        <strong>18/01 - Villa 2 tầng</strong>
                        <br />
                        <Text type="secondary">Kiểm tra nền móng</Text>
                      </div>
                    </Timeline.Item>
                    <Timeline.Item color="orange" dot={<ClockCircleOutlined />}>
                      <div>
                        <strong>20/01 - Nhà phố 3 tầng</strong>
                        <br />
                        <Text type="secondary">An toàn lao động</Text>
                      </div>
                    </Timeline.Item>
                    <Timeline.Item color="red" dot={<AlertOutlined />}>
                      <div>
                        <strong>22/01 - Nhà cấp 4</strong>
                        <br />
                        <Text type="secondary">Kiểm tra đặc biệt</Text>
                      </div>
                    </Timeline.Item>
                  </Timeline>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Kiểm tra & Báo cáo" key="inspections">
            <Row gutter={[24, 24]}>
              <Col xs={24}>
                <Card
                  title="Lịch sử kiểm tra"
                  className={styles.contentCard}
                  extra={
                    <Space>
                      <Button icon={<UploadOutlined />}>Tải báo cáo</Button>
                      <Button type="primary" icon={<FileTextOutlined />}>
                        Tạo báo cáo mới
                      </Button>
                    </Space>
                  }
                >
                  <Table
                    columns={inspectionColumns}
                    dataSource={mockInspections}
                    pagination={{ pageSize: 10 }}
                    rowKey="id"
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Lịch làm việc" key="calendar">
            <Card
              title="Lịch kiểm tra tháng này"
              className={styles.contentCard}
            >
              <Calendar
                mode="month"
                dateCellRender={(value) => {
                  const dateStr = value.format("YYYY-MM-DD");
                  if (dateStr === "2024-01-18") {
                    return <Badge status="processing" text="Villa kiểm tra" />;
                  }
                  if (dateStr === "2024-01-20") {
                    return <Badge status="warning" text="Nhà phố kiểm tra" />;
                  }
                  if (dateStr === "2024-01-22") {
                    return <Badge status="error" text="Kiểm tra đặc biệt" />;
                  }
                  return null;
                }}
              />
            </Card>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default SupervisorDashboard;
