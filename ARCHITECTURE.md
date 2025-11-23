# Project Architecture

## Overview
This is a Next.js 14 construction management platform using TypeScript, Ant Design, and Zustand for state management.

## Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages (login, register, etc.)
│   └── (dashboard)/       # Dashboard and protected pages
│       ├── admin/         # Admin-specific pages
│       ├── contractor/    # Contractor-specific pages
│       ├── supervisor/    # Supervisor-specific pages
│       └── projects/      # Project management pages
│
├── components/            # Reusable UI components
│   ├── common/           # Generic components (Button, Input, etc.)
│   ├── layout/           # Layout components (Header, Sidebar, etc.)
│   └── features/         # Feature-specific components
│
├── config/               # Configuration files
│   └── index.ts         # Centralized configuration
│
├── constants/            # Application constants
│   └── index.ts         # API endpoints, status codes, etc.
│
├── contexts/             # React Context providers
│   └── index.ts         # App-wide contexts
│
├── features/             # Feature-based modules (NEW)
│   └── README.md        # Guidelines for feature organization
│
├── hooks/                # Custom React hooks
│   └── index.ts         # Reusable hooks
│
├── lib/                  # Third-party library configurations
│   └── index.ts         # Axios, API clients, etc.
│
├── providers/            # Provider wrappers
│   └── index.ts         # Combine multiple providers
│
├── services/             # API service layer (NEW)
│   └── index.ts         # HTTP requests and data fetching
│
├── store/                # Zustand state management
│   └── index.ts         # Global state stores
│
├── styles/               # Global styles and CSS modules
│   └── globals.css      # Tailwind and global styles
│
├── types/                # TypeScript type definitions
│   └── index.ts         # Shared types and interfaces
│
├── utils/                # Utility functions (NEW)
│   └── index.ts         # Helper functions
│
├── validators/           # Validation schemas (NEW)
│   └── index.ts         # Form validations
│
└── middleware.ts         # Next.js middleware

