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
  FileTextOutlined,
  FileSearchOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { gsap } from "gsap";
import RoleBasedRoute from "@/components/shared/RoleBasedRoute";
import { UserRole } from "@/hooks/useAuth";
import { adminApi, type AdminDashboardStatsDto, type RecentProjectDto, type RecentUserDto } from "@/lib/admin/admin.api";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminDashboardStatsDto | null>(null);
  const [recentProjects, setRecentProjects] = useState<RecentProjectDto[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUserDto[]>([]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const [statsData, projectsData, usersData] = await Promise.all([
        adminApi.getDashboardStats(),
        adminApi.getRecentProjects(10),
        adminApi.getRecentUsers(10)
      ]);
      setStats(statsData);
      setRecentProjects(projectsData);
      setRecentUsers(usersData);
    } catch (error: any) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();

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

  const getRoleTag = (role: number) => {
    const roles: Record<number, { label: string; color: string }> = {
      0: { label: "Admin", color: "red" },
      1: { label: "Supervisor", color: "orange" },
      2: { label: "Contractor", color: "blue" },
      3: { label: "Homeowner", color: "green" },
    };
    const roleInfo = roles[role] || {
      label: "Unknown",
      color: "default",
    };
    return <Tag color={roleInfo.color}>{roleInfo.label}</Tag>;
  };

  const userColumns = [
    {
      title: "Tên",
      dataIndex: "username",
      key: "username",
      render: (text: string, record: RecentUserDto) => (
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
      render: (role: number) => getRoleTag(role),
    },
    {
      title: "Trạng thái",
      dataIndex: "isEmailVerified",
      key: "isEmailVerified",
      render: (verified: boolean) => {
        return verified ? (
          <Tag color="success">Đã xác thực</Tag>
        ) : (
          <Tag color="default">Chưa xác thực</Tag>
        );
      },
    },
    {
      title: "Ngày tham gia",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) =>
        new Date(date).toLocaleDateString("vi-VN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_: any, record: RecentUserDto) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => router.push(`/admin/users`)}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  const projectColumns = [
    {
      title: "Dự án",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: RecentProjectDto) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            Chủ nhà: {record.homeownerName}
            {record.contractorName && ` • Thầu: ${record.contractorName}`}
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
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const statusColors: Record<string, string> = {
          Draft: "default",
          Active: "success",
          Completed: "processing",
          OnHold: "warning",
        };
        const statusLabels: Record<string, string> = {
          Draft: "Nháp",
          Active: "Đang hoạt động",
          Completed: "Hoàn thành",
          OnHold: "Tạm dừng",
        };
        return (
          <Tag color={statusColors[status] || "default"}>
            {statusLabels[status] || status}
          </Tag>
        );
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) =>
        new Date(date).toLocaleDateString("vi-VN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_: any, record: RecentProjectDto) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => router.push(`/projects/${record.id}`)}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <RoleBasedRoute allowedRoles={[UserRole.Admin]}>
      <div className={styles.adminDashboard}>
        {/* Header */}
        <div className={`${styles.dashboardHeader} dashboard-header`}>
          <div className={styles.headerContent}>
            <div>
              <Text className={styles.pageSubtitle}>
                Tổng quan hoạt động nền tảng OCSP Construction
              </Text>
            </div>
            <div className={styles.headerActions}>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchDashboardStats}
                loading={loading}
              >
                Làm mới
              </Button>
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
                value={stats?.totalUsers || 0}
                precision={0}
                valueStyle={{ color: "#1890ff" }}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className={`${styles.statCard} stat-card`} loading={loading}>
              <Statistic
                title="Tổng dự án"
                value={stats?.totalProjects || 0}
                precision={0}
                valueStyle={{ color: "#52c41a" }}
                prefix={<ProjectOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className={`${styles.statCard} stat-card`} loading={loading}>
              <Statistic
                title="Tổng giá trị giao dịch"
                value={stats?.totalTransactionValue || 0}
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
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className={`${styles.statCard} stat-card`} loading={loading}>
              <Statistic
                title="Tiền hoa hồng"
                value={stats?.totalCommission || 0}
                precision={0}
                valueStyle={{ color: "#722ed1" }}
                prefix={<DollarOutlined />}
                formatter={(value) =>
                  new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                    notation: "compact",
                  }).format(Number(value))
                }
              />
            </Card>
          </Col>
          
          {/* Additional Stats Row */}
          <Col xs={24} sm={12} lg={6}>
            <Card className={`${styles.statCard} stat-card`} loading={loading}>
              <Statistic
                title="Tổng đề xuất (Proposals)"
                value={stats?.totalProposals || 0}
                precision={0}
                valueStyle={{ color: "#13c2c2" }}
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className={`${styles.statCard} stat-card`} loading={loading}>
              <Statistic
                title="Yêu cầu báo giá"
                value={stats?.totalQuoteRequests || 0}
                precision={0}
                valueStyle={{ color: "#eb2f96" }}
                prefix={<FileSearchOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className={`${styles.statCard} stat-card`} loading={loading}>
              <Statistic
                title="Tổng hợp đồng"
                value={stats?.totalContracts || 0}
                precision={0}
                valueStyle={{ color: "#fa8c16" }}
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className={`${styles.statCard} stat-card`} loading={loading}>
              <Statistic
                title="Dự án đang hoạt động"
                value={stats?.activeProjects || 0}
                precision={0}
                valueStyle={{ color: "#52c41a" }}
                prefix={<ProjectOutlined />}
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
              extra={
                <Button type="link" onClick={() => router.push('/admin/users')}>
                  Xem tất cả
                </Button>
              }
              loading={loading}
            >
              <Table
                columns={userColumns}
                dataSource={recentUsers}
                pagination={false}
                rowKey="id"
                size="small"
                locale={{
                  emptyText: "Chưa có người dùng nào",
                }}
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
                  onClick={() => router.push('/admin/users')}
                >
                  Quản lý người dùng
                </Button>
                <Button
                  size="large"
                  block
                  icon={<ProjectOutlined />}
                  className={styles.actionButton}
                  onClick={() => router.push('/admin/projects')}
                >
                  Quản lý dự án
                </Button>
                <Button
                  size="large"
                  block
                  icon={<DollarOutlined />}
                  className={styles.actionButton}
                  onClick={() => router.push('/admin/reports')}
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
              extra={
                <Button type="link" onClick={() => router.push('/admin/projects')}>
                  Xem tất cả
                </Button>
              }
              loading={loading}
            >
              <Table
                columns={projectColumns}
                dataSource={recentProjects}
                pagination={false}
                rowKey="id"
                locale={{
                  emptyText: "Chưa có dự án nào",
                }}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </RoleBasedRoute>
  );
};

export default AdminDashboard;
