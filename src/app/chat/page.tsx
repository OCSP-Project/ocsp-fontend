// src/app/chat/page.tsx
import dynamic from "next/dynamic";

// Tắt SSR cho client component (có hook, window, v.v.)
const ChatPageClient = dynamic(
  () => import("@/components/features/chat/components/ChatPageClient"),
  { ssr: false }
);

export const metadata = {
  title: "Chat | OCSP",
};

export default function ChatPage() {
  return <ChatPageClient />;
}
