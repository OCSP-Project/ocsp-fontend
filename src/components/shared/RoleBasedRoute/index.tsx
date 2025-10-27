// src/components/shared/RoleBasedRoute/index.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/providers";
import { UserRole } from "@/hooks/useAuth";
import { Spin } from "antd";

interface RoleBasedRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  redirectTo?: string;
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  allowedRoles,
  children,
  redirectTo = "/",
}) => {
  const { user, isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }

      if (user && !allowedRoles.includes(user.role)) {
        router.push(redirectTo);
        return;
      }
    }
  }, [isAuthenticated, user, isLoading, allowedRoles, redirectTo, router]);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated || (user && !allowedRoles.includes(user.role))) {
    return null;
  }

  return <>{children}</>;
};

export default RoleBasedRoute;
