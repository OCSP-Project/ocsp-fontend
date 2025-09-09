// src/app/dashboard/admin/page.tsx
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
  Dropdown,
  Menu,
  Avatar,
  Typography,
  Space,
  Divider,
  Alert,
} from "antd";
import {
  UserOutlined,
  ProjectOutlined,
  DollarOutlined,
  WarningOutlined,
  RiseOutlined,
  SettingOutlined,
  BellOutlined,
  ExportOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { gsap } from "gsap";
import RoleBasedRoute from "@/components/shared/RoleBasedRoute";
import { UserRole } from "@/hooks/useAuth";
import styles from "./AdminDashboard.module.scss";

const { Title, Text } = Typography;

// Mock data for demonstration
const mockStats = {
  totalUsers: 2847,
  totalProjects: 1239,
  totalRevenue: 2890000000,
  activeDisputes: 12,
  userGrowth: 23.5,
  projectGrowth: 18.7,
  revenueGrowth: 31.2,
  disputeChange: -8.3,
};

const mockRecentUsers = [
  {
    id: 1,
    name: "Nguyễn Văn An",
    email: "an@email.com",
    role: "Homeowner",
    status: "Active",
    joinDate: "2024-01-15",
  },
  {
    id: 2,
    name: "Trần Thị Bình",
    email: "binh@email.com",
    role: "Contractor",
    status: "Pending",
    joinDate: "2024-01-14",
  },
  {
    id: 3,
    name: "Lê Văn Cường",
    email: "cuong@email.com",
    role: "Supervisor",
    status: "Active",
    joinDate: "2024-01-13",
  },
  {
    id: 4,
    name: "Phạm Thị Dung",
    email: "dung@email.com",
    role: "Homeowner",
    status: "Suspended",
    joinDate: "2024-01-12",
  },
];

const mockRecentProjects = [
  {
    id: 1,
    title: "Nhà phố 3 tầng",
    homeowner: "Nguyễn Văn An",
    contractor: "Công ty ABC",
    budget: 2500000000,
    status: "In Progress",
    completion: 65,
  },
  {
    id: 2,
    title: "Villa 2 tầng",
    homeowner: "Trần Thị Bình",
    contractor: "Công ty XYZ",
    budget: 4200000000,
    status: "Planning",
    completion: 15,
  },
  {
    id: 3,
    title: "Nhà cấp 4",
    homeowner: "Lê Văn Cường",
    contractor: "Thầu DEF",
    budget: 1800000000,
    status: "Completed",
    completion: 100,
  },
];

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);

    // GSAP Animations
    gsap.fromTo(
      ".dashboard-header",
      { opacity: 0, y: -30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
    );

    gsap.fromTo(
      ".stat-card",
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
      ".content-section",
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

  const userColumns = [
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: any) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              {record.email}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role: string) => {
        const colors = {
          Homeowner: "green",
          Contractor: "blue",
          Supervisor: "orange",
          Admin: "red",
        };
        return <Tag color={colors[role as keyof typeof colors]}>{role}</Tag>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const colors = {
          Active: "success",
          Pending: "warning",
          Suspended: "error",
        };
        return (
          <Tag color={colors[status as keyof typeof colors]}>{status}</Tag>
        );
      },
    },
    {
      title: "Ngày tham gia",
      dataIndex: "joinDate",
      key: "joinDate",
    },
    {
      title: "Hành động",
      key: "actions",
      render: (record: any) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item icon={<EyeOutlined />}>Xem chi tiết</Menu.Item>
              <Menu.Item icon={<EditOutlined />}>Chỉnh sửa</Menu.Item>
              <Menu.Divider />
              <Menu.Item icon={<DeleteOutlined />} danger>
                Vô hiệu hóa
              </Menu.Item>
            </Menu>
          }
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const projectColumns = [
    {
      title: "Dự án",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: any) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            {record.homeowner} • {record.contractor}
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
          }).format(budget)}
        </Text>
      ),
    },
    {
      title: "Tiến độ",
      dataIndex: "completion",
      key: "completion",
      render: (completion: number) => (
        <Progress percent={completion} size="small" />
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const colors = {
          Planning: "processing",
          "In Progress": "success",
          Completed: "default",
          "On Hold": "warning",
        };
        return (
          <Tag color={colors[status as keyof typeof colors]}>{status}</Tag>
        );
      },
    },
  ];

  return (
    <RoleBasedRoute allowedRoles={[UserRole.Admin]}>
      <div className={styles.adminDashboard}>
        {/* Header */}
        <div className={`${styles.dashboardHeader} dashboard-header`}>
          <div className={styles.headerContent}>
            <div>
              <Title level={2} className={styles.pageTitle}>
                Dashboard Quản trị viên
              </Title>
              <Text className={styles.pageSubtitle}>
                Tổng quan hoạt động nền tảng OCSP Construction
              </Text>
            </div>
            <div className={styles.headerActions}>
              <Button
                icon={<BellOutlined />}
                className={styles.notificationBtn}
              >
                Thông báo
              </Button>
              <Button type="primary" icon={<ExportOutlined />}>
                Xuất báo cáo
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[24, 24]} className={styles.statsSection}>
          <Col xs={24} sm={12} lg={6}>
            <Card className={`${styles.statCard} stat-card`} loading={loading}>
              <Statistic
                title="Tổng người dùng"
                value={mockStats.totalUsers}
                precision={0}
                valueStyle={{ color: "#1890ff" }}
                prefix={<UserOutlined />}
                suffix={
                  <span className={styles.growthIndicator}>
                    <RiseOutlined style={{ color: "#52c41a" }} />
                    {mockStats.userGrowth}%
                  </span>
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className={`${styles.statCard} stat-card`} loading={loading}>
              <Statistic
                title="Tổng dự án"
                value={mockStats.totalProjects}
                precision={0}
                valueStyle={{ color: "#52c41a" }}
                prefix={<ProjectOutlined />}
                suffix={
                  <span className={styles.growthIndicator}>
                    <RiseOutlined style={{ color: "#52c41a" }} />
                    {mockStats.projectGrowth}%
                  </span>
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className={`${styles.statCard} stat-card`} loading={loading}>
              <Statistic
                title="Doanh thu tháng"
                value={mockStats.totalRevenue}
                precision={0}
                valueStyle={{ color: "#faad14" }}
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
            <Card className={`${styles.statCard} stat-card`} loading={loading}>
              <Statistic
                title="Tranh chấp"
                value={mockStats.activeDisputes}
                precision={0}
                valueStyle={{ color: "#ff4d4f" }}
                prefix={<WarningOutlined />}
                suffix={
                  <span className={styles.growthIndicator}>
                    <RiseOutlined
                      style={{
                        color:
                          mockStats.disputeChange > 0 ? "#ff4d4f" : "#52c41a",
                        transform:
                          mockStats.disputeChange < 0
                            ? "rotate(180deg)"
                            : "none",
                      }}
                    />
                    {Math.abs(mockStats.disputeChange)}%
                  </span>
                }
              />
            </Card>
          </Col>
        </Row>

        {/* System Alerts */}
        <div className={`${styles.alertSection} content-section`}>
          <Alert
            message="Hệ thống hoạt động ổn định"
            description="Tất cả dịch vụ đang hoạt động bình thường. Uptime: 99.9% | Phản hồi trung bình: 150ms"
            type="success"
            showIcon
            style={{ marginBottom: 24 }}
          />
        </div>

        {/* Content Sections */}
        <Row gutter={[24, 24]}>
          {/* Recent Users */}
          <Col xs={24} xl={14}>
            <Card
              title="Người dùng mới nhất"
              className={`${styles.contentCard} content-section`}
              extra={<Button type="link">Xem tất cả</Button>}
            >
              <Table
                columns={userColumns}
                dataSource={mockRecentUsers}
                pagination={false}
                rowKey="id"
                size="small"
              />
            </Card>
          </Col>

          {/* Quick Actions */}
          <Col xs={24} xl={10}>
            <Card
              title="Thao tác nhanh"
              className={`${styles.contentCard} content-section`}
            >
              <div className={styles.quickActions}>
                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<UserOutlined />}
                  className={styles.actionButton}
                >
                  Quản lý người dùng
                </Button>
                <Button
                  size="large"
                  block
                  icon={<ProjectOutlined />}
                  className={styles.actionButton}
                >
                  Quản lý dự án
                </Button>
                <Button
                  size="large"
                  block
                  icon={<DollarOutlined />}
                  className={styles.actionButton}
                >
                  Báo cáo tài chính
                </Button>
                <Button
                  size="large"
                  block
                  icon={<SettingOutlined />}
                  className={styles.actionButton}
                >
                  Cấu hình hệ thống
                </Button>
              </div>
            </Card>
          </Col>

          {/* Recent Projects */}
          <Col xs={24}>
            <Card
              title="Dự án gần đây"
              className={`${styles.contentCard} content-section`}
              extra={<Button type="link">Xem tất cả</Button>}
            >
              <Table
                columns={projectColumns}
                dataSource={mockRecentProjects}
                pagination={false}
                rowKey="id"
              />
            </Card>
          </Col>
        </Row>
      </div>
    </RoleBasedRoute>
  );
};

export default AdminDashboard;
