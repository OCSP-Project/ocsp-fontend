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
├── .env.local # Biến môi trường thực (không commit)
├── .env.example # Template biến môi trường
├── .gitignore # File/folder bỏ qua khi commit
├── next.config.js # Cấu hình Next.js (alias, API routes, images...)
├── tailwind.config.js # Cấu hình Tailwind CSS (theme, colors, breakpoints...)
├── tsconfig.json # Cấu hình TypeScript (types, paths, compiler options...)
├── package.json # Dependencies & scripts
├── README.md # Tài liệu dự án
│
├── public/ # 📂 Static assets (truy cập trực tiếp qua URL)
│ ├── icons/ # SVG icons, favicons
│ ├── images/ # Ảnh tĩnh cho UI
│ │ ├── page/ # Ảnh cho từng trang cụ thể
│ │ │ └── homePage/ # Ảnh riêng cho home page
│ │ │ ├── bgHome.png
│ │ │ └── layout1.png
│ │ ├── projects/ # Ảnh dự án (project1.jpg - project6.jpg)
│ │ ├── about/ # Ảnh about section (construction1.jpg, construction2.jpg)
│ │ ├── avatars/ # Avatar người dùng
│ │ └── vision/ # Ảnh tầm nhìn (city-view.jpg)
│ └── favicon.ico # Icon tab trình duyệt
│
├── types/ # 📂 TypeScript type definitions
│ ├── sass.d.ts # Types cho SCSS modules
│ ├── gsap.d.ts # Types cho GSAP animations
│ └── global.d.ts # Global types & interface extensions
│
├── src/
│ ├── app/ # 📂 Next.js 14 App Router (pages & layouts)
│ │ ├── globals.css # CSS toàn cục
│ │ ├── layout.tsx # Root layout (wrapper cho toàn app)
│ │ ├── page.tsx # Trang chủ (/)
│ │ ├── loading.tsx # Loading UI component
│ │ ├── error.tsx # Error boundary UI
│ │ ├── not-found.tsx # 404 page
│ │ │
│ │ ├── (auth)/ # 📁 Route group: Authentication pages
│ │ │ ├── login/page.tsx # Trang đăng nhập
│ │ │ ├── register/page.tsx # Trang đăng ký
│ │ │ ├── forgot-password/page.tsx # Quên mật khẩu
│ │ │ ├── verify-email/page.tsx # Xác thực email
│ │ │ └── layout.tsx # Layout riêng cho auth pages
│ │ │
│ │ ├── (dashboard)/ # 📁 Route group: Protected dashboard
│ │ │ ├── layout.tsx # Layout cho dashboard (có sidebar)
│ │ │ │
│ │ │ ├── admin/ # ⚙️ Admin panel
│ │ │ │ ├── page.tsx # Dashboard admin
│ │ │ │ ├── projects/ # Quản lý dự án admin
│ │ │ │ │ ├── page.tsx # Danh sách dự án
│ │ │ │ │ └── [id]/page.tsx # Chi tiết dự án
│ │ │ │ ├── reports/ # Báo cáo hệ thống
│ │ │ │ │ ├── page.tsx # Danh sách báo cáo
│ │ │ │ │ └── [id]/page.tsx # Chi tiết báo cáo
│ │ │ │ └── users/ # Quản lý người dùng
│ │ │ │ ├── page.tsx # Danh sách người dùng
│ │ │ │ └── [id]/page.tsx # Chi tiết người dùng
│ │ │ │
│ │ │ ├── contractors/ # 👷 Contractor dashboard
│ │ │ │ ├── page.tsx # Dashboard contractor
│ │ │ │ ├── leads/ # Quản lý leads
│ │ │ │ │ ├── page.tsx # Danh sách leads
│ │ │ │ │ └── [id]/page.tsx # Chi tiết lead
│ │ │ │ └── projects/ # Dự án của contractor
│ │ │ │ ├── page.tsx # Danh sách dự án
│ │ │ │ └── [id]/ # Chi tiết dự án
│ │ │ │ ├── page.tsx # Tổng quan dự án
│ │ │ │ ├── team/page.tsx # Quản lý team
│ │ │ │ └── timeline/page.tsx # Timeline dự án
│ │ │ │
│ │ │ ├── supervisor/ # 👨‍💼 Supervisor dashboard
│ │ │ │ ├── page.tsx # Dashboard supervisor
│ │ │ │ ├── inspections/ # Giám sát công trình
│ │ │ │ │ ├── page.tsx # Danh sách inspections
│ │ │ │ │ └── [id]/ # Chi tiết inspection
│ │ │ │ │ ├── page.tsx # Tổng quan inspection
│ │ │ │ │ ├── chat/page.tsx # Chat inspection
│ │ │ │ │ ├── progress/page.tsx # Tiến độ
│ │ │ │ │ └── reports/page.tsx # Báo cáo
│ │ │ │ └── projects/ # Dự án giám sát
│ │ │ │ ├── page.tsx # Danh sách dự án
│ │ │ │ └── [id]/page.tsx # Chi tiết dự án
│ │ │ │
│ │ │ ├── projects/ # 🏗️ Project management (Homeowner)
│ │ │ │ ├── page.tsx # Danh sách dự án
│ │ │ │ ├── create/page.tsx # Tạo dự án mới
│ │ │ │ ├── ContractsSection.tsx # Section hợp đồng
│ │ │ │ ├── InvitesSection.tsx # Section mời thầu
│ │ │ │ ├── QuotesSection.tsx # Section báo giá
│ │ │ │ └── [id]/ # Dynamic route cho dự án cụ thể
│ │ │ │ ├── page.tsx # Chi tiết dự án
│ │ │ │ ├── chat/page.tsx # Chat dự án
│ │ │ │ ├── progress/page.tsx # Tiến độ dự án
│ │ │ │ └── reports/page.tsx # Báo cáo dự án
│ │ │ │
│ │ │ ├── profile/page.tsx # Trang profile người dùng
│ │ │ └── chat/ # Hệ thống chat tổng
│ │ │
│ │ ├── contractors/ # 📁 Public contractor pages
│ │ │ ├── page.tsx # Danh sách thầu xây dựng
│ │ │ ├── contractors.module.scss # Styles cho trang contractors
│ │ │ └── [id]/ # Profile thầu xây dựng
│ │ │ ├── page.tsx # Chi tiết contractor
│ │ │ └── contractor-detail.module.scss # Styles chi tiết
│ │ │
│ │ ├── supervisors/ # 📁 Public supervisor pages
│ │ │ ├── page.tsx # Danh sách giám sát viên
│ │ │ └── [id]/page.tsx # Profile giám sát viên
│ │ │
│ │ ├── about/ # 📁 Giới thiệu
│ │ ├── contact/ # 📁 Liên hệ
│ │ ├── news/ # 📁 Tin tức xây dựng
│ │ │
│ │ └── api/ # 📂 API routes (server-side endpoints)
│ │ ├── auth/ # API authentication
│ │ │ └── callback/route.ts # OAuth callback
│ │ ├── projects/ # API quản lý dự án
│ │ └── webhooks/ # Webhooks từ external services
│ │
│ ├── components/ # 📂 React Components (tái sử dụng)
│ │ │
│ │ ├── ui/ # 📁 Base UI Components (atomic design)
│ │ │ ├── Button/ # Button component với variants
│ │ │ │ ├── Button.tsx
│ │ │ │ ├── Button.module.scss
│ │ │ │ └── index.ts
│ │ │ ├── Input/ # Form inputs
│ │ │ ├── Modal/ # Modal dialogs
│ │ │ ├── Card/ # Card layouts
│ │ │ ├── Badge/ # Status badges
│ │ │ ├── Dropdown/ # Dropdown menus
│ │ │ ├── Tabs/ # Tab navigation
│ │ │ ├── Pagination/ # Pagination component
│ │ │ └── index.ts # Export tất cả UI components
│ │ │
│ │ ├── layout/ # 📁 Layout Components
│ │ │ ├── Header/ # Site header với navigation
│ │ │ │ ├── index.tsx
│ │ │ │ └── Header.module.scss
│ │ │ ├── Footer/ # Site footer
│ │ │ ├── Sidebar/ # Dashboard sidebar
│ │ │ ├── Navigation/ # Navigation components
│ │ │ ├── Breadcrumb/ # Breadcrumb navigation
│ │ │ └── ConditionalLayout/ # Layout có điều kiện
│ │ │ └── index.tsx
│ │ │
│ │ ├── features/ # 📁 Feature-based Components (business logic)
│ │ │ │
│ │ │ ├── home/ # 🏠 Home page feature
│ │ │ │ ├── components/ # Sub-components cho home
│ │ │ │ ├── HomePage.tsx # Main home page component
│ │ │ │ └── HomePage.module.scss
│ │ │ │
│ │ │ ├── auth/ # 🔐 Authentication feature
│ │ │ │ ├── components/
│ │ │ │ │ └── EmailVerificationPage.tsx # Trang xác thực email
│ │ │ │ ├── hooks/ # Auth-specific hooks
│ │ │ │ └── types/ # Auth types
│ │ │ │
│ │ │ ├── projects/ # 🏗️ Project management feature
│ │ │ │ ├── components/
│ │ │ │ ├── hooks/
│ │ │ │ └── types/
│ │ │ │
│ │ │ ├── contractors/ # 👷 Contractor management
│ │ │ │ ├── components/
│ │ │ │ │ ├── ContractorCard/ # Card hiển thị contractor
│ │ │ │ │ │ ├── ContractorCard.tsx
│ │ │ │ │ │ └── ContractorCard.module.scss
│ │ │ │ │ ├── ContractorList/ # Danh sách contractors
│ │ │ │ │ │ ├── ContractorList.tsx
│ │ │ │ │ │ └── ContractorList.module.scss
│ │ │ │ │ └── ContractorSearch/ # Tìm kiếm contractors
│ │ │ │ │ ├── ContractorSearch.tsx
│ │ │ │ │ └── ContractorSearch.module.scss
│ │ │ │ ├── hooks/
│ │ │ │ └── types/
│ │ │ │ └── contractor.types.ts
│ │ │ │
│ │ │ ├── supervisors/ # 👨‍💼 Supervisor management
│ │ │ │ ├── components/
│ │ │ │ │ ├── SupervisorList/ # Danh sách supervisors
│ │ │ │ │ │ └── SupervisorList.tsx
│ │ │ │ │ ├── SupervisorProfile/ # Profile supervisor
│ │ │ │ │ │ └── SupervisorProfile.tsx
│ │ │ │ │ └── SupervisorSearch/ # Tìm kiếm supervisors
│ │ │ │ │ └── SupervisorSearch.tsx
│ │ │ │ ├── hooks/
│ │ │ │ │ └── useSupervisors.ts
│ │ │ │ ├── index.ts # Export chính
│ │ │ │ └── types/
│ │ │ │ └── supervisor.types.ts
│ │ │ │
│ │ │ ├── payments/ # 💰 Payment system
│ │ │ │ ├── components/
│ │ │ │ ├── hooks/
│ │ │ │ └── types/
│ │ │ │
│ │ │ ├── chat/ # 💬 Communication system
│ │ │ │ ├── components/
│ │ │ │ ├── hooks/
│ │ │ │ └── types/
│ │ │ │
│ │ │ ├── ai-assistant/ # 🤖 AI Advisory system
│ │ │ │ ├── components/
│ │ │ │ ├── hooks/
│ │ │ │ └── types/
│ │ │ │
│ │ │ ├── admin/ # ⚙️ Admin panel features
│ │ │ │ ├── components/
│ │ │ │ ├── hooks/
│ │ │ │ └── types/
│ │ │ │
│ │ │ └── quotes/ # 💬 Quote management
│ │ │ ├── QuoteSendButton.tsx # Nút gửi quote
│ │ │ └── QuoteSendModal.tsx # Modal gửi quote
│ │ │
│ │ └── shared/ # 📁 Shared Components (dùng chung)
│ │ ├── AIChatAssistant/ # AI chat assistant
│ │ │ ├── index.tsx
│ │ │ └── AIChatAssistant.module.scss
│ │ ├── LoadingSpinner/ # Loading indicators
│ │ ├── ErrorBoundary/ # Error handling
│ │ ├── SEOHead/ # SEO meta tags
│ │ ├── ConfirmDialog/ # Confirmation dialogs
│ │ ├── EmptyState/ # Empty state illustrations
│ │ └── ProtectedRoute/ # Route protection
│ │
│ ├── hooks/ # 📂 Global Custom Hooks
│ │ ├── useAuth.ts # Authentication state
│ │ ├── useDebounce.ts # Input debouncing
│ │ └── useProjects.ts # Project management hooks
│ │
│ ├── lib/ # 📂 Libraries & Utilities
│ │ │
│ │ ├── api/ # 🌐 API Client Configuration
│ │ │ ├── client.ts # Axios instance với interceptors
│ │ │ ├── contractors.ts # Contractor APIs
│ │ │ └── supervisors.ts # Supervisor APIs
│ │ │
│ │ ├── auth/ # 🔐 Authentication Logic
│ │ │ ├── auth.api.ts # Authentication APIs
│ │ │ └── permissions.ts # Role-based permissions
│ │ │
│ │ ├── websocket/ # 🔄 Real-time Communication
│ │ │ └── signalr-client.ts # SignalR client
│ │ │
│ │ ├── contracts/ # 📋 Contract management
│ │ │ └── contracts.api.ts # Contract APIs
│ │ │
│ │ ├── profile/ # 👤 Profile management
│ │ │ └── profile.api.ts # Profile APIs
│ │ │
│ │ ├── projects/ # 🏗️ Project management
│ │ │ ├── project.types.ts # Project type definitions
│ │ │ └── projects.api.ts # Project APIs
│ │ │
│ │ ├── proposals/ # 📝 Proposal management
│ │ │ ├── proposal.types.ts # Proposal types
│ │ │ ├── proposals.api.ts # Proposal APIs
│ │ │ └── proposals.homeowner.api.ts # Homeowner proposal APIs
│ │ │
│ │ ├── quotes/ # 💰 Quote management
│ │ │ ├── quote.types.ts # Quote types
│ │ │ ├── quotes.api.ts # Quote APIs
│ │ │ └── quotes.contractor.api.ts # Contractor quote APIs
│ │ │
│ │ ├── utils/ # 🛠️ Utility Functions
│ │ │ └── constants.ts # App constants
│ │ │
│ │ ├── animations/ # 🎬 GSAP Animation Library
│ │ │
│ │ └── config/ # ⚙️ Configuration
│ │
│ ├── providers/ # 📂 React Context Providers
│ │ ├── AuthProvider.tsx # Authentication context
│ │ └── index.ts # Export providers
│ │
│ ├── store/ # 📂 State Management (Zustand)
│ │ └── contractor-store.ts # Contractor data state
│ │
│ ├── styles/ # 📂 Styling (SCSS + Tailwind)
│ │ ├── variables.scss # SCSS variables (colors, spacing, etc.)
│ │ ├── components/ # Component-specific styles
│ │ └── pages/ # Page-specific styles
│ │ ├── EmailVerificationPage.module.scss
│ │ ├── ForgotPasswordPage.module.scss
│ │ ├── LoginPage.module.scss
│ │ └── RegisterPage.module.scss
│ │
│ └── middleware.ts # 🛡️ Next.js Middleware (route protection, redirects)
│
├── docs/ # 📂 Documentation
│ ├── API.md # API documentation
│ ├── DEPLOYMENT.md # Deployment guide
│ └── ARCHITECTURE.md # System architecture
│
└── tests/ # 📂 Testing
├── components/ # Component tests
├── hooks/ # Hook tests
├── utils/ # Utility function tests
├── pages/ # Page tests
├── setup.ts # Test configuration
└── **mocks**/ # Mock files
