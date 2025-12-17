// src/app/(dashboard)/contractor/company/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  message,
  Space,
  Typography,
  Row,
  Col,
  Divider,
  Spin,
  Upload,
  Avatar,
} from "antd";
import { SaveOutlined, GoogleOutlined, UploadOutlined, CameraOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";
import RoleBasedRoute from "@/components/shared/RoleBasedRoute";
import { useAuth, UserRole } from "@/hooks/useAuth";
import { getMyContractorProfile } from "@/lib/contractors/contractor-posts.api";
import GoogleMapsReviewsDisplay from "@/components/features/contractors/components/GoogleMapsReviews/GoogleMapsReviewsDisplay";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface ContractorCompanyInfo {
  id: string;
  companyName: string;
  description?: string;
  website?: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  city?: string;
  province?: string;
  googleMapsPlaceUrl?: string;
  googleMapsDataId?: string;
  featuredImageUrl?: string;
}

const ContractorCompanyPage: React.FC = () => {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contractorInfo, setContractorInfo] = useState<ContractorCompanyInfo | null>(null);
  const [googleMapsDataId, setGoogleMapsDataId] = useState<string>("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchContractorInfo = async () => {
      try {
        const profile = await getMyContractorProfile();
        console.log("Contractor profile:", profile);
        setContractorInfo(profile as ContractorCompanyInfo);
        form.setFieldsValue({
          companyName: profile.companyName,
          description: profile.description,
          website: profile.website,
          contactPhone: profile.contactPhone,
          contactEmail: profile.contactEmail,
          address: profile.address,
          city: profile.city,
          province: profile.province,
          googleMapsPlaceUrl: profile.googleMapsPlaceUrl,
        });

        // Use GoogleMapsDataId from backend (already extracted)
        console.log("Profile googleMapsDataId:", profile.googleMapsDataId);
        if (profile.googleMapsDataId) {
          setGoogleMapsDataId(profile.googleMapsDataId);
          console.log("Set googleMapsDataId state:", profile.googleMapsDataId);
        }

        // Set avatar preview if exists
        if (profile.featuredImageUrl) {
          const fullImageUrl = profile.featuredImageUrl.startsWith('http')
            ? profile.featuredImageUrl
            : `${API_BASE.replace('/api', '')}${profile.featuredImageUrl}`;
          setAvatarPreview(fullImageUrl);
        }
      } catch (error) {
        console.error("Failed to fetch contractor info:", error);
        message.error("Không thể tải thông tin công ty");
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === UserRole.Contractor) {
      fetchContractorInfo();
    } else {
      setLoading(false);
    }
  }, [user, form]);

  const handleAvatarChange: UploadProps["onChange"] = ({ file, fileList }) => {
    console.log("handleAvatarChange called", file);

    if (file.status === "removed") {
      setAvatarFile(null);
      setAvatarPreview(null);
      return;
    }

    // Get the actual File object (either from originFileObj or file itself)
    const actualFile = (file.originFileObj || file) as File;

    console.log("Actual file:", actualFile);

    if (actualFile && actualFile instanceof File) {
      // Validate file size (max 5MB)
      if (actualFile.size > 5 * 1024 * 1024) {
        message.error("Kích thước ảnh không được vượt quá 5MB");
        return;
      }

      // Validate file type
      if (!actualFile.type.startsWith("image/")) {
        message.error("Chỉ được upload file ảnh");
        return;
      }

      console.log("Setting avatar file:", actualFile.name, actualFile.size);
      setAvatarFile(actualFile);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log("Preview created");
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(actualFile);
    } else {
      console.warn("No valid file found in upload event");
    }
  };

  const extractDataIdFromUrl = (url: string) => {
    try {
      // Example URL: https://www.google.com/maps/place/.../@latitude,longitude,zoom/data=!4m6!3m5!1s0x89c259af336b3341:0xa4969e07ce3108de!...
      // We need to extract the data_id like: 0x89c259af336b3341:0xa4969e07ce3108de

      // Method 1: Extract from CID parameter
      const cidMatch = url.match(/!1s([0-9a-fx:]+)/i);
      if (cidMatch && cidMatch[1]) {
        setGoogleMapsDataId(cidMatch[1]);
        return;
      }

      // Method 2: Extract from place_id and convert
      const placeIdMatch = url.match(/place_id=([^&]+)/);
      if (placeIdMatch && placeIdMatch[1]) {
        // We'll send this to backend to convert to data_id
        setGoogleMapsDataId(placeIdMatch[1]);
        return;
      }

      message.warning("Không thể trích xuất data_id từ URL Google Maps");
    } catch (error) {
      console.error("Error extracting data_id:", error);
    }
  };

  const handleSave = async (values: any) => {
    if (!contractorInfo?.id) {
      message.error("Không tìm thấy thông tin contractor");
      return;
    }

    console.log("=== handleSave called ===");
    console.log("Values:", values);
    console.log("Avatar file:", avatarFile);

    setSaving(true);
    setUploading(true);
    try {
      const token = localStorage.getItem("accessToken");

      // Create FormData for multipart upload
      const formData = new FormData();

      // Add company info fields
      formData.append("companyName", values.companyName || "");
      formData.append("description", values.description || "");
      formData.append("website", values.website || "");
      formData.append("contactPhone", values.contactPhone || "");
      formData.append("contactEmail", values.contactEmail || "");
      formData.append("address", values.address || "");
      formData.append("city", values.city || "");
      formData.append("province", values.province || "");
      formData.append("googleMapsPlaceUrl", values.googleMapsPlaceUrl || "");

      // Add avatar file if selected
      if (avatarFile) {
        console.log("Adding avatar file to FormData:", avatarFile.name, avatarFile.size);
        formData.append("featuredImage", avatarFile);
      }

      console.log("Sending request to:", `${API_BASE}/Contractor/me/company-info`);
      console.log("FormData entries:");
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const response = await fetch(`${API_BASE}/Contractor/me/company-info`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type - let browser set it with boundary for multipart
        },
        body: formData,
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Failed to update company info: ${response.status} ${errorText}`);
      }

      const updatedData = await response.json();
      console.log("Updated data:", updatedData);
      message.success("Cập nhật thông tin công ty thành công!");

      // Update contractor info from response
      setContractorInfo(updatedData);

      // Update googleMapsDataId if available
      if (updatedData.googleMapsDataId) {
        setGoogleMapsDataId(updatedData.googleMapsDataId);
      }

      // Update avatar preview if new image was uploaded
      if (updatedData.featuredImageUrl) {
        // Convert relative URL to full URL for preview
        const fullImageUrl = updatedData.featuredImageUrl.startsWith('http')
          ? updatedData.featuredImageUrl
          : `${API_BASE.replace('/api', '')}${updatedData.featuredImageUrl}`;
        setAvatarPreview(fullImageUrl);
        console.log("Avatar preview updated to:", fullImageUrl);
      }

      // Clear avatar file after successful upload
      setAvatarFile(null);
    } catch (error) {
      console.error("Error saving company info:", error);
      message.error("Không thể cập nhật thông tin công ty");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <RoleBasedRoute allowedRoles={[UserRole.Contractor]}>
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Đang tải thông tin công ty...</div>
        </div>
      </RoleBasedRoute>
    );
  }

  return (
    <RoleBasedRoute allowedRoles={[UserRole.Contractor]}>
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, rgba(56, 193, 182, 0.03) 0%, rgba(102, 126, 234, 0.03) 100%)",
        padding: "24px"
      }}>
        {/* Header */}
        <Card
          className="mb-6"
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "20px",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.08)"
          }}
        >
          <Title level={2} style={{
            margin: 0,
            background: "linear-gradient(135deg, #38c1b6 0%, #667eea 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}>
            Thông tin công ty
          </Title>
          <Text type="secondary">
            Quản lý thông tin công ty và hiển thị đánh giá từ Google Maps
          </Text>
        </Card>

        <Row gutter={[24, 24]}>
          {/* Company Information Form */}
          <Col xs={24} lg={14}>
            <Card
              title={
                <span style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "#374151"
                }}>
                  Thông tin cơ bản
                </span>
              }
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "20px",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.08)"
              }}
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSave}
                autoComplete="off"
              >
                {/* Avatar Upload Section */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  marginBottom: 32,
                  padding: 24,
                  background: 'linear-gradient(135deg, rgba(56, 193, 182, 0.05) 0%, rgba(102, 126, 234, 0.05) 100%)',
                  borderRadius: 16,
                  border: '2px dashed rgba(56, 193, 182, 0.2)'
                }}>
                  <Avatar
                    size={120}
                    src={avatarPreview}
                    icon={!avatarPreview && <CameraOutlined />}
                    style={{
                      background: avatarPreview ? 'transparent' : 'linear-gradient(135deg, #38c1b6 0%, #667eea 100%)',
                      marginBottom: 16,
                      border: '4px solid white',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Upload
                    accept="image/*"
                    showUploadList={false}
                    beforeUpload={(file) => {
                      console.log("beforeUpload called with file:", file);

                      // Validate file size (max 5MB)
                      if (file.size > 5 * 1024 * 1024) {
                        message.error("Kích thước ảnh không được vượt quá 5MB");
                        return false;
                      }

                      // Validate file type
                      if (!file.type.startsWith("image/")) {
                        message.error("Chỉ được upload file ảnh");
                        return false;
                      }

                      console.log("Setting avatar file from beforeUpload:", file.name, file.size);
                      setAvatarFile(file);

                      // Create preview
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        console.log("Preview created from beforeUpload");
                        setAvatarPreview(reader.result as string);
                      };
                      reader.readAsDataURL(file);

                      // Return false to prevent auto upload
                      return false;
                    }}
                    maxCount={1}
                  >
                    <Button
                      icon={<UploadOutlined />}
                      size="large"
                      style={{
                        borderRadius: 12,
                        background: 'white',
                        border: '1px solid #38c1b6',
                        color: '#38c1b6',
                        fontWeight: 500
                      }}
                    >
                      {avatarPreview ? 'Thay đổi ảnh đại diện' : 'Upload ảnh đại diện'}
                    </Button>
                  </Upload>
                  <Text type="secondary" style={{ marginTop: 8, fontSize: 12 }}>
                    Kích thước tối đa: 5MB. Định dạng: JPG, PNG, GIF
                  </Text>
                </div>

                <Form.Item
                  label="Tên công ty"
                  name="companyName"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên công ty" },
                  ]}
                >
                  <Input size="large" placeholder="VD: Công ty TNHH Xây dựng ABC" />
                </Form.Item>

                <Form.Item label="Mô tả công ty" name="description">
                  <TextArea
                    rows={4}
                    placeholder="Giới thiệu về công ty, lĩnh vực chuyên môn..."
                  />
                </Form.Item>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item label="Số điện thoại" name="contactPhone">
                      <Input size="large" placeholder="0123 456 789" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="Email liên hệ" name="contactEmail">
                      <Input size="large" type="email" placeholder="contact@company.com" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item label="Website" name="website">
                  <Input
                    size="large"
                    placeholder="https://www.company.com"
                    prefix={<GoogleOutlined />}
                  />
                </Form.Item>

                <Form.Item label="Địa chỉ" name="address">
                  <Input size="large" placeholder="Số nhà, tên đường..." />
                </Form.Item>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item label="Thành phố" name="city">
                      <Input size="large" placeholder="Đà Nẵng" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="Tỉnh/Thành phố" name="province">
                      <Input size="large" placeholder="Đà Nẵng" />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider />

                <Title level={4}>
                  <GoogleOutlined /> Google Maps Reviews
                </Title>
                <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
                  Nhập URL Google Maps của công ty để hiển thị 5 đánh giá mới nhất
                </Text>

                <Form.Item
                  label="Google Maps URL"
                  name="googleMapsPlaceUrl"
                  extra="VD: https://www.google.com/maps/place/..."
                >
                  <Input
                    size="large"
                    placeholder="Dán URL Google Maps của công ty tại đây"
                    prefix={<GoogleOutlined />}
                  />
                </Form.Item>


                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    icon={<SaveOutlined />}
                    loading={saving}
                    style={{
                      background: "linear-gradient(135deg, #38c1b6 0%, #667eea 100%)",
                      border: "none",
                      borderRadius: "12px",
                      padding: "0 32px",
                      height: "52px",
                      fontWeight: 600,
                      boxShadow: "0 4px 15px rgba(56, 193, 182, 0.3)",
                      transition: "all 0.3s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 8px 25px rgba(56, 193, 182, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 15px rgba(56, 193, 182, 0.3)";
                    }}
                  >
                    Lưu thay đổi
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>

          {/* Google Maps Reviews */}
          <Col xs={24} lg={10}>
            <GoogleMapsReviewsDisplay
              dataId={googleMapsDataId}
              companyName={contractorInfo?.companyName || ""}
              googleMapsPlaceUrl={contractorInfo?.googleMapsPlaceUrl || undefined}
            />
          </Col>
        </Row>
      </div>
    </RoleBasedRoute>
  );
};

export default ContractorCompanyPage;
