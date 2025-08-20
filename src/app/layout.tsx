import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
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
    <html lang="vi ">
      <body>
        <div className={inter.className}>{children}</div>
        <AIChatAssistant />
      </body>
    </html>
  );
}
