// src/components/features/contractors/components/GoogleMapsReviews/GoogleMapsReviewsDisplay.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Card, Empty, Rate, Avatar, Button, Space, Typography, Spin, Alert } from "antd";
import { GoogleOutlined, StarOutlined, UserOutlined } from "@ant-design/icons";

const { Text, Title, Paragraph } = Typography;

interface GoogleMapsReview {
  authorName: string;
  authorUrl?: string;
  profilePhotoUrl?: string;
  rating: number;
  text?: string;
  time: number;
  relativeTimeDescription?: string;
}

interface GoogleMapsReviewsDisplayProps {
  dataId: string;
  companyName: string;
  googleMapsPlaceUrl?: string;
}

const GoogleMapsReviewsDisplay: React.FC<GoogleMapsReviewsDisplayProps> = ({
  dataId,
  companyName,
  googleMapsPlaceUrl,
}) => {
  const [reviews, setReviews] = useState<GoogleMapsReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (dataId) {
      fetchReviews();
    }
  }, [dataId]);

  const fetchReviews = async () => {
    if (!dataId) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("accessToken");
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

      const response = await fetch(
        `${API_BASE}/Contractor/google-maps-reviews?dataId=${encodeURIComponent(dataId)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Không thể tải reviews từ Google Maps");
      }

      const data = await response.json();
      console.log("Google Maps reviews:", data);

      // SerpAPI returns reviews in data.reviews
      setReviews(data.reviews || []);
    } catch (err: any) {
      console.error("Error fetching Google Maps reviews:", err);
      setError(err.message || "Đã xảy ra lỗi khi tải reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleReviewClick = (review: GoogleMapsReview) => {
    if (review.authorUrl) {
      window.open(review.authorUrl, "_blank");
    }
  };

  if (!dataId) {
    return (
      <Card
        title={
          <Space>
            <GoogleOutlined style={{ color: "#38c1b6" }} />
            <span style={{ fontSize: "18px", fontWeight: 600, color: "#374151" }}>
              Google Maps Reviews
            </span>
          </Space>
        }
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "20px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.08)"
        }}
      >
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Chưa có Google Maps URL"
        >
          <Text type="secondary">
            Vui lòng nhập Google Maps URL để hiển thị đánh giá
          </Text>
        </Empty>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card
        title={
          <Space>
            <GoogleOutlined style={{ color: "#38c1b6" }} />
            <span style={{ fontSize: "18px", fontWeight: 600, color: "#374151" }}>
              Google Maps Reviews
            </span>
          </Space>
        }
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "20px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.08)"
        }}
      >
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin size="large" style={{ color: "#38c1b6" }} />
          <div style={{ marginTop: 16, color: "#666" }}>Đang tải reviews...</div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card
        title={
          <Space>
            <GoogleOutlined style={{ color: "#38c1b6" }} />
            <span style={{ fontSize: "18px", fontWeight: 600, color: "#374151" }}>
              Google Maps Reviews
            </span>
          </Space>
        }
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "20px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.08)"
        }}
      >
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          style={{ borderRadius: "12px" }}
          action={
            <Button
              size="small"
              onClick={fetchReviews}
              style={{
                background: "linear-gradient(135deg, #38c1b6 0%, #667eea 100%)",
                color: "white",
                border: "none",
                borderRadius: "8px"
              }}
            >
              Thử lại
            </Button>
          }
        />
      </Card>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <Card
        title={
          <Space>
            <GoogleOutlined style={{ color: "#38c1b6" }} />
            <span style={{ fontSize: "18px", fontWeight: 600, color: "#374151" }}>
              Google Maps Reviews
            </span>
          </Space>
        }
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "20px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.08)"
        }}
      >
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Chưa có đánh giá"
        >
          <Text type="secondary">
            Không tìm thấy đánh giá nào cho địa điểm này
          </Text>
        </Empty>
      </Card>
    );
  }

  return (
    <Card
      title={
        <Space>
          <GoogleOutlined style={{ color: "#38c1b6" }} />
          <span style={{ fontSize: "18px", fontWeight: 600, color: "#374151" }}>
            5 Đánh giá mới nhất
          </span>
        </Space>
      }
      extra={
        googleMapsPlaceUrl && (
          <Button
            type="link"
            icon={<GoogleOutlined />}
            onClick={() => {
              window.open(googleMapsPlaceUrl, "_blank");
            }}
            style={{ color: "#38c1b6" }}
          >
            Xem trên Google Maps
          </Button>
        )
      }
      style={{
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: "20px",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.08)"
      }}
    >
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        {reviews.slice(0, 5).map((review, index) => (
          <Card
            key={index}
            size="small"
            hoverable
            onClick={() => handleReviewClick(review)}
            style={{
              cursor: review.authorUrl ? "pointer" : "default",
              borderRadius: 12,
              background: "rgba(249, 250, 251, 0.8)",
              border: "1px solid rgba(229, 231, 235, 0.6)",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.08)";
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.95)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.background = "rgba(249, 250, 251, 0.8)";
            }}
          >
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              {/* Author Info */}
              <Space>
                <Avatar
                  src={review.profilePhotoUrl}
                  icon={<UserOutlined />}
                  size={40}
                />
                <div>
                  <Text strong>{review.authorName}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {review.relativeTimeDescription || ""}
                  </Text>
                </div>
              </Space>

              {/* Rating */}
              <div>
                <Rate disabled value={review.rating} style={{ fontSize: 14 }} />
                <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                  {review.rating}/5
                </Text>
              </div>

              {/* Review Text */}
              {review.text && (
                <Paragraph
                  ellipsis={{ rows: 3, expandable: true, symbol: "Xem thêm" }}
                  style={{ margin: 0, fontSize: 14 }}
                >
                  {review.text}
                </Paragraph>
              )}
            </Space>
          </Card>
        ))}
      </Space>
    </Card>
  );
};

export default GoogleMapsReviewsDisplay;
