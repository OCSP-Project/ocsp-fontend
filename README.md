
npm run dev
# open http://localhost:3000
```

npx vercel --prod - Đẩy thẳng từ máy. Bỏ qua GitHub, ép Vercel lấy code trong máy bạn để build Production ngay lập tức
npx vercel login - Đăng nhập lại vào Vercel CLI khi phiên làm việc hết hạn
npx vercel logs

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
├── next.config.js, tailwind.config.js, tsconfig.json, package.json, package-lock.json
├── README.md, next-env.d.ts
├── public/
│ ├── favicon.ico
│ └── images/
│ ├── page/homePage/ (bgHome.png, layout1.png)
│ ├── projects/ (project1.jpg … project6.jpg)
│ ├── about/ (construction1.jpg, construction2.jpg)
│ ├── avatars/
│ └── vision/ (city-view.jpg)
├── docs/ (API.md, DEPLOYMENT.md, ARCHITECTURE.md, 3D_MODEL_TRACKING.md)
├── src/
│ ├── app/
│ │ ├── globals.css, layout.tsx, page.tsx, loading.tsx, error.tsx, not-found.tsx
│ │ ├── (auth)/ (login, register, forgot-password, verify-email, layout)
│ │ ├── (dashboard)/
│ │ │ ├── layout.tsx
│ │ │ ├── admin/ (dashboard + users, projects, reports)
│ │ │ ├── contractor/ (dashboard + leads, posts, projects)
│ │ │ ├── supervisor/ (dashboard + inspections, projects)
│ │ │ ├── profile/page.tsx
│ │ │ └── projects/ (list, create, [id]/ with sections)
│ │ ├── chat/page.tsx
│ │ ├── about/, contact/, news/
│ │ ├── supervisors/ (list + [id])
│ │ ├── view-contractors/ (list + [id])
│ │ └── api/
│ │ ├── auth/callback/route.ts
│ │ └── webhooks/
│ ├── components/
│ │ ├── ui/ (Button, Input, Modal, Card, Badge, Dropdown, Tabs, Pagination, index.ts)
│ │ ├── layout/ (Header, Footer, Sidebar, Navigation, Breadcrumb, ConditionalLayout)
│ │ ├── features/ (home, auth, projects, contractors, supervisors, payments, chat, ai-assistant, admin, quotes, contracts, proposals)
│ │ └── shared/ (AIChatAssistant, LoadingSpinner, ErrorBoundary, SEOHead, ConfirmDialog, EmptyState, ProtectedRoute, RoleBasedRoute)
│ ├── hooks/ (useAuth.ts, useDebounce.ts, useProjects.ts, useRoleRedirect.ts)
│ ├── lib/
│ │ ├── api/ (client.ts, chat.ts, contractors.ts, supervisors.ts)
│ │ ├── auth/ (auth.api.ts, permissions.ts)
│ │ ├── contractors/ (contractor-posts.api.ts, contractor-posts.types.ts)
│ │ ├── contracts/ (contracts.api.ts)
│ │ ├── profile/ (profile.api.ts)
│ │ ├── projects/ (project.types.ts, projects.api.ts)
│ │ ├── proposals/ (proposal.types.ts, proposals.api.ts, proposals.homeowner.api.ts)
│ │ ├── quotes/ (quote.types.ts, quotes.api.ts, quotes.contractor.api.ts)
│ │ ├── resources/ (project-daily-resource.api.ts)
│ │ ├── timeline/ (timeline.api.ts)
│ │ ├── ocr/ (permitOcr.ts)
│ │ ├── model-analysis/ (model-analysis.api.ts)
│ │ ├── websocket/ (signalr-client.ts)
│ │ └── utils/ (constants.ts, jwt.ts, roleRouting.ts)
│ ├── providers/ (AuthProvider.tsx, index.ts)
│ ├── store/ (contractor-store.ts)
│ ├── styles/ (variables.scss, EmailVerificationPage.module.scss, ForgotPasswordPage.module.scss, LoginPage.module.scss, RegisterPage.module.scss, components/, pages/)
│ ├── types/ (model-tracking.types.ts)
│ └── middleware.ts
├── tests/ (setup.ts, **mocks**/, components/, hooks/, pages/, utils/)
└── types/ (global.d.ts, gsap.d.ts, sass.d.ts)
