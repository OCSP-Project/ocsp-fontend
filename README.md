# OCSP Frontend (Next.js 14 + App Router)

## Quick start

```bash
npm i
npm run dev
# open http://localhost:3000
```

> Gợi ý: copy `.env.example` thành `.env.local` và sửa giá trị khi có backend thực.

## Scripts

- `npm run dev` – chạy development
- `npm run build` – build production
- `npm run start` – chạy production server
- `npm run type-check` – kiểm tra TypeScript

## Notes

- Cấu trúc đã khởi tạo đủ để chạy trang chủ, auth, dashboard rỗng.
- Đã cấu hình Tailwind, SCSS Modules, alias `@` -> `src/`.

ocsp-frontend/
├── .env.local # File chứa biến môi trường thật (dùng khi chạy dev)
├── .env.example # File mẫu biến môi trường để tham khảo
├── .gitignore # Danh sách file/thư mục sẽ bị bỏ qua khi commit lên git
├── next.config.js # Cấu hình Next.js (alias, rewrite API, hình ảnh...)
├── tailwind.config.js # Cấu hình Tailwind CSS (theme, màu sắc, responsive...)
├── tsconfig.json # Cấu hình TypeScript (kiểu dữ liệu, alias...)
├── package.json # Thông tin dự án & danh sách thư viện
├── README.md # Tài liệu giới thiệu & hướng dẫn chạy dự án
│
├── public/ # Chứa file tĩnh (ảnh, icon, favicon...) - tải trực tiếp
│ ├── icons/ # Nơi lưu các biểu tượng SVG/PNG
│ ├── images/ # Nơi lưu ảnh tĩnh cho UI
│ └── favicon.ico # Icon hiển thị trên tab trình duyệt
│
├── types/ # Nơi định nghĩa type/interface TypeScript
│ ├── sass.d.ts # Kiểu dữ liệu cho file SCSS
│ ├── gsap.d.ts # Kiểu dữ liệu cho thư viện GSAP
│ └── global.d.ts # Biến toàn cục & mở rộng interface mặc định
│
├── src/
│ ├── app/ # "App Router" của Next.js 13+ (quản lý page, layout)
│ │ ├── globals.css # CSS toàn cục
│ │ ├── layout.tsx # Layout gốc, bao quanh toàn bộ trang
│ │ ├── page.tsx # Trang chủ (/)
│ │ ├── loading.tsx # UI hiển thị khi đang tải
│ │ ├── error.tsx # UI hiển thị khi lỗi
│ │ ├── not-found.tsx # UI 404 khi không tìm thấy trang
│ │ ├── (auth)/ # Nhóm route cho đăng nhập/đăng ký
│ │ │ ├── login/page.tsx
│ │ │ ├── register/page.tsx
│ │ │ └── layout.tsx
│ │ ├── (dashboard)/ # Nhóm route cho bảng điều khiển (sau khi đăng nhập)
│ │ │ ├── dashboard/page.tsx
│ │ │ ├── projects/... # Các trang quản lý dự án
│ │ │ └── layout.tsx
│ │ └── api/ # API routes nội bộ (chạy trên server Next.js)
│ │ └── auth/callback/route.ts
│ │
│ ├── components/ # Các thành phần UI tái sử dụng
│ │ ├── ui/ # Thành phần giao diện cơ bản (Button, Input, Modal...)
│ │ ├── layout/ # Thành phần bố cục (Header, Sidebar, Footer...)
│ │ ├── auth/ # Thành phần liên quan đến đăng nhập/đăng ký
│ │ ├── project/ # Thành phần hiển thị dữ liệu dự án
│ │ └── shared/ # Thành phần dùng chung (LoadingSpinner, SEOHead...)
│ │
│ ├── hooks/ # Custom hooks (tái sử dụng logic React)
│ │ ├── useAuth.ts # Xử lý trạng thái đăng nhập
│ │ ├── useProjects.ts # Gọi API & lưu dữ liệu dự án
│ │ └── useWebSocket.ts # Kết nối realtime
│ │
│ ├── lib/ # Thư viện & tiện ích dùng chung
│ │ ├── api/ # API client (Axios)
│ │ ├── auth/ # Hàm xử lý xác thực & phân quyền
│ │ ├── websocket/ # Client SignalR/WebSocket
│ │ ├── utils/ # Hàm tiện ích (format, validate, date...)
│ │ └── animations/ # Animation bằng GSAP
│ │
│ ├── store/ # State management (Zustand)
│ │ ├── auth-store.ts # Lưu & xử lý trạng thái đăng nhập
│ │ ├── project-store.ts # Lưu & xử lý dữ liệu dự án
│ │ └── ui-store.ts # Lưu trạng thái UI (sidebar mở/đóng, theme...)
│ │
│ ├── styles/ # SCSS & Tailwind styles
│ │ ├── globals.scss # SCSS toàn cục
│ │ ├── variables.scss # Biến SCSS (màu, kích thước...)
│ │ └── components/ # SCSS riêng cho từng component
│ │
│ └── middleware.ts # Middleware chặn route, bảo vệ trang private
│
├── docs/ # Tài liệu nội bộ (API, triển khai, kiến trúc)
│ ├── API.md
│ ├── DEPLOYMENT.md
│ └── ARCHITECTURE.md
│
└── tests/ # Test code
├── components/ # Test component UI
├── hooks/ # Test custom hook
├── utils/ # Test hàm tiện ích
└── setup.ts # Cấu hình chung cho test
