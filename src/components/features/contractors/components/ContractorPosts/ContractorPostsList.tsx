"use client";

import React, { useEffect, useRef } from "react";
import { Empty, Skeleton, Space } from "antd";
import { ContractorPost } from "@/lib/contractors/contractor-posts.types";
import ContractorPostCard from "./ContractorPostCard";
import { gsap } from "gsap";
import styles from "./ContractorPosts.module.scss";

interface ContractorPostsListProps {
  posts: ContractorPost[];
  loading?: boolean;
  canManage?: boolean;
  onDelete?: (postId: string) => Promise<void>;
  contractorName?: string;
  contractorAvatar?: string;
}

const ContractorPostsList: React.FC<ContractorPostsListProps> = ({
  posts,
  loading,
  canManage,
  onDelete,
  contractorName,
  contractorAvatar,
}) => {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && posts.length > 0 && listRef.current) {
      const cards = listRef.current.querySelectorAll(
        `.${styles.postCardWrapper}`
      );

      gsap.fromTo(
        cards,
        {
          opacity: 0,
          y: 30,
          scale: 0.95,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
        }
      );
    }
  }, [loading, posts.length]);

  if (loading) {
    return (
      <div className={styles.postsContainer}>
        <Space direction="vertical" style={{ width: "100%" }} size={16}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.skeletonCard}>
              <Skeleton avatar active paragraph={{ rows: 4 }} />
            </div>
          ))}
        </Space>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <Empty
          description="Chưa có bài đăng nào"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  return (
    <div className={styles.postsContainer} ref={listRef}>
      {posts.map((post) => (
        <div key={post.id} className={styles.postCardWrapper}>
          <ContractorPostCard
            post={post}
            canManage={canManage}
            onDelete={onDelete}
            contractorName={contractorName}
            contractorAvatar={contractorAvatar}
          />
        </div>
      ))}
    </div>
  );
};

export default ContractorPostsList;
