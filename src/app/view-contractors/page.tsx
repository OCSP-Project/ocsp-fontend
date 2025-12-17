// src/app/contractors/page.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import { Breadcrumb, Typography, Space, Button, FloatButton, Card } from "antd";
import {
  HomeOutlined,
  TeamOutlined,
  CustomerServiceOutlined,
  SendOutlined,
  RocketOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { gsap } from "gsap";
import Link from "next/link";
import ContractorSearch from "@/./components/features/contractors/components/ContractorSearch/ContractorSearch";
import ContractorList from "@/./components/features/contractors/components/ContractorList/ContractorList";
import QuoteSendModal from "@/./components/features/quotes/QuoteSendModal";
import { useAuth, UserRole } from "@/hooks/useAuth";
import styles from "./contractors.module.scss";

const { Title, Paragraph } = Typography;

const ContractorsPage: React.FC = () => {
  const { user } = useAuth();
  const [favoriteContractors, setFavoriteContractors] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [showSendToAllModal, setShowSendToAllModal] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    // Load favorite contractors from localStorage
    const saved = localStorage.getItem("favoriteContractors");
    if (saved) {
      setFavoriteContractors(JSON.parse(saved));
    }

    // Simple page entrance animation
    const tl = gsap.timeline();

    tl.fromTo(
      ".page-header",
      { opacity: 0, y: -30 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
    )
      .fromTo(
        ".search-section",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
        "-=0.4"
      )
      .fromTo(
        ".list-section",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
        "-=0.2"
      );
  }, []);

  const handleFavorite = (contractorId: string) => {
    let newFavorites: string[];

    if (favoriteContractors.includes(contractorId)) {
      newFavorites = favoriteContractors.filter((id) => id !== contractorId);
    } else {
      newFavorites = [...favoriteContractors, contractorId];
    }

    setFavoriteContractors(newFavorites);
    localStorage.setItem("favoriteContractors", JSON.stringify(newFavorites));

    // Show toast notification (you can implement this)
    // toast.success(
    //   favoriteContractors.includes(contractorId)
    //     ? 'Đã xóa khỏi danh sách yêu thích'
    //     : 'Đã thêm vào danh sách yêu thích'
    // );
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!mounted) {
    return <div style={{ minHeight: "100vh" }} />; // Prevent hydration mismatch
  }

  return (
    <div className={styles.contractorsPage}>
      <div className={styles.content}>
        {/* Breadcrumb */}
        <div className="page-header">
          <Breadcrumb
            className={styles.breadcrumb}
            items={[
              {
                title: (
                  <Link href="/">
                    <HomeOutlined />
                    <span>Trang chủ</span>
                  </Link>
                ),
              },
              {
                title: (
                  <>
                    <TeamOutlined />
                    <span>Nhà thầu</span>
                  </>
                ),
              },
            ]}
          />

          {/* Hero Section */}
          <div className={styles.pageHeader} ref={heroRef}>
            <div className={styles.headerContent}>
              <div className={styles.titleSection}>
                <div className="hero-title">
                  <Title level={1} className={styles.pageTitle}>
                    <span className={styles.titleGradient}>
                      Tìm kiếm nhà thầu
                    </span>
                    <span className={styles.titleAccent}>chuyên nghiệp</span>
                  </Title>
                </div>
                <div className="hero-description">
                  <Paragraph className={styles.pageDescription}>
                    Kết nối với các nhà thầu uy tín và chuyên nghiệp tại Đà
                    Nẵng. Tìm kiếm theo chuyên môn, khu vực và ngân sách phù hợp
                    với dự án của bạn.
                  </Paragraph>
                </div>
              </div>

              {user?.role === UserRole.Homeowner && (
                <div className={`${styles.headerActions} hero-actions`}>
                  <Space size="middle" wrap>
                    <Button
                      type="primary"
                      size="large"
                      icon={<ThunderboltOutlined />}
                      className={styles.actionButton}
                    >
                      <Link href="/ai-assistant">Tư vấn AI</Link>
                    </Button>
                    <Button size="large" ghost className={styles.actionButton}>
                      <Link href="/dashboard/projects/create">Đăng dự án</Link>
                    </Button>
                    <Button
                      type="primary"
                      size="large"
                      icon={<SendOutlined />}
                      onClick={() => setShowSendToAllModal(true)}
                      className={styles.actionButton}
                    >
                      Gửi Quote đến Tất cả
                    </Button>
                  </Space>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Search Section */}
        <div className="search-section">
          <div className={styles.searchSection}>
            <Card className={styles.searchCard} bordered={false}>
              <ContractorSearch
                showAdvancedFilters={true}
                onSearch={() => {
                  // Scroll to results
                  document.querySelector(".list-section")?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }}
              />
            </Card>
          </div>
        </div>

        {/* Results Section */}
        <div className="list-section">
          <div className={styles.listSection}>
            <ContractorList
              showPagination={true}
              itemsPerRow={{
                xs: 1,
                sm: 1,
                md: 1,
                lg: 2,
                xl: 2,
              }}
              favoriteContractors={favoriteContractors}
              onFavorite={handleFavorite}
            />
          </div>
        </div>

        {/* Float Actions */}
        <FloatButton.Group
          trigger="hover"
          type="primary"
          className={styles.floatButtonGroup}
          style={{ right: 24 }}
        >
          <FloatButton
            tooltip="Lên đầu trang"
            onClick={scrollToTop}
            icon={<RocketOutlined />}
          />
          {user?.role === UserRole.Homeowner && (
            <FloatButton
              tooltip="Tư vấn AI"
              icon={<CustomerServiceOutlined />}
              onClick={() => window.open("/ai-assistant", "_blank")}
            />
          )}
        </FloatButton.Group>
      </div>

      {/* Quote Send Modal */}
      <QuoteSendModal
        isOpen={showSendToAllModal}
        onClose={() => setShowSendToAllModal(false)}
        onSuccess={() => {
          // Refresh contractor list or show success message
          console.log("Quote sent successfully");
        }}
        sendToAll={true}
      />
    </div>
  );
};

export default ContractorsPage;
