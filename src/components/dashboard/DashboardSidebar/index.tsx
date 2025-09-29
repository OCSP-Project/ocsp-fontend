// src/components/dashboard/DashboardSidebar/index.tsx
"use client";

import React from "react";
import { Layout, Menu } from "antd";
import { useRouter, usePathname } from "next/navigation";
import {
  DashboardOutlined,
  UserOutlined,
  ProjectOutlined,
  SettingOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { UserRole } from "@/hooks/useAuth";
import styles from "./DashboardSidebar.module.scss";

const { Sider } = Layout;

interface DashboardSidebarProps {
  collapsed: boolean;
  userRole: UserRole;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  collapsed,
  userRole,
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const getMenuItems = () => {
    const baseItems = [
      {
        key: "profile",
        icon: <UserOutlined />,
        label: "Hồ sơ",
        onClick: () => router.push("/profile"),
      },
      {
        key: "settings",
        icon: <SettingOutlined />,
        label: "Cài đặt",
        onClick: () => router.push("/settings"),
      },
    ];

    switch (userRole) {
      case UserRole.Admin:
        return [
          {
            key: "/admin",
            icon: <DashboardOutlined />,
            label: "Tổng quan",
            onClick: () => router.push("/admin"),
          },
          {
            key: "/admin/users",
            icon: <UserOutlined />,
            label: "Người dùng",
            onClick: () => router.push("/admin/users"),
          },
          {
            key: "/admin/projects",
            icon: <ProjectOutlined />,
            label: "Dự án",
            onClick: () => router.push("/admin/projects"),
          },
          ...baseItems,
        ];

      case UserRole.Supervisor:
        return [
          {
            key: "/supervisor",
            icon: <SafetyCertificateOutlined />,
            label: "Dashboard",
            onClick: () => router.push("/supervisor"),
          },
          {
            key: "/supervisor/inspections",
            icon: <SafetyCertificateOutlined />,
            label: "Kiểm tra",
            onClick: () => router.push("/supervisor/inspections"),
          },
          {
            key: "/supervisor/reports",
            icon: <FileTextOutlined />,
            label: "Báo cáo",
            onClick: () => router.push("/supervisor/reports"),
          },
          ...baseItems,
        ];

      case UserRole.Contractor:
        return [
          {
            key: "/contractor",
            icon: <TeamOutlined />,
            label: "Dashboard",
            onClick: () => router.push("/contractor"),
          },
          {
            key: "/contractor/projects",
            icon: <ProjectOutlined />,
            label: "Dự án",
            onClick: () => router.push("/contractor/projects"),
          },
          {
            key: "/contractor/team",
            icon: <TeamOutlined />,
            label: "Đội ngũ",
            onClick: () => router.push("/contractor/team"),
          },
          ...baseItems,
        ];

      default:
        return baseItems;
    }
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      className={styles.sidebar}
      theme="dark"
    >
      <div className={styles.logo}>
        <span className={styles.logoText}>OCSP</span>
        {!collapsed && <span className={styles.logoSubtext}>CONSTRUCTION</span>}
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[pathname]}
        items={getMenuItems()}
        className={styles.sidebarMenu}
      />
    </Sider>
  );
};

export default DashboardSidebar;
