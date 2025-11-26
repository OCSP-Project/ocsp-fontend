// src/app/(dashboard)/admin/users/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";

const AdminUserDetailPage = () => {
  const params = useParams();
  const userId = params.id as string;

  return (
    <div>
      <h1>Chi tiet nguoi dung #{userId}</h1>
      <p>Trang quan tri chi tiet nguoi dung - Coming soon</p>
    </div>
  );
};

export default AdminUserDetailPage;
