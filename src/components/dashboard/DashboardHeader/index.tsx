// src/components/dashboard/DashboardHeader/index.tsx
"use client";

import React from "react";
import {
  Layout,
  Button,
  Space,
  Typography,
  Dropdown,
  Menu,
  Avatar,
} from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { User } from "@/hooks/useAuth";
import { getRoleName, getRoleColor } from "@/lib/utils/roleRouting";
import styles from "./DashboardHeader.module.scss";

const { Header } = Layout;
const { Text } = Typography;

interface DashboardHeaderProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  user: User;
  onLogout: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  collapsed,
  onToggleCollapse,
  user,
  onLogout,
}) => {
  const router = useRouter();

  const userMenu = (
    <Menu>
      <Menu.Item
        key="profile"
        icon={<UserOutlined />}
        onClick={() => router.push("/profile")}
      >
        Hồ sơ cá nhân
      </Menu.Item>
      <Menu.Item
        key="settings"
        icon={<SettingOutlined />}
        onClick={() => router.push("/settings")}
      >
        Cài đặt
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={onLogout}>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  return (
    <Header className={styles.header}>
      <div className={styles.headerLeft}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggleCollapse}
          className={styles.collapseButton}
        />

        <div className={styles.breadcrumb}>
          <Text className={styles.roleTitle}>
            {getRoleName(user.role)} Dashboard
          </Text>
        </div>
      </div>

      <div className={styles.headerRight}>
        <Space size="large">
          <Button
            type="text"
            icon={<BellOutlined />}
            className={styles.notificationBtn}
          />

          <Dropdown overlay={userMenu} placement="bottomRight">
            <div className={styles.userInfo}>
              <Avatar
                style={{ backgroundColor: getRoleColor(user.role) }}
                size="default"
              >
                {user.username.slice(0, 2).toUpperCase()}
              </Avatar>
              {!collapsed && (
                <div className={styles.userDetails}>
                  <Text strong className={styles.userName}>
                    {user.username}
                  </Text>
                  <Text type="secondary" className={styles.userRole}>
                    {getRoleName(user.role)}
                  </Text>
                </div>
              )}
            </div>
          </Dropdown>
        </Space>
      </div>
    </Header>
  );
};

export default DashboardHeader;
