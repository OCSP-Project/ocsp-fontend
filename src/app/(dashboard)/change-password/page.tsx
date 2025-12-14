"use client";

import React, { useState } from "react";
import { Form, Input, Button, message, Card, Typography } from "antd";
import { LockOutlined, EyeInvisibleOutlined, EyeOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import styles from "./change-password.module.scss";

const { Title, Text } = Typography;

interface ChangePasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ChangePasswordPage: React.FC = () => {
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (values: ChangePasswordFormValues) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

      const response = await fetch(`${API_BASE}/Auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Đổi mật khẩu thất bại");
      }

      setSuccess(true);
      message.success("Đổi mật khẩu thành công! Email xác nhận đã được gửi.");
      form.resetFields();

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error: any) {
      console.error("Change password error:", error);
      message.error(error.message || "Đã xảy ra lỗi khi đổi mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.changePasswordPage}>
        <div className={styles.container}>
          <Card className={styles.successCard}>
            <div className={styles.successContent}>
              <CheckCircleOutlined className={styles.successIcon} />
              <Title level={2}>Đổi mật khẩu thành công!</Title>
              <Text className={styles.successText}>
                Mật khẩu của bạn đã được cập nhật. Một email xác nhận đã được gửi đến địa chỉ email của bạn.
              </Text>
              <Button
                type="primary"
                size="large"
                onClick={() => router.push("/dashboard")}
                className={styles.backButton}
              >
                Quay về Dashboard
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.changePasswordPage}>
      <div className={styles.container}>
        <Card className={styles.formCard}>
          <div className={styles.header}>
            <LockOutlined className={styles.headerIcon} />
            <Title level={2} className={styles.title}>
              Đổi mật khẩu
            </Title>
            <Text className={styles.subtitle}>
              Vui lòng nhập mật khẩu hiện tại và mật khẩu mới để thay đổi
            </Text>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className={styles.form}
            requiredMark={false}
          >
            <Form.Item
              label="Mật khẩu hiện tại"
              name="currentPassword"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu hiện tại" },
              ]}
            >
              <div className={styles.passwordInput}>
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  size="large"
                  placeholder="Nhập mật khẩu hiện tại"
                  prefix={<LockOutlined className={styles.inputIcon} />}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                </button>
              </div>
            </Form.Item>

            <Form.Item
              label="Mật khẩu mới"
              name="newPassword"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu mới" },
                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: "Mật khẩu phải có chữ hoa, chữ thường và số",
                },
              ]}
            >
              <div className={styles.passwordInput}>
                <Input
                  type={showNewPassword ? "text" : "password"}
                  size="large"
                  placeholder="Nhập mật khẩu mới"
                  prefix={<LockOutlined className={styles.inputIcon} />}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                </button>
              </div>
            </Form.Item>

            <Form.Item
              label="Xác nhận mật khẩu mới"
              name="confirmPassword"
              dependencies={["newPassword"]}
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Mật khẩu xác nhận không khớp"));
                  },
                }),
              ]}
            >
              <div className={styles.passwordInput}>
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  size="large"
                  placeholder="Xác nhận mật khẩu mới"
                  prefix={<LockOutlined className={styles.inputIcon} />}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                </button>
              </div>
            </Form.Item>

            <div className={styles.passwordRequirements}>
              <Text type="secondary">Mật khẩu phải có:</Text>
              <ul>
                <li>Ít nhất 6 ký tự</li>
                <li>Chứa chữ hoa và chữ thường</li>
                <li>Chứa ít nhất một chữ số</li>
              </ul>
            </div>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                block
                className={styles.submitButton}
              >
                {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
              </Button>
            </Form.Item>

            <div className={styles.footer}>
              <Button
                type="link"
                onClick={() => router.back()}
                className={styles.cancelButton}
              >
                Hủy bỏ
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
