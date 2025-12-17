"use client";

import React, { useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  message,
  Space,
  Typography,
  Divider,
  InputNumber,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
  BankOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  FileTextOutlined,
  DollarOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { UserRole } from "@/hooks/useAuth";
import {
  registrationApi,
  type SubmitRegistrationRequestDto,
} from "@/lib/registration/registration.api";
import styles from "./ContactPage.module.scss";

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ContactPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<number | undefined>(
    undefined
  );

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      // Build DTO with only relevant fields based on selected role
      const dto: SubmitRegistrationRequestDto = {
        username: values.username,
        email: values.email,
        phone: values.phone,
        requestedRole: values.requestedRole,
      };

      console.log("Form values:", values);
      console.log("Selected role:", values.requestedRole);

      // Add Supervisor-specific fields
      if (values.requestedRole === UserRole.Supervisor) {
        // Required fields (always send)
        dto.department = values.department;
        dto.position = values.position;
        // Optional fields
        if (values.district) dto.district = values.district;
        if (values.minRate !== undefined && values.minRate !== null)
          dto.minRate = Number(values.minRate);
        if (values.maxRate !== undefined && values.maxRate !== null)
          dto.maxRate = Number(values.maxRate);
      }

      // Add Contractor-specific fields
      if (values.requestedRole === UserRole.Contractor) {
        // Required fields (always send)
        dto.companyName = values.companyName;
        // Optional fields
        if (values.address) dto.address = values.address;
        if (values.city) dto.city = values.city;
        if (values.province) dto.province = values.province;
        if (
          values.yearsOfExperience !== undefined &&
          values.yearsOfExperience !== null
        ) {
          dto.yearsOfExperience = Number(values.yearsOfExperience);
        }
        if (values.teamSize !== undefined && values.teamSize !== null) {
          dto.teamSize = Number(values.teamSize);
        }
        if (
          values.completedProjects !== undefined &&
          values.completedProjects !== null
        ) {
          dto.completedProjects = Number(values.completedProjects);
        }
        if (
          values.minProjectBudget !== undefined &&
          values.minProjectBudget !== null
        ) {
          dto.minProjectBudget = Number(values.minProjectBudget);
        }
        if (
          values.maxProjectBudget !== undefined &&
          values.maxProjectBudget !== null
        ) {
          dto.maxProjectBudget = Number(values.maxProjectBudget);
        }
      }

      // Remove null values from DTO (InputNumber sets null when empty)
      Object.keys(dto).forEach((key) => {
        if (dto[key as keyof typeof dto] === null) {
          delete dto[key as keyof typeof dto];
        }
      });

      console.log("DTO being sent:", dto);
      console.log("DTO JSON:", JSON.stringify(dto, null, 2));

      await registrationApi.submit(dto);
      message.success(
        "Yêu cầu đăng ký đã được gửi thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất có thể."
      );
      form.resetFields();
      setSelectedRole(undefined);
    } catch (error: any) {
      console.error("Failed to submit registration request:", error);
      console.error("Error response:", error?.response);
      console.error("Error data:", error?.response?.data);
      console.error("Validation errors:", error?.response?.data?.errors);

      // Display validation errors if available
      const validationErrors = error?.response?.data?.errors;
      if (validationErrors) {
        const errorMessages = Object.entries(validationErrors)
          .map(
            ([field, messages]) =>
              `${field}: ${(messages as string[]).join(", ")}`
          )
          .join("\n");
        message.error(`Validation errors:\n${errorMessages}`);
      } else {
        message.error(
          error?.response?.data?.message ||
            error?.response?.data?.title ||
            "Không thể gửi yêu cầu đăng ký. Vui lòng thử lại sau."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (value: number) => {
    setSelectedRole(value);
    // Reset role-specific fields when role changes
    form.setFieldsValue({
      department: undefined,
      position: undefined,
      district: undefined,
      minRate: undefined,
      maxRate: undefined,
      companyName: undefined,
      address: undefined,
      city: undefined,
      province: undefined,
      yearsOfExperience: undefined,
      teamSize: undefined,
      completedProjects: undefined,
      minProjectBudget: undefined,
      maxProjectBudget: undefined,
    });
  };

  return (
    <div className={styles.contactPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>ĐĂNG KÝ NHÀ THẦU / GIÁM SÁT VIÊN</h1>
          <Text type="secondary" className={styles.subtitle}>
            Điền thông tin bên dưới để đăng ký tài khoản nhà thầu hoặc giám sát
            viên trên nền tảng OCSP
          </Text>
        </div>

        <Card className={styles.formCard}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
            size="large"
          >
            {/* Basic Information */}
            <div className={styles.sectionHeader}>
              <div className={styles.sectionIcon}>
                <IdcardOutlined />
              </div>
              <h2 className={styles.sectionTitle}>Thông tin cơ bản</h2>
            </div>

            <Form.Item
              label="Vai trò đăng ký"
              name="requestedRole"
              rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
              className={styles.formItem}
            >
              <Select
                placeholder="Chọn vai trò"
                onChange={handleRoleChange}
                suffixIcon={<IdcardOutlined />}
              >
                <Option value={UserRole.Supervisor}>Giám sát viên</Option>
                <Option value={UserRole.Contractor}>Nhà thầu</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Tên người dùng"
              name="username"
              rules={[
                { required: true, message: "Vui lòng nhập tên người dùng" },
                { min: 3, message: "Tên người dùng phải có ít nhất 3 ký tự" },
              ]}
              className={styles.formItem}
            >
              <Input
                placeholder="Nhập tên người dùng"
                prefix={<UserOutlined className={styles.inputIcon} />}
              />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email" },
                { type: "email", message: "Email không hợp lệ" },
              ]}
              className={styles.formItem}
            >
              <Input
                type="email"
                placeholder="user@example.com"
                prefix={<MailOutlined className={styles.inputIcon} />}
              />
            </Form.Item>

            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại" },
                {
                  pattern: /^[0-9]{10,11}$/,
                  message: "Số điện thoại không hợp lệ",
                },
              ]}
              className={styles.formItem}
            >
              <Input
                placeholder="0123456789"
                prefix={<PhoneOutlined className={styles.inputIcon} />}
              />
            </Form.Item>

            {/* Supervisor Fields */}
            {selectedRole === UserRole.Supervisor && (
              <div className={styles.formSection}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionIcon}>
                    <UserOutlined />
                  </div>
                  <h2 className={styles.sectionTitle}>
                    Thông tin giám sát viên
                  </h2>
                </div>

                <Form.Item
                  label="Phòng ban"
                  name="department"
                  rules={[
                    { required: true, message: "Vui lòng nhập phòng ban" },
                  ]}
                  className={styles.formItem}
                >
                  <Input
                    placeholder="Ví dụ: Phòng Kỹ thuật"
                    prefix={<BankOutlined className={styles.inputIcon} />}
                  />
                </Form.Item>

                <Form.Item
                  label="Chức vụ"
                  name="position"
                  rules={[{ required: true, message: "Vui lòng nhập chức vụ" }]}
                  className={styles.formItem}
                >
                  <Input
                    placeholder="Ví dụ: Giám sát viên công trình"
                    prefix={<IdcardOutlined className={styles.inputIcon} />}
                  />
                </Form.Item>

                <Form.Item
                  label="Quận/Huyện"
                  name="district"
                  className={styles.formItem}
                >
                  <Input
                    placeholder="Ví dụ: Hải Châu, Thanh Khê"
                    prefix={
                      <EnvironmentOutlined className={styles.inputIcon} />
                    }
                  />
                </Form.Item>
              </div>
            )}

            {/* Contractor Fields */}
            {selectedRole === UserRole.Contractor && (
              <div className={styles.formSection}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionIcon}>
                    <BankOutlined />
                  </div>
                  <h2 className={styles.sectionTitle}>Thông tin nhà thầu</h2>
                </div>

                <Form.Item
                  label="Tên công ty"
                  name="companyName"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên công ty" },
                  ]}
                  className={styles.formItem}
                >
                  <Input
                    placeholder="Tên công ty"
                    prefix={<BankOutlined className={styles.inputIcon} />}
                  />
                </Form.Item>

                <Form.Item
                  label="Địa chỉ"
                  name="address"
                  className={styles.formItem}
                >
                  <Input
                    placeholder="Địa chỉ công ty"
                    prefix={
                      <EnvironmentOutlined className={styles.inputIcon} />
                    }
                  />
                </Form.Item>

                <Space direction="horizontal" style={{ width: "100%" }}>
                  <Form.Item
                    label="Thành phố"
                    name="city"
                    className={styles.formItem}
                  >
                    <Input
                      placeholder="Ví dụ: Đà Nẵng"
                      prefix={
                        <EnvironmentOutlined className={styles.inputIcon} />
                      }
                    />
                  </Form.Item>

                  <Form.Item
                    label="Tỉnh"
                    name="province"
                    className={styles.formItem}
                  >
                    <Input
                      placeholder="Ví dụ: Hưng Yên"
                      prefix={
                        <EnvironmentOutlined className={styles.inputIcon} />
                      }
                    />
                  </Form.Item>
                </Space>

                <Space direction="horizontal" style={{ width: "100%" }}>
                  <Form.Item
                    label="Số năm kinh nghiệm"
                    name="yearsOfExperience"
                    className={styles.formItem}
                  >
                    <div className={styles.inputWithIcon}>
                      <CheckCircleOutlined className={styles.inputIcon} />
                      <InputNumber
                        style={{ width: "100%" }}
                        placeholder="0"
                        min={0}
                        className={styles.inputNumberField}
                      />
                    </div>
                  </Form.Item>

                  <Form.Item
                    label="Quy mô đội ngũ"
                    name="teamSize"
                    className={styles.formItem}
                  >
                    <div className={styles.inputWithIcon}>
                      <TeamOutlined className={styles.inputIcon} />
                      <InputNumber
                        style={{ width: "100%" }}
                        placeholder="0"
                        min={1}
                        className={styles.inputNumberField}
                      />
                    </div>
                  </Form.Item>
                </Space>

                <Form.Item
                  label="Số dự án đã hoàn thành"
                  name="completedProjects"
                  className={styles.formItem}
                >
                  <div className={styles.inputWithIcon}>
                    <FileTextOutlined className={styles.inputIcon} />
                    <InputNumber
                      style={{ width: "100%" }}
                      placeholder="0"
                      min={0}
                      className={styles.inputNumberField}
                    />
                  </div>
                </Form.Item>

                <Space direction="horizontal" style={{ width: "100%" }}>
                  <Form.Item
                    label="Ngân sách dự án tối thiểu (VNĐ)"
                    name="minProjectBudget"
                    className={styles.formItem}
                  >
                    <div className={styles.inputWithIcon}>
                      <DollarOutlined className={styles.inputIcon} />
                      <InputNumber
                        style={{ width: "100%" }}
                        placeholder="0"
                        min={0}
                        formatter={(value) =>
                          `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        parser={
                          ((value: string | undefined) => {
                            const num = value?.replace(/,/g, "");
                            return num ? Number(num) : null;
                          }) as any
                        }
                        className={styles.inputNumberField}
                      />
                    </div>
                  </Form.Item>

                  <Form.Item
                    label="Ngân sách dự án tối đa (VNĐ)"
                    name="maxProjectBudget"
                    className={styles.formItem}
                  >
                    <div className={styles.inputWithIcon}>
                      <DollarOutlined className={styles.inputIcon} />
                      <InputNumber
                        style={{ width: "100%" }}
                        placeholder="0"
                        min={0}
                        formatter={(value) =>
                          `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        parser={
                          ((value: string | undefined) => {
                            const num = value?.replace(/,/g, "");
                            return num ? Number(num) : null;
                          }) as any
                        }
                        className={styles.inputNumberField}
                      />
                    </div>
                  </Form.Item>
                </Space>
              </div>
            )}

            <Form.Item className={styles.submitItem}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                block
                icon={!loading && <CheckCircleOutlined />}
                className={styles.submitButton}
              >
                {loading ? "Đang gửi..." : "GỬI YÊU CẦU ĐĂNG KÝ"}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default ContactPage;
