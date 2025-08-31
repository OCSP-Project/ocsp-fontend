// src/features/contractors/components/ContractorList/ContractorList.tsx
import React, { useEffect, useState, useRef } from "react";
import { Row, Col, Button, Empty, Spin, Alert, Pagination } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useContractorStore } from "@/./store/contractor-store";
import ContractorCard from "../ContractorCard/ContractorCard";
import styles from "./ContractorList.module.scss";

gsap.registerPlugin(ScrollTrigger);

interface ContractorListProps {
  showPagination?: boolean;
  itemsPerRow?: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  favoriteContractors?: string[];
  onFavorite?: (contractorId: string) => void;
}

const ContractorList: React.FC<ContractorListProps> = ({
  showPagination = true,
  itemsPerRow = {
    xs: 1,
    sm: 2,
    md: 2,
    lg: 3,
    xl: 4,
  },
  favoriteContractors = [],
  onFavorite,
}) => {
  const {
    contractors,
    pagination,
    searchLoading,
    loading,
    error,
    searchContractors,
    setPage,
    clearError,
  } = useContractorStore();

  const listRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (contractors.length === 0 && !loading && !searchLoading) {
      searchContractors();
    }
  }, []);

  useEffect(() => {
    if (!mounted || contractors.length === 0) return;

    // Animate list container
    const listElement = listRef.current;
    if (listElement) {
      gsap.fromTo(
        listElement,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );
    }
  }, [contractors.length, mounted]);

  const handlePageChange = (page: number) => {
    setPage(page);
    searchContractors();

    // Smooth scroll to top of list
    listRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleRetry = () => {
    clearError();
    searchContractors();
  };

  const getColSpan = () => {
    return {
      xs: 24 / itemsPerRow.xs,
      sm: 24 / itemsPerRow.sm,
      md: 24 / itemsPerRow.md,
      lg: 24 / itemsPerRow.lg,
      xl: 24 / itemsPerRow.xl,
    };
  };

  if (error) {
    return (
      <Alert
        message="Lỗi tải dữ liệu"
        description={error}
        type="error"
        showIcon
        className={styles.errorAlert}
        action={
          <Button size="small" icon={<ReloadOutlined />} onClick={handleRetry}>
            Thử lại
          </Button>
        }
      />
    );
  }

  if (searchLoading && contractors.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" tip="Đang tìm kiếm nhà thầu...">
          <div style={{ height: 200 }} />
        </Spin>
      </div>
    );
  }

  if (!searchLoading && contractors.length === 0) {
    return (
      <Empty
        className={styles.emptyState}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <div>
            <p>Không tìm thấy nhà thầu phù hợp</p>
            <p className={styles.emptySubtext}>
              Thử điều chỉnh bộ lọc tìm kiếm hoặc mở rộng khu vực tìm kiếm
            </p>
          </div>
        }
      />
    );
  }

  return (
    <div className={styles.contractorList} ref={listRef}>
      {/* Results Summary */}
      <div className={styles.resultsSummary}>
        <span className={styles.resultsCount}>
          Tìm thấy {pagination.totalCount.toLocaleString()} nhà thầu
          {pagination.totalPages > 1 && (
            <>
              {" "}
              - Trang {pagination.page} / {pagination.totalPages}
            </>
          )}
        </span>
        {searchLoading && (
          <span className={styles.loadingIndicator}>
            <Spin size="small" /> Đang tải...
          </span>
        )}
      </div>

      {/* Contractor Grid */}
      <Row gutter={[16, 24]} className={styles.contractorGrid}>
        {contractors.map((contractor, index) => (
          <Col key={contractor.id} {...getColSpan()}>
            <ContractorCard
              contractor={contractor}
              onFavorite={onFavorite}
              isFavorited={favoriteContractors.includes(contractor.id)}
              showAnimation={true}
              animationDelay={index * 0.1}
            />
          </Col>
        ))}
      </Row>

      {/* Pagination */}
      {showPagination && pagination.totalPages > 1 && (
        <div className={styles.paginationContainer}>
          <Pagination
            current={pagination.page}
            total={pagination.totalCount}
            pageSize={pagination.pageSize}
            onChange={handlePageChange}
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} của ${total.toLocaleString()} nhà thầu`
            }
            showSizeChanger={false}
            showQuickJumper={pagination.totalPages > 10}
            className={styles.pagination}
          />
        </div>
      )}

      {/* Loading overlay for page changes */}
      {searchLoading && contractors.length > 0 && (
        <div className={styles.loadingOverlay}>
          <Spin size="large" />
        </div>
      )}
    </div>
  );
};

export default ContractorList;
