"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  Avatar,
  Typography,
  Space,
  Button,
  Popconfirm,
  Image,
  Dropdown,
  MenuProps,
} from "antd";
import {
  DeleteOutlined,
  MoreOutlined,
  LeftOutlined,
  RightOutlined,
  HeartOutlined,
  MessageOutlined,
  ShareAltOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { ContractorPost } from "@/lib/contractors/contractor-posts.types";
import { getImageUrl } from "@/lib/contractors/contractor-posts.api";
import { gsap } from "gsap";
import styles from "./ContractorPostCard.module.scss";

const { Text, Paragraph } = Typography;

interface ContractorPostCardProps {
  post: ContractorPost;
  canManage?: boolean;
  onDelete?: (postId: string) => Promise<void>;
  contractorName?: string;
  contractorAvatar?: string;
}

const ContractorPostCard: React.FC<ContractorPostCardProps> = ({
  post,
  canManage,
  onDelete,
  contractorName = "Contractor",
  contractorAvatar,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        {
          opacity: 0,
          y: 20,
          scale: 0.98,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          ease: "power2.out",
        }
      );
    }
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  const handleImageNav = (direction: "prev" | "next") => {
    const newIndex =
      direction === "prev"
        ? Math.max(0, currentImageIndex - 1)
        : Math.min(post.images.length - 1, currentImageIndex + 1);

    if (imagesRef.current) {
      gsap.to(imagesRef.current, {
        x: -newIndex * 100 + "%",
        duration: 0.4,
        ease: "power2.inOut",
      });
    }
    setCurrentImageIndex(newIndex);
  };

  const menuItems: MenuProps["items"] = canManage
    ? [
        {
          key: "delete",
          label: "Xóa bài đăng",
          icon: <DeleteOutlined />,
          danger: true,
          onClick: () => {
            if (onDelete) {
              onDelete(post.id);
            }
          },
        },
      ]
    : [];

  const hasMultipleImages = post.images && post.images.length > 1;
  const hasImages = post.images && post.images.length > 0;

  // Debug images
  console.log("Post images debug:", {
    postId: post.id,
    postTitle: post.title,
    images: post.images,
    imagesLength: post.images?.length || 0,
    hasImages,
    hasMultipleImages,
    // ✅ Debug từng image URL
    imageUrls: post.images?.map((img) => ({
      id: img.id,
      url: img.url,
      isFullUrl: img.url.startsWith("http"),
      needsDomain: !img.url.startsWith("http"),
      processedUrl: getImageUrl(img.url),
    })),
  });

  // Determine image grid layout
  const getImageGridClass = () => {
    if (!hasImages) return "";
    const count = post.images.length;
    if (count === 1) return styles.gridSingle;
    if (count === 2) return styles.gridTwo;
    if (count === 3) return styles.gridThree;
    if (count === 4) return styles.gridFour;
    return styles.gridMultiple;
  };

  return (
    <Card className={styles.postCard} bordered={false} ref={cardRef}>
      {/* Header */}
      <div className={styles.postHeader}>
        <Space size={12}>
          <Avatar size={44} src={contractorAvatar} className={styles.avatar}>
            {contractorName.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <Text strong className={styles.contractorName}>
              {contractorName}
            </Text>
            <div className={styles.postTime}>{formatDate(post.createdAt)}</div>
          </div>
        </Space>

        {canManage && (
          <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
            <Button
              type="text"
              icon={<MoreOutlined />}
              className={styles.moreButton}
            />
          </Dropdown>
        )}
      </div>

      {/* Title & Description */}
      <div className={styles.postContent}>
        {post.title && (
          <Text strong className={styles.postTitle}>
            {post.title}
          </Text>
        )}
        {post.description && (
          <Paragraph
            className={styles.postDescription}
            ellipsis={
              !isExpanded
                ? { rows: 3, expandable: true, symbol: "Xem thêm" }
                : false
            }
          >
            {post.description}
          </Paragraph>
        )}
      </div>

      {/* Images Grid/Carousel */}
      {hasImages && (
        <div className={`${styles.imageContainer} ${getImageGridClass()}`}>
          {post.images.length <= 4 ? (
            // Grid layout for 1-4 images
            <div className={styles.imageGrid}>
              {post.images.map((img, index) => (
                <div
                  key={img.id}
                  className={styles.imageGridItem}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Image.PreviewGroup>
                    <Image
                      src={getImageUrl(img.url)}
                      alt={img.caption || post.title}
                      className={styles.postImage}
                      onError={(e) => {
                        console.error(
                          `Failed to load image: ${getImageUrl(img.url)}`,
                          e
                        );
                      }}
                      onLoad={() => {
                        console.log(
                          `Successfully loaded image: ${getImageUrl(img.url)}`
                        );
                      }}
                      preview={{
                        mask: <div className={styles.imageMask}>Xem ảnh</div>,
                      }}
                    />
                  </Image.PreviewGroup>
                </div>
              ))}
            </div>
          ) : (
            // Carousel for 5+ images
            <div className={styles.carouselWrapper}>
              <div className={styles.carouselTrack} ref={imagesRef}>
                {post.images.map((img) => (
                  <div key={img.id} className={styles.carouselSlide}>
                    <Image
                      src={getImageUrl(img.url)}
                      alt={img.caption || post.title}
                      className={styles.postImage}
                      onError={(e) => {
                        console.error(
                          `Failed to load carousel image: ${getImageUrl(
                            img.url
                          )}`,
                          e
                        );
                      }}
                      onLoad={() => {
                        console.log(
                          `Successfully loaded carousel image: ${getImageUrl(
                            img.url
                          )}`
                        );
                      }}
                      preview={{
                        mask: <div className={styles.imageMask}>Xem ảnh</div>,
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Navigation Arrows */}
              {currentImageIndex > 0 && (
                <Button
                  type="text"
                  icon={<LeftOutlined />}
                  className={`${styles.navButton} ${styles.navButtonLeft}`}
                  onClick={() => handleImageNav("prev")}
                />
              )}
              {currentImageIndex < post.images.length - 1 && (
                <Button
                  type="text"
                  icon={<RightOutlined />}
                  className={`${styles.navButton} ${styles.navButtonRight}`}
                  onClick={() => handleImageNav("next")}
                />
              )}

              {/* Image Counter */}
              <div className={styles.imageCounter}>
                {currentImageIndex + 1} / {post.images.length}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className={styles.postActions}>
        <Button
          type="text"
          icon={<HeartOutlined />}
          className={styles.actionButton}
        >
          Thích
        </Button>
        <Button
          type="text"
          icon={<MessageOutlined />}
          className={styles.actionButton}
        >
          Bình luận
        </Button>
        <Button
          type="text"
          icon={<ShareAltOutlined />}
          className={styles.actionButton}
        >
          Chia sẻ
        </Button>
      </div>
    </Card>
  );
};

export default ContractorPostCard;
