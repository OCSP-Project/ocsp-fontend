// src/features/contractors/components/ContractorCard/ContractorCard.tsx
import React, { useRef, useEffect, useState } from "react";
import {
  Card,
  Rate,
  Tag,
  Button,
  Space,
  Avatar,
  Tooltip,
  Badge,
  Dropdown,
  message,
} from "antd";
import type { MenuProps } from "antd";
import {
  HeartOutlined,
  HeartFilled,
  StarFilled,
  EnvironmentOutlined,
  TeamOutlined,
  CalendarOutlined,
  PhoneOutlined,
  EyeOutlined,
  SafetyCertificateOutlined,
  CrownOutlined,
  MoreOutlined,
  SendOutlined,
  MessageOutlined,
  ShareAltOutlined,
  GoogleOutlined,
} from "@ant-design/icons";
import QuoteSendButton from "../../../quotes/QuoteSendButton";
import QuoteSendModal from "../../../quotes/QuoteSendModal";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, UserRole } from "@/hooks/useAuth";
import { chatApi } from "@/lib/api/chat";
import type { ContractorSummary } from "@/lib/api/contractors";
import styles from "./ContractorCard.module.scss";

// Register GSAP plugin
gsap.registerPlugin(ScrollTrigger);

interface ContractorCardProps {
  contractor: ContractorSummary;
  onFavorite?: (contractorId: string) => void;
  isFavorited?: boolean;
  showAnimation?: boolean;
  animationDelay?: number;
}
interface ContractorAction {
  contractor_id: string;
  contractor_name: string;
  contractor_slug: string;
  description: string;
  budget_range: string;
  rating: number;
  specialties: string[];
  location: string;
  profile_url: string;
  contact_url: string;
}

interface EnhancedChatResponse {
  response: string;
  sources: Array<{
    id: number;
    score: number;
    source?: string;
  }>;
  contractors: ContractorAction[];
  has_recommendations: boolean;
}

