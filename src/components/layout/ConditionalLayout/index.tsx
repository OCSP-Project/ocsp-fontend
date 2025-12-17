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
  // Note: Use exact match or more specific paths to avoid matching similar routes
  const noHeaderRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password", // Auth routes
    "/admin",
    "/supervisor", // Dashboard route (not /supervisors which is the public list)
    "/contractor",
    "/homeowner", // Dashboard routes
  ];

  // Check if pathname matches any noHeaderRoute
  // For dashboard routes, check exact match or starts with route + "/" to avoid matching similar routes
  const shouldShowHeader = !noHeaderRoutes.some((route) => {
    // Exact match for auth routes
    if (
      route === "/login" ||
      route === "/register" ||
      route === "/forgot-password" ||
      route === "/reset-password"
    ) {
      return pathname === route;
    }
    // For dashboard routes, match if pathname starts with route and is followed by "/" or end of string
    // This prevents "/supervisor" from matching "/supervisors"
    return pathname === route || pathname.startsWith(route + "/");
  });

  if (!shouldShowHeader) {
    // Auth pages and Dashboard pages - no header, no padding, no chat assistant
    return <>{children}</>;
  }

  // Regular pages - with header
  // Only show chat assistant on home page
  const isHomePage = pathname === "/";

  return (
    <>
      <Header />
      <main style={{ paddingTop: "80px" }}>{children}</main>
      {isHomePage && <AIChatAssistant />}
    </>
  );
};

export default ConditionalLayout;
