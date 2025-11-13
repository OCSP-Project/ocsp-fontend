"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  Card,
  Input,
  Select,
  Button,
  Tag,
  Space,
  Typography,
  Row,
  Col,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  ReloadOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import RoleBasedRoute from "@/components/shared/RoleBasedRoute";
import { UserRole } from "@/hooks/useAuth";
import { adminApi, type AdminProjectListDto } from "@/lib/admin/admin.api";
import styles from "./AdminProjects.module.scss";

const { Title, Text } = Typography;
const { Option } = Select;

const AdminProjectsPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<AdminProjectListDto[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(
    undefined
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAllProjects(
        searchText || undefined,
        selectedStatus,
        currentPage,
        pageSize
      );
      setProjects(data);
    } catch (error: any) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [currentPage, pageSize, selectedStatus]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchProjects();
  };

  const handleClearFilters = () => {
    setSearchText("");
    setSelectedStatus(undefined);
    setCurrentPage(1);
  };

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string }> = {
      Draft: { label: "Nháp", color: "default" },
      Active: { label: "Đang hoạt động", color: "success" },
      Completed: { label: "Hoàn thành", color: "processing" },
      OnHold: { label: "Tạm dừng", color: "warning" },
    };

    const config = statusConfig[status] || {
      label: status,
      color: "default",
    };
    return <Tag color={config.color}>{config.label}</Tag>;
  };

  const columns = [
    {
      title: "Tên dự án",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: AdminProjectListDto) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>{text}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.address}
          </Text>
        </div>
      ),
      width: 250,
    },
    {
      title: "Chủ nhà",
      dataIndex: "homeownerName",
      key: "homeownerName",
      width: 120,
    },
    {
      title: "Thầu",
      dataIndex: "contractorName",
      key: "contractorName",
      render: (text: string | null) => text || "-",
      width: 120,
    },
    {
      title: "Giám sát",
      dataIndex: "supervisorName",
      key: "supervisorName",
      render: (text: string | null) => text || "-",
      width: 120,
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
      width: 150,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => getStatusTag(status),
      width: 130,
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
      width: 120,
    },
    {
      title: "Hành động",
      key: "actions",
      fixed: "right" as const,
      width: 120,
      render: (_: any, record: AdminProjectListDto) => (
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
      <div className={styles.adminProjectsPage}>
        <Card>
          {/* Description */}
          <div style={{ marginBottom: 24 }}>
            <Text type="secondary">
              Quản lý và theo dõi tất cả các dự án trong hệ thống
            </Text>
          </div>

          {/* Filters */}
          <Card
            size="small"
            style={{ marginBottom: 16, backgroundColor: "#fafafa" }}
          >
            <Row gutter={16} align="middle">
              <Col flex="auto">
                <Input
                  placeholder="Tìm kiếm theo tên, địa chỉ, chủ nhà, thầu..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onPressEnter={handleSearch}
                  allowClear
                />
              </Col>
              <Col>
                <Select
                  placeholder="Lọc theo trạng thái"
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                  allowClear
                  style={{ width: 200 }}
                >
                  <Option value="Draft">Nháp</Option>
                  <Option value="Active">Đang hoạt động</Option>
                  <Option value="Completed">Hoàn thành</Option>
                  <Option value="OnHold">Tạm dừng</Option>
                </Select>
              </Col>
              <Col>
                <Space>
                  <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    onClick={handleSearch}
                    loading={loading}
                  >
                    Tìm kiếm
                  </Button>
                  <Button
                    icon={<FilterOutlined />}
                    onClick={handleClearFilters}
                  >
                    Xóa bộ lọc
                  </Button>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={fetchProjects}
                    loading={loading}
                  >
                    Làm mới
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Projects Table */}
          <Table
            columns={columns}
            dataSource={projects}
            rowKey="id"
            loading={loading}
            scroll={{ x: 1200 }}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: projects.length, // Note: Backend should return total count for proper pagination
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} dự án`,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
            }}
            locale={{
              emptyText: "Không có dự án nào",
            }}
          />
        </Card>
      </div>
    </RoleBasedRoute>
  );
};

export default AdminProjectsPage;

