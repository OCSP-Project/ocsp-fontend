# Migration Guide - Scaled Architecture

This guide will help you migrate your existing code to use the new scaled architecture.

## Overview of Changes

We've reorganized the project with these new directories:
- `/services` - Centralized API service layer
- `/utils` - Utility functions
- `/constants` - Application constants
- `/contexts` - React contexts
- `/features` - Feature-based modules
- `/config` - Configurations
- `/validators` - Form validators

## Step-by-Step Migration

### 1. Update Imports

#### Before:
```typescript
import { authApi } from '@/lib/auth/auth.api';
import apiClient from '@/lib/api/client';
```

#### After:
```typescript
import { authService } from '@/services';
import apiClient from '@/lib/api/client';
```

### 2. Migrate API Calls

#### Before (using lib/auth/auth.api.ts):
```typescript
const response = await authApi.login({ email, password });
```

#### After (using services/auth.service.ts):
```typescript
const response = await authService.login({ email, password });
```

### 3. Use Constants Instead of Hardcoded Values

#### Before:
```typescript
if (user.role === 'homeowner') {
  // do something
}
```

#### After:
```typescript
import { USER_ROLES } from '@/constants';

if (user.role === USER_ROLES.HOMEOWNER) {
  // do something
}
```

### 4. Use Utility Functions

#### Before:
```typescript
const formattedDate = new Date(date).toLocaleDateString();
const price = `$${amount.toFixed(2)}`;
```

#### After:
```typescript
import { formatDate, formatCurrency } from '@/utils';

const formattedDate = formatDate(date, 'short');
const price = formatCurrency(amount, 'USD');
```

### 5. Use Validators

#### Before:
```typescript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  setError('Invalid email');
}
```

#### After:
```typescript
import { validateLogin } from '@/validators';

const validation = validateLogin({ email, password });
if (!validation.isValid) {
  setErrors(validation.errors);
}
```

### 6. Use Path Aliases

The project now has enhanced path aliases. You can import directly:

```typescript
// Old way
import { Button } from '../../components/common/Button';

// New way
import { Button } from '@/components/common/Button';

// Even better with specific aliases
import { formatDate } from '@/utils/date.utils';
import { projectService } from '@/services/project.service';
import { PROJECT_STATUS } from '@/constants/status.constants';
```

### 7. Use Config Instead of Environment Variables

#### Before:
```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

#### After:
```typescript
import { config } from '@/config';

const apiUrl = config.apiUrl;
const isDebug = config.debugMode;
```

## Migration Checklist

### Components
- [ ] Update all API calls to use new services
- [ ] Replace hardcoded constants with imports from `/constants`
- [ ] Use utility functions for formatting and validation
- [ ] Update imports to use path aliases

### Pages
- [ ] Update API calls in page components
- [ ] Use validators for form validation
- [ ] Replace direct env variable access with config
- [ ] Update route references to use route constants

### Hooks
- [ ] Migrate custom hooks to use new services
- [ ] Use utility functions where applicable
- [ ] Update type imports

### API Integration
- [ ] Replace `lib/auth/auth.api.ts` calls with `services/auth.service.ts`
- [ ] Replace `lib/projects/projects.api.ts` calls with `services/project.service.ts`
- [ ] Replace `lib/contractors/contractor-posts.api.ts` calls with `services/contractor.service.ts`
- [ ] Continue for all other API modules

## Example Migration

### Before:
```typescript
// pages/login.tsx
import { authApi } from '@/lib/auth/auth.api';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Manual validation
    if (!email) {
      setErrors({ email: 'Email is required' });
      return;
    }

    try {
      const response = await authApi.login({ email, password });
      localStorage.setItem('accessToken', response.accessToken);
      window.location.href = '/dashboard';
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  );
}
```

### After:
```typescript
// pages/login.tsx
import { authService } from '@/services';
import { validateLogin } from '@/validators';
import { setLocalStorage } from '@/utils';
import { AUTH_ROUTES, DASHBOARD_ROUTES } from '@/constants';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Use validator
    const validation = validateLogin({ email, password });
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      const response = await authService.login({ email, password });
      setLocalStorage('accessToken', response.accessToken);
      setLocalStorage('user', response.user);
      router.push(DASHBOARD_ROUTES.HOME);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  );
}
```

## Benefits of Migration

1. **Cleaner Code**: Centralized services and utilities
2. **Type Safety**: Better TypeScript support
3. **Consistency**: Standardized patterns across the app
4. **Maintainability**: Easier to find and update code
5. **Scalability**: Easy to add new features
6. **Reusability**: Shared utilities and validators

## Common Pitfalls

1. **Don't mix old and new patterns** - Migrate completely or not at all
2. **Update all imports** - Use the new path aliases consistently
3. **Check type definitions** - Some types have moved to `/types`
4. **Test thoroughly** - Ensure all functionality works after migration

## Need Help?

- Check `ARCHITECTURE.md` for detailed architecture documentation
- Review the example files in each new directory
- Look at the inline comments in service files

## Gradual Migration Strategy

If you can't migrate everything at once:

1. **Start with utilities**: Replace manual formatting with utils
2. **Move to constants**: Replace hardcoded values
3. **Migrate services**: One feature at a time
4. **Add validators**: As you touch each form
5. **Update imports**: Use path aliases throughout

This approach lets you migrate incrementally while maintaining functionality.