const ContractorCard: React.FC<ContractorCardProps> = ({
  contractor,
  onFavorite,
  isFavorited = false,
  showAnimation = true,
  animationDelay = 0,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user } = useAuth();
  const [showSendQuoteModal, setShowSendQuoteModal] = useState(false);

  // Helper function to get full image URL
  const getImageUrl = (url?: string) => {
    if (!url) return null;
    // If URL already starts with http/https, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Otherwise, prepend backend base URL (without /api suffix)
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
    const BASE_URL = API_BASE.replace('/api', '');
    return `${BASE_URL}${url}`;
  };

  useEffect(() => {
    if (!showAnimation || !cardRef.current) return;

    const card = cardRef.current;

    // Initial state
    gsap.set(card, {
      opacity: 0,
      y: 50,
      scale: 0.9,
    });

    // Animation on scroll
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: card,
        start: "top 90%",
        end: "bottom 10%",
        toggleActions: "play none none reverse",
      },
      delay: animationDelay,
    });

    tl.to(card, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.6,
      ease: "power2.out",
    });

    // Hover animations
    const handleMouseEnter = () => {
      gsap.to(card, {
        y: -5,
        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        y: 0,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        duration: 0.3,
        ease: "power2.out",
      });
    };

    card.addEventListener("mouseenter", handleMouseEnter);
    card.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      card.removeEventListener("mouseenter", handleMouseEnter);
      card.removeEventListener("mouseleave", handleMouseLeave);
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === card) {
          trigger.kill();
        }
      });
    };
  }, [showAnimation, animationDelay]);

  const formatBudget = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
      notation: "compact",
    }).format(amount);
  };

  const formatExperience = (years: number) => {
    return years > 0 ? `${years} năm KN` : "Mới";
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFavorite?.(contractor.id);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const url = `${window.location.origin}/view-contractors/${contractor.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: contractor.companyName,
          text: `Xem hồ sơ nhà thầu ${contractor.companyName}`,
          url: url,
        });
        message.success("Đã chia sẻ thành công");
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url);
        message.success("Đã sao chép link vào clipboard");
      } catch (error) {
        message.error("Không thể chia sẻ");
      }
    }
  };

  const handleContact = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (user?.role !== UserRole.Homeowner) {
      router.push("/login");
      return;
    }

    try {
      const ownerUserId = (contractor as any)?.ownerUserId;
      if (!ownerUserId) {
        message.error("Không tìm thấy thông tin nhà thầu");
        return;
      }

      const res = await chatApi.startConversation({
        userIds: [user.id, ownerUserId],
        chatType: "consultation",
      });

      router.push(`/chat?conversationId=${res.conversationId}`);
    } catch (error) {
      message.error("Lỗi khi khởi tạo cuộc trò chuyện");
    }
  };

  const handleSendQuote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (user?.role === UserRole.Homeowner) {
      setShowSendQuoteModal(true);
    } else {
      router.push("/login");
    }
  };

  const handleQuoteSent = () => {
    setShowSendQuoteModal(false);
    message.success("Gửi quote thành công");
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 90) return "success";
    if (percentage >= 70) return "warning";
    return "default";
  };

  return (
    <>
    <Badge.Ribbon
      text={contractor.isPremium ? "Premium" : undefined}
      color="gold"
      style={{ display: contractor.isPremium ? "block" : "none" }}
    >
      <Card hoverable className={styles.card} ref={cardRef}>
        <div className={styles.cardWrapper}>
          {/* Cover Image Section */}
          <div className={styles.coverContainer}>
            {getImageUrl(contractor.featuredImageUrl) ? (
              <img
                alt={contractor.companyName}
                src={getImageUrl(contractor.featuredImageUrl)!}
                className={styles.coverImage}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  if (target.nextSibling) {
                    (target.nextSibling as HTMLElement).style.display = 'flex';
                  }
                }}
              />
            ) : null}
            <div
              className={styles.placeholderCover}
              style={{ display: getImageUrl(contractor.featuredImageUrl) ? 'none' : 'flex' }}
            >
              <div style={{ textAlign: 'center' }}>
                <TeamOutlined style={{ fontSize: 72 }} />
                <div style={{
                  marginTop: '12px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#38c1b6',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  {contractor.companyName.substring(0, 20)}
                  {contractor.companyName.length > 20 && '...'}
                </div>
              </div>
            </div>

            {/* Gradient overlay */}
            <div className={styles.gradientOverlay}></div>

            {/* Overlay badges */}
            <div className={styles.badgeOverlay}>
              {contractor.isVerified && (
                <Tooltip title="Đã xác thực">
                  <Tag
                    icon={<SafetyCertificateOutlined />}
                    color="blue"
                    className={styles.badgeTag}
                  >
                    Verified
                  </Tag>
                </Tooltip>
              )}

              {contractor.isPremium && (
                <Tooltip title="Tài khoản Premium">
                  <Tag
                    icon={<CrownOutlined />}
                    color="gold"
                    className={styles.badgeTag}
                  >
                    Premium
                  </Tag>
                </Tooltip>
              )}
            </div>

            {/* Favorite button */}
            <Button
              type="text"
              icon={isFavorited ? <HeartFilled /> : <HeartOutlined />}
              className={`${styles.favoriteBtn} ${
                isFavorited ? styles.favorited : ""
              }`}
              onClick={handleFavoriteClick}
            />
          </div>

          {/* Content Section */}
          <div className={styles.cardContent}>
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.titleSection}>
                <h3
                  className={styles.companyName}
                  title={contractor.companyName}
                >
                  <Link href={`/view-contractors/${contractor.id}`}>
                    {contractor.companyName}
                  </Link>
                </h3>
                <div className={styles.rating}>
                  <Rate
                    disabled
                    defaultValue={contractor.googleMapsRating || contractor.averageRating}
                    allowHalf
                    className={styles.rateStars}
                  />
                  <span className={styles.ratingText}>
                    <strong>
                      {(contractor.googleMapsRating || contractor.averageRating).toFixed(1)}
                    </strong>
                    <span className={styles.reviewCount}>
                      {contractor.googleMapsRating ? (
                        <>
                          ({contractor.googleMapsReviewCount || 0} đánh giá từ{" "}
                          <GoogleOutlined style={{ fontSize: 12 }} />)
                        </>
                      ) : (
                        <>({contractor.totalReviews} đánh giá)</>
                      )}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p
              className={styles.description}
              title={contractor.description || "Không có mô tả"}
            >
              {contractor.description && contractor.description.length > 0
                ? contractor.description.length > 120
                  ? `${contractor.description.substring(0, 120)}...`
                  : contractor.description
                : "Không có mô tả"}
            </p>

            {/* Info Grid */}
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <EnvironmentOutlined />
                <span>{contractor.city || "Da Nang"}</span>
              </div>

              <div className={styles.infoItem}>
                <CalendarOutlined />
                <span>{formatExperience(contractor.yearsOfExperience)}</span>
              </div>

              <div className={styles.infoItem}>
                <TeamOutlined />
                <span>{contractor.completedProjects} dự án</span>
              </div>

              {(contractor.minProjectBudget || contractor.maxProjectBudget) && (
                <div className={styles.infoItem}>
                  <span className={styles.budget}>
                    {contractor.minProjectBudget && contractor.maxProjectBudget
                      ? `${formatBudget(
                          contractor.minProjectBudget
                        )} - ${formatBudget(contractor.maxProjectBudget)}`
                      : contractor.minProjectBudget
                      ? `Từ ${formatBudget(contractor.minProjectBudget)}`
                      : `Đến ${formatBudget(contractor.maxProjectBudget!)}`}
                  </span>
                </div>
              )}
            </div>

            {/* Specialties */}
            {contractor.specialties.length > 0 && (
              <div className={styles.specialties}>
                {contractor.specialties.slice(0, 4).map((specialty, index) => (
                  <Tag key={index} className={styles.specialtyTag}>
                    {specialty}
                  </Tag>
                ))}
                {contractor.specialties.length > 4 && (
                  <Tag className={styles.moreTag}>
                    +{contractor.specialties.length - 4} khác
                  </Tag>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className={styles.actionButtons}>
              <div className={styles.primaryActions}>
                <Tooltip title="Xem chi tiết">
                  <Button
                    icon={<EyeOutlined />}
                    className={styles.actionBtn}
                    onClick={(e) => {
                      e.preventDefault();
                      router.push(`/view-contractors/${contractor.id}`);
                    }}
                  />
                </Tooltip>
                <Tooltip title="Chia sẻ">
                  <Button
                    icon={<ShareAltOutlined />}
                    className={styles.actionBtn}
                    onClick={handleShare}
                  />
                </Tooltip>
                {user?.role === UserRole.Homeowner && (
                  <Tooltip title="Gửi Quote">
                    <Button
                      icon={<SendOutlined />}
                      className={styles.actionBtn}
                      onClick={handleSendQuote}
                    />
                  </Tooltip>
                )}
                <Tooltip title="Liên hệ">
                  <Button
                    type="primary"
                    icon={<MessageOutlined />}
                    className={styles.contactBtn}
                    onClick={handleContact}
                  />
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Badge.Ribbon>

    {/* Quote Send Modal */}
    <QuoteSendModal
      isOpen={showSendQuoteModal}
      onClose={() => setShowSendQuoteModal(false)}
      onSuccess={handleQuoteSent}
      sendToAll={false}
      contractorId={contractor.id}
      contractorName={contractor.companyName}
    />
    </>
  );
};

export default ContractorCard;
