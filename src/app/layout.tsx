import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/layout/Header";
import AIChatAssistant from "@/components/shared/AIChatAssistant";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || "OCSP",
  description: "Nền tảng kết nối xây dựng thông minh",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <div className={inter.className}>
          <Header />
          <main style={{ paddingTop: "80px" }}>{children}</main>
        </div>
        <AIChatAssistant />
      </body>
    </html>
  );
}
