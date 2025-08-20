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
│ │ ├── projects/ # Ảnh dự án
│ │ ├── about/ # Ảnh about section
│ │ └── avatars/ # Avatar người dùng
│ └── favicon.ico # Icon tab trình duyệt
│
├── types/ # 📂 TypeScript type definitions
│ ├── sass.d.ts # Types cho SCSS modules
│ ├── gsap.d.ts # Types cho GSAP animations
│ ├── api.d.ts # Types cho API responses
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
│ │ │ └── layout.tsx # Layout riêng cho auth pages
│ │ │
│ │ ├── (dashboard)/ # 📁 Route group: Protected dashboard
│ │ │ ├── dashboard/page.tsx # Trang dashboard chính
│ │ │ ├── projects/ # Quản lý dự án
│ │ │ │ ├── page.tsx # Danh sách dự án
│ │ │ │ ├── create/page.tsx # Tạo dự án mới
│ │ │ │ └── [id]/ # Dynamic route cho dự án cụ thể
│ │ │ │ ├── page.tsx # Chi tiết dự án
│ │ │ │ └── edit/page.tsx # Chỉnh sửa dự án
│ │ │ ├── contractors/ # Quản lý thầu xây dựng
│ │ │ ├── supervisors/ # Quản lý giám sát viên
│ │ │ ├── payments/ # Quản lý thanh toán
│ │ │ ├── chat/ # Hệ thống chat
│ │ │ └── layout.tsx # Layout cho dashboard (có sidebar)
│ │ │
│ │ ├── contractors/ # 📁 Public contractor pages
│ │ │ ├── page.tsx # Danh sách thầu xây dựng
│ │ │ └── [id]/page.tsx # Profile thầu xây dựng
│ │ │
│ │ ├── supervisors/ # 📁 Public supervisor pages
│ │ ├── news/ # 📁 Tin tức xây dựng
│ │ ├── about/ # 📁 Giới thiệu
│ │ ├── contact/ # 📁 Liên hệ
│ │ │
│ │ └── api/ # 📂 API routes (server-side endpoints)
│ │ ├── auth/ # API authentication
│ │ ├── projects/ # API quản lý dự án
│ │ └── webhooks/ # Webhooks từ external services
│ │
│ ├── components/ # 📂 React Components (tái sử dụng)
│ │ │
│ │ ├── ui/ # 📁 Base UI Components (atomic design)
│ │ │ ├── Button/ # Button component với variants
│ │ │ │ ├── index.tsx
│ │ │ │ ├── Button.module.scss
│ │ │ │ └── Button.stories.tsx # Storybook stories
│ │ │ ├── Input/ # Form inputs
│ │ │ ├── Modal/ # Modal dialogs
│ │ │ ├── Card/ # Card layouts
│ │ │ ├── Badge/ # Status badges
│ │ │ ├── Dropdown/ # Dropdown menus
│ │ │ ├── Tabs/ # Tab navigation
│ │ │ └── Pagination/ # Pagination component
│ │ │
│ │ ├── layout/ # 📁 Layout Components
│ │ │ ├── Header/ # Site header với navigation
│ │ │ │ ├── index.tsx
│ │ │ │ └── Header.module.scss
│ │ │ ├── Footer/ # Site footer
│ │ │ ├── Sidebar/ # Dashboard sidebar
│ │ │ ├── Navigation/ # Navigation components
│ │ │ └── Breadcrumb/ # Breadcrumb navigation
│ │ │
│ │ ├── features/ # 📁 Feature-based Components (business logic)
│ │ │ │
│ │ │ ├── home/ # 🏠 Home page feature
│ │ │ │ ├── components/ # Sub-components cho home
│ │ │ │ │ ├── HeroSection/
│ │ │ │ │ ├── AboutSection/
│ │ │ │ │ ├── ServicesSection/
│ │ │ │ │ ├── ProjectsGallery/
│ │ │ │ │ └── TestimonialsSection/
│ │ │ │ ├── HomePage.tsx # Main home page component
│ │ │ │ └── HomePage.module.scss
│ │ │ │
│ │ │ ├── auth/ # 🔐 Authentication feature
│ │ │ │ ├── components/
│ │ │ │ │ ├── LoginForm/
│ │ │ │ │ ├── RegisterForm/
│ │ │ │ │ ├── ForgotPasswordForm/
│ │ │ │ │ └── SocialLogin/
│ │ │ │ ├── hooks/ # Auth-specific hooks
│ │ │ │ │ ├── useLogin.ts
│ │ │ │ │ ├── useRegister.ts
│ │ │ │ │ └── useAuth.ts
│ │ │ │ └── types/ # Auth types
│ │ │ │
│ │ │ ├── projects/ # 🏗️ Project management feature
│ │ │ │ ├── components/
│ │ │ │ │ ├── ProjectCard/
│ │ │ │ │ ├── ProjectForm/
│ │ │ │ │ ├── ProjectList/
│ │ │ │ │ ├── ProjectTimeline/
│ │ │ │ │ ├── ProgressTracker/
│ │ │ │ │ └── DocumentUpload/
│ │ │ │ ├── hooks/
│ │ │ │ │ ├── useProjects.ts
│ │ │ │ │ ├── useProjectForm.ts
│ │ │ │ │ └── useProjectTimeline.ts
│ │ │ │ └── types/
│ │ │ │ ├── project.types.ts
│ │ │ │ └── timeline.types.ts
│ │ │ │
│ │ │ ├── contractors/ # 👷 Contractor management
│ │ │ │ ├── components/
│ │ │ │ │ ├── ContractorCard/
│ │ │ │ │ ├── ContractorProfile/
│ │ │ │ │ ├── ContractorSearch/
│ │ │ │ │ ├── QuoteRequest/
│ │ │ │ │ └── RatingSystem/
│ │ │ │ ├── hooks/
│ │ │ │ └── types/
│ │ │ │
│ │ │ ├── supervisors/ # 👨‍💼 Supervisor management
│ │ │ │ ├── components/
│ │ │ │ │ ├── SupervisorCard/
│ │ │ │ │ ├── InspectionReport/
│ │ │ │ │ ├── ComplianceCheck/
│ │ │ │ │ └── ReportUpload/
│ │ │ │ ├── hooks/
│ │ │ │ └── types/
│ │ │ │
│ │ │ ├── payments/ # 💰 Payment system
│ │ │ │ ├── components/
│ │ │ │ │ ├── PaymentForm/
│ │ │ │ │ ├── EscrowStatus/
│ │ │ │ │ ├── PaymentHistory/
│ │ │ │ │ └── InvoiceGeneration/
│ │ │ │ ├── hooks/
│ │ │ │ └── types/
│ │ │ │
│ │ │ ├── chat/ # 💬 Communication system
│ │ │ │ ├── components/
│ │ │ │ │ ├── ChatWindow/
│ │ │ │ │ ├── MessageList/
│ │ │ │ │ ├── FileUpload/
│ │ │ │ │ └── NotificationCenter/
│ │ │ │ ├── hooks/
│ │ │ │ └── types/
│ │ │ │
│ │ │ ├── ai-assistant/ # 🤖 AI Advisory system
│ │ │ │ ├── components/
│ │ │ │ │ ├── ChatBot/
│ │ │ │ │ ├── MaterialRecommendation/
│ │ │ │ │ ├── RegulatoryAdvice/
│ │ │ │ │ └── ConstructionDiagnosis/
│ │ │ │ ├── hooks/
│ │ │ │ └── types/
│ │ │ │
│ │ │ └── admin/ # ⚙️ Admin panel features
│ │ │ ├── components/
│ │ │ │ ├── UserManagement/
│ │ │ │ ├── SystemSettings/
│ │ │ │ ├── Analytics/
│ │ │ │ └── ContentModeration/
│ │ │ ├── hooks/
│ │ │ └── types/
│ │ │
│ │ └── shared/ # 📁 Shared Components (dùng chung)
│ │ ├── LoadingSpinner/ # Loading indicators
│ │ ├── ErrorBoundary/ # Error handling
│ │ ├── SEOHead/ # SEO meta tags
│ │ ├── ConfirmDialog/ # Confirmation dialogs
│ │ ├── EmptyState/ # Empty state illustrations
│ │ └── ProtectedRoute/ # Route protection
│ │
│ ├── hooks/ # 📂 Global Custom Hooks
│ │ ├── useAuth.ts # Authentication state
│ │ ├── useLocalStorage.ts # Local storage management
│ │ ├── useDebounce.ts # Input debouncing
│ │ ├── useWebSocket.ts # WebSocket connections
│ │ ├── useInfiniteScroll.ts # Infinite scrolling
│ │ └── useGeolocation.ts # Location services
│ │
│ ├── lib/ # 📂 Libraries & Utilities
│ │ │
│ │ ├── api/ # 🌐 API Client Configuration
│ │ │ ├── client.ts # Axios instance với interceptors
│ │ │ ├── endpoints.ts # API endpoint constants
│ │ │ ├── auth.api.ts # Authentication APIs
│ │ │ ├── projects.api.ts # Project management APIs
│ │ │ ├── contractors.api.ts # Contractor APIs
│ │ │ ├── payments.api.ts # Payment APIs
│ │ │ └── upload.api.ts # File upload APIs
│ │ │
│ │ ├── auth/ # 🔐 Authentication Logic
│ │ │ ├── jwt.ts # JWT token handling
│ │ │ ├── permissions.ts # Role-based permissions
│ │ │ ├── oauth.ts # Google OAuth integration
│ │ │ └── session.ts # Session management
│ │ │
│ │ ├── websocket/ # 🔄 Real-time Communication
│ │ │ ├── signalr.ts # SignalR client
│ │ │ ├── chat.ts # Chat functionality
│ │ │ └── notifications.ts # Real-time notifications
│ │ │
│ │ ├── utils/ # 🛠️ Utility Functions
│ │ │ ├── format.ts # Data formatting (date, currency, etc.)
│ │ │ ├── validate.ts # Form validation helpers
│ │ │ ├── constants.ts # App constants
│ │ │ ├── helpers.ts # General helper functions
│ │ │ ├── localStorage.ts # Local storage utilities
│ │ │ └── upload.ts # File upload utilities
│ │ │
│ │ ├── animations/ # 🎬 GSAP Animation Library
│ │ │ ├── page-transitions.ts # Page transition animations
│ │ │ ├── scroll-animations.ts # Scroll-triggered animations
│ │ │ ├── hover-effects.ts # Interactive hover animations
│ │ │ └── loading-animations.ts # Loading state animations
│ │ │
│ │ └── config/ # ⚙️ Configuration
│ │ ├── app.ts # App configuration
│ │ ├── api.ts # API configuration
│ │ ├── payments.ts # Payment gateway config
│ │ └── upload.ts # File upload config
│ │
│ ├── store/ # 📂 State Management (Zustand)
│ │ ├── auth-store.ts # Authentication state
│ │ ├── project-store.ts # Project data state
│ │ ├── contractor-store.ts # Contractor data state
│ │ ├── ui-store.ts # UI state (modals, sidebar, theme)
│ │ ├── chat-store.ts # Chat messages state
│ │ └── notification-store.ts # Notifications state
│ │
│ ├── styles/ # 📂 Styling (SCSS + Tailwind)
│ │ ├── globals.scss # Global SCSS styles
│ │ ├── variables.scss # SCSS variables (colors, spacing, etc.)
│ │ ├── mixins.scss # SCSS mixins
│ │ ├── animations.scss # CSS animations
│ │ ├── typography.scss # Font styles
│ │ │
│ │ ├── components/ # 📁 Component-specific styles
│ │ │ ├── buttons.scss # Button variations
│ │ │ ├── forms.scss # Form styling
│ │ │ ├── cards.scss # Card components
│ │ │ └── navigation.scss # Navigation styling
│ │ │
│ │ └── pages/ # 📁 Page-specific styles
│ │ ├── home.scss # Home page styles
│ │ ├── auth.scss # Authentication pages
│ │ └── dashboard.scss # Dashboard styles
│ │
│ └── middleware.ts # 🛡️ Next.js Middleware (route protection, redirects)
│
├── docs/ # 📂 Documentation
│ ├── API.md # API documentation
│ ├── DEPLOYMENT.md # Deployment guide
│ ├── ARCHITECTURE.md # System architecture
│ ├── CONTRIBUTING.md # Contribution guidelines
│ └── CHANGELOG.md # Version changes
│
└── tests/ # 📂 Testing
├── components/ # Component tests
├── hooks/ # Hook tests
├── utils/ # Utility function tests
├── pages/ # Page tests
├── setup.ts # Test configuration
└── **mocks**/ # Mock files