```

## Folder Descriptions

### `/app` - Next.js App Router
- Uses route groups `(auth)` and `(dashboard)` for layouts
- Dynamic routes with `[id]` for entity-specific pages
- Server and client components

### `/components` - UI Components
- **common/**: Reusable UI components (buttons, inputs, modals)
- **layout/**: Layout-specific components (header, sidebar, footer)
- **features/**: Feature-specific components

### `/config` - Configuration
- Environment variables
- API base URLs
- Feature flags
- Third-party service configurations

### `/constants` - Constants
- API endpoints
- Status codes
- Role permissions
- Route paths
- Error messages

### `/contexts` - React Contexts
- Theme context
- Authentication context
- Notification context
- Use for app-wide state that doesn't need Zustand

### `/features` - Feature Modules (NEW)
- Self-contained feature modules
- Each feature has its own components, hooks, and services
- Promotes modularity and reusability
- Example: `features/authentication/`, `features/projects/`

### `/hooks` - Custom Hooks
- `useAuth` - Authentication logic
- `usePermissions` - Permission checking
- `useDebounce` - Debouncing
- Feature-specific hooks

### `/lib` - Library Configurations
- Axios instance with interceptors
- API client setup
- Third-party SDK initializations
- SignalR configuration

### `/providers` - Provider Components
- Combines multiple providers
- Theme providers
- Query client providers
- Auth providers

### `/services` - API Services (NEW)
- **Purpose**: Centralized API communication
- **Structure**: One file per resource (auth.service.ts, project.service.ts)
- **Example**:
  ```typescript
  // services/auth.service.ts
  export const authService = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (data) => api.post('/auth/register', data),
    logout: () => api.post('/auth/logout'),
  };
  ```

### `/store` - Zustand Stores
- Global application state
- User state
- UI state (modals, notifications)
- Persisted state

### `/styles` - Styles
- Global CSS
- Tailwind configuration
- CSS modules
- SASS files

### `/types` - TypeScript Types
- Shared interfaces
- API response types
- Entity models
- Utility types

### `/utils` - Utility Functions (NEW)
- **Purpose**: Helper functions and utilities
- **Examples**:
  - `date.utils.ts` - Date formatting and manipulation
  - `format.utils.ts` - String and number formatting
  - `validation.utils.ts` - Custom validation helpers
  - `localStorage.utils.ts` - Browser storage helpers

### `/validators` - Validation Schemas (NEW)
- **Purpose**: Form validation logic
- **Use cases**: Form validation, data validation
- **Examples**:
  - `auth.validators.ts` - Login/register validation
  - `project.validators.ts` - Project form validation
  - `user.validators.ts` - User profile validation

## Design Patterns

### 1. Service Layer Pattern
- Separate API calls from components
- Centralize HTTP logic in `/services`
- Easy to mock for testing

### 2. Feature-Based Organization
- Group related code by feature in `/features`
- Each feature is self-contained
- Easier to scale and maintain

### 3. Barrel Exports
- Use `index.ts` files for clean imports
- Export public APIs only
- Hide implementation details

### 4. Separation of Concerns
- **Components**: UI rendering only
- **Hooks**: Reusable logic
- **Services**: API communication
- **Utils**: Pure functions
- **Validators**: Validation logic

## Adding New Features

When adding a new feature:

1. **Create service file** in `/services`
   ```typescript
   // services/newfeature.service.ts
   export const newFeatureService = {
     getAll: () => api.get('/newfeature'),
     getById: (id) => api.get(`/newfeature/${id}`),
     create: (data) => api.post('/newfeature', data),
   };
   ```

2. **Add types** in `/types`
   ```typescript
   // types/newfeature.types.ts
   export interface NewFeature {
     id: string;
     name: string;
   }
   ```

3. **Create components** in `/components/features/newfeature/`

4. **Add pages** in `/app/(dashboard)/newfeature/`

5. **Create hooks** in `/hooks` (if needed)
   ```typescript
   // hooks/useNewFeature.ts
   export const useNewFeature = () => {
     // Custom logic here
   };
   ```

6. **Add constants** in `/constants`
   ```typescript
   // constants/newfeature.constants.ts
   export const NEW_FEATURE_STATUS = {
     ACTIVE: 'active',
     INACTIVE: 'inactive',
   };
   ```

7. **Add validators** in `/validators` (if forms are needed)
   ```typescript
   // validators/newfeature.validators.ts
   export const validateNewFeature = (data) => {
     // Validation logic
   };
   ```

## Best Practices

1. **Naming Conventions**
   - Components: PascalCase (e.g., `UserProfile.tsx`)
   - Hooks: camelCase with "use" prefix (e.g., `useAuth.ts`)
   - Services: camelCase with ".service" suffix (e.g., `auth.service.ts`)
   - Utils: camelCase with ".utils" suffix (e.g., `date.utils.ts`)
   - Types: PascalCase (e.g., `User`, `Project`)

2. **Import Order**
   ```typescript
   // 1. External libraries
   import { useState } from 'react';
   import { Button } from 'antd';

   // 2. Internal modules
   import { authService } from '@/services';
   import { useAuth } from '@/hooks';

   // 3. Components
   import { Header } from '@/components/layout';

   // 4. Types
   import type { User } from '@/types';

   // 5. Styles
   import styles from './styles.module.css';
   ```

3. **File Organization**
   - Keep files under 300 lines
   - One component per file
   - Co-locate related files
   - Use barrel exports

4. **TypeScript**
   - Always use types/interfaces
   - Avoid `any` type
   - Use strict mode
   - Define return types

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: Ant Design
- **State Management**: Zustand
- **API Client**: Axios
- **Real-time**: SignalR
- **Styling**: Tailwind CSS + SASS
- **3D Rendering**: Three.js
- **Charts**: Recharts
- **Data Fetching**: SWR

## Configuration Files

- `next.config.js` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `.env.local` - Environment variables

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

4. Type check:
   ```bash
   npm run type-check
   ```

## Future Improvements

- Add unit tests (Jest + React Testing Library)
- Add E2E tests (Playwright)
- Implement code splitting
- Add performance monitoring
- Improve error handling
- Add logging system
- Implement feature flags
