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
├── next.config.js, tailwind.config.js, tsconfig.json, package.json
├── README.md, .gitignore, package-lock.json
├── public/
│ ├── favicon.ico
│ └── images/
│ ├── page/homePage/ (bgHome.png, layout1.png)
│ ├── projects/ (project1.jpg … project6.jpg)
│ ├── about/ (construction1.jpg, construction2.jpg)
│ ├── avatars/
│ └── vision/ (city-view.jpg)
├── types/
│ ├── sass.d.ts, gsap.d.ts, global.d.ts
├── docs/
│ ├── API.md, DEPLOYMENT.md, ARCHITECTURE.md
├── src/
│ ├── app/
│ │ ├── globals.css, layout.tsx, page.tsx, loading.tsx, error.tsx, not-found.tsx
│ │ ├── (auth)/
│ │ │ ├── login/page.tsx, register/page.tsx
│ │ │ ├── forgot-password/page.tsx, verify-email/page.tsx
│ │ │ └── layout.tsx
│ │ ├── (dashboard)/
│ │ │ ├── layout.tsx
│ │ │ ├── admin/ (dashboard, users, projects, reports)
│ │ │ ├── contractors/ (dashboard, leads, projects)
│ │ │ ├── supervisor/ (dashboard, inspections, projects)
│ │ │ ├── profile/page.tsx
│ │ │ └── projects/ (list, create, [id]/ with sections)
│ │ ├── chat/page.tsx
│ │ ├── contractors/ (public list + [id])
│ │ ├── supervisors/ (public list + [id])
│ │ ├── view-contractors/ (list + [id])
│ │ ├── about/, contact/, news/
│ │ └── api/
│ │ ├── auth/callback/route.ts
│ │ ├── projects/
│ │ └── webhooks/
│ ├── components/
│ │ ├── ui/ (Button, Input, Modal, Card, Badge, Dropdown, Tabs, Pagination, index.ts)
│ │ ├── layout/ (Header, Footer, Sidebar, Navigation, Breadcrumb, ConditionalLayout)
│ │ ├── features/
│ │ │ ├── home/, auth/, projects/, contractors/, supervisors/, payments/, chat/, ai-assistant/, admin/, quotes/
│ │ │ └── quotes/ (QuoteSendButton.tsx, QuoteSendModal.tsx)
│ │ └── shared/ (AIChatAssistant, LoadingSpinner, ErrorBoundary, SEOHead, ConfirmDialog, EmptyState, ProtectedRoute, RoleBasedRoute)
│ ├── hooks/ (useAuth.ts, useDebounce.ts, useProjects.ts, useRoleRedirect.ts)
│ ├── lib/
│ │ ├── api/ (client.ts, chat.ts, contractors.ts, supervisors.ts)
│ │ ├── auth/ (auth.api.ts, permissions.ts)
│ │ ├── contracts/ (contracts.api.ts)
│ │ ├── profile/ (profile.api.ts)
│ │ ├── projects/ (project.types.ts, projects.api.ts)
│ │ ├── proposals/ (proposal.types.ts, proposals.api.ts, proposals.homeowner.api.ts)
│ │ ├── quotes/ (quote.types.ts, quotes.api.ts, quotes.contractor.api.ts)
│ │ ├── websocket/ (signalr-client.ts)
│ │ └── utils/ (constants.ts, roleRouting.ts)
│ ├── providers/ (AuthProvider.tsx, index.ts)
│ ├── store/ (contractor-store.ts)
│ ├── styles/ (variables.scss, EmailVerificationPage.module.scss, ForgotPasswordPage.module.scss, LoginPage.module.scss, RegisterPage.module.scss, components/, pages/)
│ └── middleware.ts
├── tests/ (setup.ts, **mocks**/, components/, hooks/, pages/, utils/)
└── next-env.d.ts
