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
import { UserRole } from "@/hooks/useAuth";
import { registrationApi, type SubmitRegistrationRequestDto } from "@/lib/registration/registration.api";
import styles from "./ContactPage.module.scss";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ContactPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<number | undefined>(undefined);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      const dto: SubmitRegistrationRequestDto = {
        username: values.username,
        email: values.email,
        phone: values.phone,
        requestedRole: values.requestedRole,
        // Supervisor fields
        department: values.department,
        position: values.position,
        district: values.district,
        minRate: values.minRate,
        maxRate: values.maxRate,
        // Contractor fields
        companyName: values.companyName,
        businessLicense: values.businessLicense,
        taxCode: values.taxCode,
        description: values.description,
        website: values.website,
        address: values.address,
        city: values.city,
        province: values.province,
        yearsOfExperience: values.yearsOfExperience,
        teamSize: values.teamSize,
        completedProjects: values.completedProjects,
        minProjectBudget: values.minProjectBudget,
        maxProjectBudget: values.maxProjectBudget,
      };

      await registrationApi.submit(dto);
      message.success("Yêu cầu đăng ký đã được gửi thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất có thể.");
      form.resetFields();
      setSelectedRole(undefined);
    } catch (error: any) {
      console.error("Failed to submit registration request:", error);
      message.error(
        error?.response?.data?.message || "Không thể gửi yêu cầu đăng ký. Vui lòng thử lại sau."
      );
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
      businessLicense: undefined,
      taxCode: undefined,
      description: undefined,
      website: undefined,
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
          <Title level={1}>ĐĂNG KÝ NHÀ THẦU / GIÁM SÁT VIÊN</Title>
          <Text type="secondary" className={styles.subtitle}>
            Điền thông tin bên dưới để đăng ký tài khoản nhà thầu hoặc giám sát viên trên nền tảng OCSP
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
            <Divider orientation="left">Thông tin cơ bản</Divider>
            
            <Form.Item
              label="Vai trò đăng ký"
              name="requestedRole"
              rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
            >
              <Select
                placeholder="Chọn vai trò"
                onChange={handleRoleChange}
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
            >
              <Input placeholder="username" />
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
              label="Số điện thoại"
              name="phone"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại" },
                { pattern: /^[0-9]{10,11}$/, message: "Số điện thoại không hợp lệ" },
              ]}
            >
              <Input placeholder="0123456789" />
            </Form.Item>

            {/* Supervisor Fields */}
            {selectedRole === UserRole.Supervisor && (
              <>
                <Divider orientation="left">Thông tin giám sát viên</Divider>
                
                <Form.Item
                  label="Phòng ban"
                  name="department"
                  rules={[{ required: true, message: "Vui lòng nhập phòng ban" }]}
                >
                  <Input placeholder="Ví dụ: Phòng Kỹ thuật" />
                </Form.Item>

                <Form.Item
                  label="Chức vụ"
                  name="position"
                  rules={[{ required: true, message: "Vui lòng nhập chức vụ" }]}
                >
                  <Input placeholder="Ví dụ: Giám sát viên công trình" />
                </Form.Item>

                <Form.Item
                  label="Quận/Huyện"
                  name="district"
                >
                  <Input placeholder="Ví dụ: Hải Châu, Thanh Khê" />
                </Form.Item>
              </>
            )}

            {/* Contractor Fields */}
            {selectedRole === UserRole.Contractor && (
              <>
                <Divider orientation="left">Thông tin nhà thầu</Divider>
                
                <Form.Item
                  label="Tên công ty"
                  name="companyName"
                  rules={[{ required: true, message: "Vui lòng nhập tên công ty" }]}
                >
                  <Input placeholder="Tên công ty" />
                </Form.Item>

                <Form.Item
                  label="Giấy phép kinh doanh"
                  name="businessLicense"
                  rules={[{ required: true, message: "Vui lòng nhập số giấy phép kinh doanh" }]}
                >
                  <Input placeholder="Số giấy phép kinh doanh" />
                </Form.Item>

                <Form.Item
                  label="Mã số thuế"
                  name="taxCode"
                >
                  <Input placeholder="Mã số thuế" />
                </Form.Item>

                <Form.Item
                  label="Mô tả công ty"
                  name="description"
                >
                  <TextArea
                    rows={4}
                    placeholder="Mô tả về công ty, lĩnh vực hoạt động, kinh nghiệm..."
                  />
                </Form.Item>

                <Form.Item
                  label="Website"
                  name="website"
                >
                  <Input placeholder="https://example.com" />
                </Form.Item>

                <Form.Item
                  label="Địa chỉ"
                  name="address"
                >
                  <Input placeholder="Địa chỉ công ty" />
                </Form.Item>

                <Space direction="horizontal" style={{ width: "100%" }}>
                  <Form.Item
                    label="Thành phố"
                    name="city"
                  >
                    <Input placeholder="Ví dụ: Đà Nẵng" />
                  </Form.Item>

                  <Form.Item
                    label="Tỉnh"
                    name="province"
                  >
                    <Input placeholder="Ví dụ: Hưng yên" />
                  </Form.Item>
                </Space>

                <Space direction="horizontal" style={{ width: "100%" }}>
                  <Form.Item
                    label="Số năm kinh nghiệm"
                    name="yearsOfExperience"
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      placeholder="0"
                      min={0}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Quy mô đội ngũ"
                    name="teamSize"
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      placeholder="0"
                      min={1}
                    />
                  </Form.Item>
                </Space>

                <Form.Item
                  label="Số dự án đã hoàn thành"
                  name="completedProjects"
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    placeholder="0"
                    min={0}
                  />
                </Form.Item>

                <Space direction="horizontal" style={{ width: "100%" }}>
                  <Form.Item
                    label="Ngân sách dự án tối thiểu (VNĐ)"
                    name="minProjectBudget"
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      placeholder="0"
                      min={0}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Ngân sách dự án tối đa (VNĐ)"
                    name="maxProjectBudget"
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      placeholder="0"
                      min={0}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    />
                  </Form.Item>
                </Space>
              </>
            )}

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                block
              >
                GỬI YÊU CẦU ĐĂNG KÝ
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default ContactPage;

