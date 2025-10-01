// src/components/layout/ConditionalLayout/index.tsx
"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import AIChatAssistant from "@/components/shared/AIChatAssistant";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

const ConditionalLayout: React.FC<ConditionalLayoutProps> = ({ children }) => {
  const pathname = usePathname();

  // Define routes that should not show header
  const noHeaderRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password", // Auth routes
    "/admin",
    "/supervisor",
    "/contractor",
    "/homeowner", // Dashboard routes
  ];

  const shouldShowHeader = !noHeaderRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!shouldShowHeader) {
    // Auth pages and Dashboard pages - no header, no padding, no chat assistant
    return <>{children}</>;
  }

  // Regular pages - with header and chat assistant
  return (
    <>
      <Header />
      <main style={{ paddingTop: "80px" }}>{children}</main>
      <AIChatAssistant />
    </>
  );
};

export default ConditionalLayout;
