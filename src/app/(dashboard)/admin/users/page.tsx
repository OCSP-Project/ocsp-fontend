"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Table,
  Tag,
  Space,
  Modal,
  message,
  Popconfirm,
  Typography,
  Row,
  Col,
  Switch,
  Divider,
  DatePicker,
  Tabs,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import locale from "antd/locale/vi_VN";
import {
  UserOutlined,
  PlusOutlined,
  DeleteOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  SearchOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { adminApi, type CreateUserDto, type UserDto, type UserProjectInfo } from "@/lib/admin/admin.api";
import { registrationApi, type RegistrationRequestDto, type ApproveRegistrationRequestDto, type RejectRegistrationRequestDto } from "@/lib/registration/registration.api";
import { UserRole } from "@/hooks/useAuth";
import RoleBasedRoute from "@/components/shared/RoleBasedRoute";
import { usePendingRegistrationRequests } from "@/hooks/usePendingRegistrationRequests";
import styles from "./UsersManagement.module.scss";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { TextArea } = Input;

const UsersManagementPage: React.FC = () => {
  const [form] = Form.useForm();
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
  
  // Filter states
  const [searchText, setSearchText] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<number | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  
  // Registration requests states
  const [registrationRequests, setRegistrationRequests] = useState<RegistrationRequestDto[]>([]);
  const [registrationRequestsLoading, setRegistrationRequestsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("users");
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RegistrationRequestDto | null>(null);
  const [approveForm] = Form.useForm();
  const [rejectForm] = Form.useForm();

  // Get pending requests count from hook (for sidebar badge)
  const { pendingCount: pendingRequestsCount, refresh: refreshPendingCount } = usePendingRegistrationRequests();

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
    if (activeTab === "requests") {
      fetchRegistrationRequests();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAllUsers();
      // Sort: Admin accounts always first, then by CreatedAt descending
      const sortedData = [...data].sort((a, b) => {
        // Admin always comes first
        if (a.role === UserRole.Admin && b.role !== UserRole.Admin) return -1;
        if (a.role !== UserRole.Admin && b.role === UserRole.Admin) return 1;
        // If both are admin or both are not admin, sort by CreatedAt descending
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setUsers(sortedData);
    } catch (error: any) {
      console.error("Failed to fetch users:", error);
      message.error(
        error?.response?.data?.message || "Không thể tải danh sách người dùng"
      );
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on filters
  const filteredUsers = React.useMemo(() => {
    let result = [...users];

    // Filter by search text (username)
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase().trim();
      result = result.filter(
        (user) =>
          user.username.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
      );
    }

    // Filter by role
    if (selectedRole !== undefined) {
      result = result.filter((user) => user.role === selectedRole);
    }

    // Filter by date range
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].startOf('day');
      const endDate = dateRange[1].endOf('day');
      result = result.filter((user) => {
        const userCreatedAt = dayjs(user.createdAt);
        return userCreatedAt.isAfter(startDate) && userCreatedAt.isBefore(endDate) ||
               userCreatedAt.isSame(startDate) || userCreatedAt.isSame(endDate);
      });
    }

    return result;
  }, [users, searchText, selectedRole, dateRange]);

  const handleClearFilters = () => {
    setSearchText("");
    setSelectedRole(undefined);
    setDateRange(null);
  };

  const handleCreateUser = async (values: CreateUserDto) => {
    try {
      setSubmitting(true);
      const newUser = await adminApi.createUser(values);
      message.success("Tạo người dùng thành công!");
      setIsModalVisible(false);
      form.resetFields();
      fetchUsers(); // Refresh list
    } catch (error: any) {
      console.error("Failed to create user:", error);
      message.error(
        error?.response?.data?.message || "Không thể tạo người dùng"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await adminApi.deleteUser(userId);
      message.success("Xóa người dùng thành công!");
      fetchUsers(); // Refresh list
    } catch (error: any) {
      console.error("Failed to delete user:", error);
      message.error(
        error?.response?.data?.message || "Không thể xóa người dùng"
      );
    }
  };

  const getRoleTag = (role: number) => {
    const roles = {
      0: { label: "Admin", color: "red" },
      1: { label: "Supervisor", color: "orange" },
      2: { label: "Contractor", color: "blue" },
      3: { label: "Homeowner", color: "green" },
    };
    const roleInfo = roles[role as keyof typeof roles] || {
      label: "Unknown",
      color: "default",
    };
    return <Tag color={roleInfo.color}>{roleInfo.label}</Tag>;
  };

  const handleViewProfile = (user: UserDto) => {
    setSelectedUser(user);
    setProfileModalVisible(true);
  };

  const fetchRegistrationRequests = async () => {
    try {
      setRegistrationRequestsLoading(true);
      const data = await registrationApi.getAll();
      setRegistrationRequests(data);
      // Refresh pending count in sidebar
      refreshPendingCount();
    } catch (error: any) {
      console.error("Failed to fetch registration requests:", error);
      message.error(
        error?.response?.data?.message || "Không thể tải danh sách yêu cầu đăng ký"
      );
    } finally {
      setRegistrationRequestsLoading(false);
    }
  };

  const handleApprove = async (values: ApproveRegistrationRequestDto) => {
    if (!selectedRequest) return;
    
    try {
      setSubmitting(true);
      await registrationApi.approve(selectedRequest.id, values);
      message.success("Đã phê duyệt yêu cầu đăng ký và tạo tài khoản thành công!");
      setApproveModalVisible(false);
      approveForm.resetFields();
      setSelectedRequest(null);
      fetchRegistrationRequests();
      fetchUsers(); // Refresh users list
      refreshPendingCount(); // Refresh sidebar badge
    } catch (error: any) {
      console.error("Failed to approve registration request:", error);
      message.error(
        error?.response?.data?.message || "Không thể phê duyệt yêu cầu đăng ký"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (values: RejectRegistrationRequestDto) => {
    if (!selectedRequest) return;
    
    try {
      setSubmitting(true);
      await registrationApi.reject(selectedRequest.id, values);
      message.success("Đã từ chối yêu cầu đăng ký!");
      setRejectModalVisible(false);
      rejectForm.resetFields();
      setSelectedRequest(null);
      fetchRegistrationRequests();
      refreshPendingCount(); // Refresh sidebar badge
    } catch (error: any) {
      console.error("Failed to reject registration request:", error);
      message.error(
        error?.response?.data?.message || "Không thể từ chối yêu cầu đăng ký"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getRequestStatusTag = (status: number) => {
    const statusMap = {
      0: { label: "Chờ xử lý", color: "orange" },
      1: { label: "Đã phê duyệt", color: "green" },
      2: { label: "Đã từ chối", color: "red" },
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || {
      label: "Unknown",
      color: "default",
    };
    return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>;
  };

  const registrationRequestColumns = [
    {
      title: "Thông tin",
      key: "info",
      render: (_: any, record: RegistrationRequestDto) => (
        <Space direction="vertical" size="small">
          <div>
            <Text strong>{record.username}</Text>
          </div>
          <div>
            <Text type="secondary">{record.email}</Text>
          </div>
          <div>
            <Text type="secondary">{record.phone}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Vai trò",
      dataIndex: "requestedRole",
      key: "requestedRole",
      render: (role: number) => (
        <Tag color={role === UserRole.Supervisor ? "orange" : "blue"}>
          {role === UserRole.Supervisor ? "Giám sát viên" : "Nhà thầu"}
        </Tag>
      ),
    },
    {
      title: "Thông tin bổ sung",
      key: "details",
      render: (_: any, record: RegistrationRequestDto) => {
        if (record.requestedRole === UserRole.Supervisor) {
          return (
            <Space direction="vertical" size="small">
              <div><Text type="secondary">Phòng ban: </Text>{record.department || "-"}</div>
              <div><Text type="secondary">Chức vụ: </Text>{record.position || "-"}</div>
              {record.district && <div><Text type="secondary">Quận: </Text>{record.district}</div>}
            </Space>
          );
        } else {
          return (
            <Space direction="vertical" size="small">
              <div><Text type="secondary">Công ty: </Text>{record.companyName || "-"}</div>
              <div><Text type="secondary">Giấy phép: </Text>{record.businessLicense || "-"}</div>
            </Space>
          );
        }
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: number) => getRequestStatusTag(status),
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
      render: (_: any, record: RegistrationRequestDto) => (
        <Space>
          {record.status === 0 && (
            <>
              <Button
                type="primary"
                size="small"
                onClick={() => {
                  setSelectedRequest(record);
                  setApproveModalVisible(true);
                }}
              >
                Phê duyệt
              </Button>
              <Button
                danger
                size="small"
                onClick={() => {
                  setSelectedRequest(record);
                  setRejectModalVisible(true);
                }}
              >
                Từ chối
              </Button>
            </>
          )}
          {record.status === 1 && record.createdUserId && (
            <Button
              type="link"
              size="small"
              onClick={() => {
                window.open(`/admin/users/${record.createdUserId}`, '_blank');
              }}
            >
              Xem tài khoản
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const columns = [
    {
      title: "Tên người dùng",
      dataIndex: "username",
      key: "username",
      render: (text: string, record: UserDto) => (
        <Space>
          <UserOutlined />
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            <div style={{ fontSize: "12px", color: "#666" }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role: number) => getRoleTag(role),
    },
    {
      title: "Email đã xác thực",
      dataIndex: "isEmailVerified",
      key: "isEmailVerified",
      render: (verified: boolean) =>
        verified ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Đã xác thực
          </Tag>
        ) : (
          <Tag icon={<CloseCircleOutlined />} color="default">
            Chưa xác thực
          </Tag>
        ),
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
      title: "Profile",
      key: "profile",
      render: (_: any, record: UserDto) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewProfile(record)}
        >
          Xem Profile
        </Button>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_: any, record: UserDto) => (
        <Space>
          <Popconfirm
            title="Xóa người dùng này?"
            description="Hành động này không thể hoàn tác."
            onConfirm={() => handleDeleteUser(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
              disabled={record.role === UserRole.Admin} // Không cho xóa admin
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <RoleBasedRoute allowedRoles={[UserRole.Admin]}>
      <div className={styles.usersManagement}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <Text type="secondary">
              Tạo và quản lý tài khoản người dùng trong hệ thống
            </Text>
          </div>
          <Space>
            {activeTab === "requests" && (
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchRegistrationRequests}
                loading={registrationRequestsLoading}
              >
                Làm mới
              </Button>
            )}
            {activeTab === "users" && (
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchUsers}
                loading={loading}
              >
                Làm mới
              </Button>
            )}
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalVisible(true)}
            >
              Tạo người dùng mới
            </Button>
          </Space>
        </div>

        {/* Filters */}
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            {/* Search Input */}
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder="Tìm kiếm theo tên hoặc email..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>

            {/* Role Filter */}
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="Lọc theo vai trò"
                style={{ width: "100%" }}
                value={selectedRole}
                onChange={setSelectedRole}
                allowClear
              >
                <Option value={UserRole.Admin}>Admin</Option>
                <Option value={UserRole.Supervisor}>Supervisor</Option>
                <Option value={UserRole.Contractor}>Contractor</Option>
                <Option value={UserRole.Homeowner}>Homeowner</Option>
              </Select>
            </Col>

            {/* Date Range Filter */}
            <Col xs={24} sm={12} md={8}>
              <RangePicker
                style={{ width: "100%" }}
                placeholder={["Từ ngày", "Đến ngày"]}
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null] | null)}
                format="DD/MM/YYYY"
              />
            </Col>

            {/* Clear Filters Button */}
            <Col xs={24} sm={12} md={2}>
              <Button
                icon={<FilterOutlined />}
                onClick={handleClearFilters}
                style={{ width: "100%" }}
              >
                Xóa bộ lọc
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Tabs */}
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Quản lý người dùng" key="users">
            {/* Users Table */}
            <Card>
              <Table
                columns={columns}
                dataSource={filteredUsers}
                rowKey="id"
                loading={loading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} của ${total} người dùng (${users.length} tổng)`,
                }}
              />
            </Card>
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                Yêu cầu đăng ký nhà thầu, giám sát viên
                {pendingRequestsCount > 0 && (
                  <Tag color="orange" style={{ marginLeft: 8 }}>
                    {pendingRequestsCount}
                  </Tag>
                )}
              </span>
            } 
            key="requests"
          >
            <Card>
              <Table
                columns={registrationRequestColumns}
                dataSource={registrationRequests}
                rowKey="id"
                loading={registrationRequestsLoading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} của ${total} yêu cầu`,
                }}
              />
            </Card>
          </TabPane>
        </Tabs>

        {/* Create User Modal */}
        <Modal
          title="Tạo người dùng mới"
          open={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            form.resetFields();
          }}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateUser}
            autoComplete="off"
          >
            <Form.Item
              label="Tên người dùng"
              name="username"
              rules={[
                { required: true, message: "Vui lòng nhập tên người dùng" },
                { min: 3, message: "Tên người dùng phải có ít nhất 3 ký tự" },
              ]}
            >
              <Input placeholder="username" prefix={<UserOutlined />} />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email" },
                { type: "email", message: "Email không hợp lệ" },
              ]}
            >
              <Input type="email" placeholder="user@example.com" />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu" },
                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
              ]}
            >
              <Input.Password placeholder="••••••" />
            </Form.Item>

            <Form.Item
              label="Vai trò"
              name="role"
              rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
            >
              <Select placeholder="Chọn vai trò">
                <Option value={UserRole.Admin}>Admin</Option>
                <Option value={UserRole.Supervisor}>Supervisor</Option>
                <Option value={UserRole.Contractor}>Contractor</Option>
                <Option value={UserRole.Homeowner}>Homeowner</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Bỏ qua xác thực email"
              name="skipEmailVerification"
              valuePropName="checked"
              initialValue={false}
            >
              <Switch />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  Tạo người dùng
                </Button>
                <Button
                  onClick={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                  }}
                >
                  Hủy
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Profile Modal */}
        <Modal
          title={`Profile - ${selectedUser?.username || ""}`}
          open={profileModalVisible}
          onCancel={() => {
            setProfileModalVisible(false);
            setSelectedUser(null);
          }}
          footer={[
            <Button
              key="close"
              onClick={() => {
                setProfileModalVisible(false);
                setSelectedUser(null);
              }}
            >
              Đóng
            </Button>,
          ]}
          width={800}
        >
          {selectedUser && (
            <div>
              <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col span={12}>
                  <Text strong>Email:</Text> {selectedUser.email}
                </Col>
                <Col span={12}>
                  <Text strong>Vai trò:</Text> {getRoleTag(selectedUser.role)}
                </Col>
                <Col span={12}>
                  <Text strong>Trạng thái email:</Text>{" "}
                  {selectedUser.isEmailVerified ? (
                    <Tag color="success">Đã xác thực</Tag>
                  ) : (
                    <Tag>Chưa xác thực</Tag>
                  )}
                </Col>
                <Col span={12}>
                  <Text strong>Ngày tạo:</Text>{" "}
                  {new Date(selectedUser.createdAt).toLocaleDateString("vi-VN")}
                </Col>
              </Row>

              <Divider>Dự án tham gia</Divider>

              {selectedUser.projects && selectedUser.projects.length > 0 ? (
                <Table
                  dataSource={selectedUser.projects}
                  rowKey="projectId"
                  pagination={false}
                  size="small"
                  onRow={(record) => ({
                    onClick: () => {
                      window.open(`/projects/${record.projectId}`, '_blank');
                    },
                    style: { cursor: 'pointer' },
                  })}
                  columns={[
                    {
                      title: "Tên dự án",
                      dataIndex: "projectName",
                      key: "projectName",
                      render: (text: string, record: any) => (
                        <Space>
                          <span style={{ fontWeight: 500 }}>{text}</span>
                          <Tag color="blue" style={{ margin: 0 }}>
                            Click để xem
                          </Tag>
                        </Space>
                      ),
                    },
                    {
                      title: "Vai trò",
                      dataIndex: "participationRole",
                      key: "participationRole",
                      render: (role: string) => (
                        <Tag color={role === "Homeowner" ? "green" : role === "Supervisor" ? "orange" : "blue"}>
                          {role}
                        </Tag>
                      ),
                    },
                    {
                      title: "Trạng thái",
                      dataIndex: "projectStatus",
                      key: "projectStatus",
                      render: (status: string) => {
                        const statusColors: Record<string, string> = {
                          Draft: "default",
                          Active: "success",
                          Completed: "processing",
                          OnHold: "warning",
                        };
                        return (
                          <Tag color={statusColors[status] || "default"}>
                            {status}
                          </Tag>
                        );
                      },
                    },
                    {
                      title: "Ngày tham gia",
                      dataIndex: "joinedAt",
                      key: "joinedAt",
                      render: (date: string | null) =>
                        date
                          ? new Date(date).toLocaleDateString("vi-VN")
                          : "-",
                    },
                  ]}
                />
              ) : (
                <div style={{ textAlign: "center", padding: "20px", color: "#999" }}>
                  <Text type="secondary">
                    Người dùng này chưa tham gia dự án nào
                  </Text>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Approve Registration Request Modal */}
        <Modal
          title="Phê duyệt yêu cầu đăng ký"
          open={approveModalVisible}
          onCancel={() => {
            setApproveModalVisible(false);
            approveForm.resetFields();
            setSelectedRequest(null);
          }}
          footer={null}
          width={500}
        >
          {selectedRequest && (
            <div style={{ marginBottom: 16 }}>
              <Text strong>Người đăng ký: </Text>
              <Text>{selectedRequest.username} ({selectedRequest.email})</Text>
              <br />
              <Text strong>Vai trò: </Text>
              <Text>{selectedRequest.requestedRole === UserRole.Supervisor ? "Giám sát viên" : "Nhà thầu"}</Text>
            </div>
          )}
          <Form
            form={approveForm}
            layout="vertical"
            onFinish={handleApprove}
            autoComplete="off"
          >
            <Form.Item
              label="Mật khẩu cho tài khoản"
              name="password"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu" },
                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
              ]}
            >
              <Input.Password placeholder="Mật khẩu sẽ được gửi qua email" />
            </Form.Item>

            <Form.Item
              label="Bỏ qua xác thực email"
              name="skipEmailVerification"
              valuePropName="checked"
              initialValue={false}
            >
              <Switch />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  Phê duyệt và tạo tài khoản
                </Button>
                <Button
                  onClick={() => {
                    setApproveModalVisible(false);
                    approveForm.resetFields();
                    setSelectedRequest(null);
                  }}
                >
                  Hủy
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Reject Registration Request Modal */}
        <Modal
          title="Từ chối yêu cầu đăng ký"
          open={rejectModalVisible}
          onCancel={() => {
            setRejectModalVisible(false);
            rejectForm.resetFields();
            setSelectedRequest(null);
          }}
          footer={null}
          width={500}
        >
          {selectedRequest && (
            <div style={{ marginBottom: 16 }}>
              <Text strong>Người đăng ký: </Text>
              <Text>{selectedRequest.username} ({selectedRequest.email})</Text>
            </div>
          )}
          <Form
            form={rejectForm}
            layout="vertical"
            onFinish={handleReject}
            autoComplete="off"
          >
            <Form.Item
              label="Lý do từ chối"
              name="rejectionReason"
              rules={[
                { required: true, message: "Vui lòng nhập lý do từ chối" },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Nhập lý do từ chối yêu cầu đăng ký..."
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" danger htmlType="submit" loading={submitting}>
                  Từ chối
                </Button>
                <Button
                  onClick={() => {
                    setRejectModalVisible(false);
                    rejectForm.resetFields();
                    setSelectedRequest(null);
                  }}
                >
                  Hủy
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </RoleBasedRoute>
  );
};

export default UsersManagementPage;
