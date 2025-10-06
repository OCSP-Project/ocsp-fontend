// src/app/chat/page.tsx
import dynamic from "next/dynamic";

const ChatMessengerList = dynamic(
  () => import("@/components/features/chat/components/ChatMessengerList"),
  { ssr: false }
);

export const metadata = {
  title: "Tin nhắn | OCSP",
  description: "Quản lý tin nhắn và cuộc hội thoại",
};

export default function ChatPage() {
  return <ChatMessengerList />;
}
